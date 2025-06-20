// src/services/authService.js

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000/api'  // 開發環境
  : '/api';                      // 生產環境 (Vercel)

class AuthService {
  // 建立請求頭
  getHeaders(includeAuth = false) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // 處理 API 響應
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // 自動重試機制（針對 token 過期）
  async makeRequest(url, options = {}) {
    try {
      const response = await fetch(url, options);
      
      // 如果是 401 錯誤，嘗試刷新 token
      if (response.status === 401 && localStorage.getItem('refreshToken')) {
        const refreshSuccess = await this.refreshToken();
        if (refreshSuccess) {
          // 重新發送原請求
          const newHeaders = {
            ...options.headers,
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          };
          const retryResponse = await fetch(url, {
            ...options,
            headers: newHeaders,
          });
          return this.handleResponse(retryResponse);
        }
      }
      
      return this.handleResponse(response);
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // 登入
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    const result = await this.handleResponse(response);
    
    // 後端回應結構：{ success: true, data: { accessToken, refreshToken, user } }
    return result.data || result;
  }

  // 登出
  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      return; // 如果沒有 refresh token，直接返回
    }

    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      console.error('Logout API error:', error);
      // 即使 API 調用失敗，仍然清除本地 token
    }
  }

  // 刷新 Token
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ refreshToken }),
      });

      const data = await this.handleResponse(response);
      
      // 後端回應結構：{ success: true, data: { accessToken, refreshToken? } }
      const tokenData = data.data || data;
      
      // 更新本地儲存的 tokens
      localStorage.setItem('accessToken', tokenData.accessToken);
      if (tokenData.refreshToken) {
        localStorage.setItem('refreshToken', tokenData.refreshToken);
      }

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // 清除無效的 tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      return false;
    }
  }

  // 獲取當前用戶資料
  async getCurrentUser() {
    const url = `${API_BASE_URL}/auth/me`;
    const options = {
      method: 'GET',
      headers: this.getHeaders(true),
    };

    const result = await this.makeRequest(url, options);
    
    // 後端回應結構：{ success: true, data: user }
    return result.data || result;
  }

  // 檢查登入狀態
  isLoggedIn() {
    const token = localStorage.getItem('accessToken');
    return !!token;
  }

  // 獲取當前用戶角色
  getCurrentUserRole() {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    try {
      // 解析 JWT token (簡單版，不驗證簽名)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    } catch (error) {
      console.error('Failed to parse token:', error);
      return null;
    }
  }

  // 檢查 token 是否過期
  isTokenExpired() {
    const token = localStorage.getItem('accessToken');
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Failed to check token expiration:', error);
      return true;
    }
  }

  // 管理員相關 API

  // 創建用戶（管理員專用）
  async createUser(userData) {
    const url = `${API_BASE_URL}/admin/users`;
    const options = {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(userData),
    };

    return this.makeRequest(url, options);
  }

  // 獲取用戶列表（管理員專用）
  async getUsers(page = 1, limit = 10, role = null) {
    let url = `${API_BASE_URL}/admin/users?page=${page}&limit=${limit}`;
    if (role) {
      url += `&role=${role}`;
    }
    
    const options = {
      method: 'GET',
      headers: this.getHeaders(true),
    };

    return this.makeRequest(url, options);
  }

  // 更新用戶（管理員專用）
  async updateUser(userId, userData) {
    const url = `${API_BASE_URL}/admin/users/${userId}`;
    const options = {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(userData),
    };

    return this.makeRequest(url, options);
  }

  // 刪除用戶（管理員專用）
  async deleteUser(userId) {
    const url = `${API_BASE_URL}/admin/users/${userId}`;
    const options = {
      method: 'DELETE',
      headers: this.getHeaders(true),
    };

    return this.makeRequest(url, options);
  }
}

// 創建並導出單例
const authService = new AuthService();
export default authService;