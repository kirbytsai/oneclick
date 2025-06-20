// src/services/proposalService.js

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000/api'
  : '/api';

class ProposalService {
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
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // 獲取提案列表
  async getProposals(params = {}) {
    try {
      const queryString = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryString.append(key, value);
        }
      });

      const url = `${API_BASE_URL}/proposals${queryString.toString() ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('proposalService.getProposals error:', error);
      throw error;
    }
  }

  // 獲取搜索過濾選項
  async getSearchFilters() {
    try {
      const response = await fetch(`${API_BASE_URL}/proposals/search/filters`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('proposalService.getSearchFilters error:', error);
      throw error;
    }
  }

  // 獲取單個提案詳情
  async getProposal(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/proposals/${id}`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('proposalService.getProposal error:', error);
      throw error;
    }
  }

  // 高級搜索
  async searchProposals(searchData) {
    try {
      console.log('發送搜索請求:', searchData);
      const response = await fetch(`${API_BASE_URL}/proposals/search`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(searchData),
      });

      const result = await this.handleResponse(response);
      console.log('搜索結果:', result);
      return result;
    } catch (error) {
      console.error('proposalService.searchProposals error:', error);
      throw error;
    }
  }

  // 表達興趣
  async expressInterest(proposalId, interestData) {
    try {
      const response = await fetch(`${API_BASE_URL}/submissions/proposals/${proposalId}/interest`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(interestData),
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('proposalService.expressInterest error:', error);
      throw error;
    }
  }

  // 獲取提案的互動統計 (提案方專用)
  async getProposalStats(proposalId) {
    try {
      const response = await fetch(`${API_BASE_URL}/submissions/proposals/${proposalId}/stats`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('proposalService.getProposalStats error:', error);
      throw error;
    }
  }

  // 獲取提案的評論列表
  async getProposalComments(proposalId, params = {}) {
    try {
      const queryString = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryString.append(key, value);
        }
      });

      const url = `${API_BASE_URL}/submissions/proposals/${proposalId}/comments${queryString.toString() ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('proposalService.getProposalComments error:', error);
      throw error;
    }
  }

  // 添加評論
  async addComment(proposalId, commentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/submissions/proposals/${proposalId}/comments`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(commentData),
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('proposalService.addComment error:', error);
      throw error;
    }
  }

  // 獲取提案方的所有提案 (提案方專用)
  async getMyProposals(params = {}) {
    try {
      const queryString = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryString.append(key, value);
        }
      });

      const url = `${API_BASE_URL}/proposals${queryString.toString() ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('proposalService.getMyProposals error:', error);
      throw error;
    }
  }

  // 獲取提案方統計分析 (提案方專用)
  async getSellerAnalytics() {
    try {
      const response = await fetch(`${API_BASE_URL}/submissions/seller/analytics`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('proposalService.getSellerAnalytics error:', error);
      throw error;
    }
  }

  // 獲取提案方的發送記錄 (提案方專用)
  async getSellerSubmissions(params = {}) {
    try {
      const queryString = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryString.append(key, value);
        }
      });

      const url = `${API_BASE_URL}/submissions/seller/submissions${queryString.toString() ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('proposalService.getSellerSubmissions error:', error);
      throw error;
    }
  }

  // 提交提案審核 (提案方專用)
  async submitProposalForReview(proposalId) {
    try {
      const response = await fetch(`${API_BASE_URL}/proposals/${proposalId}/submit`, {
        method: 'POST',
        headers: this.getHeaders(true),
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('proposalService.submitProposalForReview error:', error);
      throw error;
    }
  }

  // 發布提案 (管理員/提案方)
  async publishProposal(proposalId) {
    try {
      const response = await fetch(`${API_BASE_URL}/proposals/${proposalId}/publish`, {
        method: 'POST',
        headers: this.getHeaders(true),
      });

    } catch (error) {
      console.error('proposalService.publishProposal error:', error);
      throw error;
    }
  }

  // 創建提案 (提案方專用)
  async createProposal(proposalData) {
    try {
      console.log('發送創建提案請求:', proposalData);
      const response = await fetch(`${API_BASE_URL}/proposals`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(proposalData),
      });

      const result = await this.handleResponse(response);
      console.log('創建提案回應:', result);
      return result;
    } catch (error) {
      console.error('proposalService.createProposal error:', error);
      throw error;
    }
  }

  // 更新提案 (提案方專用)
  async updateProposal(proposalId, proposalData) {
    try {
      const response = await fetch(`${API_BASE_URL}/proposals/${proposalId}`, {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify(proposalData),
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('proposalService.updateProposal error:', error);
      throw error;
    }
  }

  // 創建提案 (提案方專用)
  async createProposal(proposalData) {
    try {
      console.log('發送創建提案請求:', proposalData);
      const response = await fetch(`${API_BASE_URL}/proposals`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(proposalData),
      });

      const result = await this.handleResponse(response);
      console.log('創建提案回應:', result);
      return result;
    } catch (error) {
      console.error('proposalService.createProposal error:', error);
      throw error;
    }
  }

  // 更新提案 (提案方專用)
  async updateProposal(proposalId, proposalData) {
    try {
      const response = await fetch(`${API_BASE_URL}/proposals/${proposalId}`, {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify(proposalData),
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('proposalService.updateProposal error:', error);
      throw error;
    }
  }
}

// 創建實例並導出
const proposalService = new ProposalService();

export { proposalService };