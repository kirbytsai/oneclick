// src/contexts/AuthContext.js
import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import authService from '../services/authService';

// 認證狀態
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
};

// Reducer
function authReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    
    case ActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    
    case ActionTypes.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    
    case ActionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    
    case ActionTypes.UPDATE_USER:
      return {
        ...state,
        user: action.payload,
      };
    
    default:
      return state;
  }
}

// AuthContext
const AuthContext = createContext();

// AuthProvider 組件
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 初始化 - 檢查是否已登入
  useEffect(() => {
    async function initializeAuth() {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const userData = await authService.getCurrentUser();
          dispatch({
            type: ActionTypes.LOGIN_SUCCESS,
            payload: { user: userData },
          });
        } else {
          dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Authentication initialization failed:', error);
        // 清除無效的 token
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    }

    initializeAuth();
  }, []);

  // 登入
  const login = async (email, password) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      
      const response = await authService.login(email, password);
      
      // 儲存 tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      dispatch({
        type: ActionTypes.LOGIN_SUCCESS,
        payload: { user: response.user },
      });
      
      return { success: true };
    } catch (error) {
      dispatch({
        type: ActionTypes.LOGIN_FAILURE,
        payload: error.message || '登入失敗',
      });
      return { success: false, error: error.message };
    }
  };

  // 登出
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // 清除本地儲存
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      dispatch({ type: ActionTypes.LOGOUT });
    }
  };

  // 清除錯誤
  const clearError = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  }, []);

  // 更新用戶資料
  const updateUser = useCallback(async () => {
    try {
      const userData = await authService.getCurrentUser();
      dispatch({
        type: ActionTypes.UPDATE_USER,
        payload: userData,
      });
    } catch (error) {
      console.error('Failed to update user data:', error);
    }
  }, []);

  // 檢查用戶權限
  const hasRole = useCallback((role) => {
    return state.user?.role === role;
  }, [state.user?.role]);

  const isAdmin = useCallback(() => hasRole('admin'), [hasRole]);
  const isBuyer = useCallback(() => hasRole('buyer'), [hasRole]);
  const isSeller = useCallback(() => hasRole('seller'), [hasRole]);

  const value = {
    // 狀態
    ...state,
    
    // 方法
    login,
    logout,
    clearError,
    updateUser,
    
    // 權限檢查
    hasRole,
    isAdmin,
    isBuyer,
    isSeller,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// useAuth Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;