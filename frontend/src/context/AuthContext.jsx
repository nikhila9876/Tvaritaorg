import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { auth } from '../api';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: null,
  loading: true,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case 'LOGOUT':
      return { ...initialState, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /* Restore session from localStorage on mount */
  useEffect(() => {
    const token = localStorage.getItem('tvarita_token');
    const userStr = localStorage.getItem('tvarita_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
        // Verify token is still valid
        auth.me().then((res) => {
          dispatch({ type: 'UPDATE_USER', payload: res.data.user || res.data });
        }).catch(() => {
          localStorage.removeItem('tvarita_token');
          localStorage.removeItem('tvarita_user');
          dispatch({ type: 'LOGOUT' });
        });
      } catch {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = useCallback(async (credentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await auth.login(credentials);
      const { token, user } = res.data;
      localStorage.setItem('tvarita_token', token);
      localStorage.setItem('tvarita_user', JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user } });
      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  }, []);

  const register = useCallback(async (data) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await auth.register(data);
      const { token, user } = res.data;
      if (token) {
        localStorage.setItem('tvarita_token', token);
        localStorage.setItem('tvarita_user', JSON.stringify(user));
        dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user } });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
      return { success: true, requiresOtp: !token };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed.';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(() => {
    auth.logout().catch(() => {});
    localStorage.removeItem('tvarita_token');
    localStorage.removeItem('tvarita_user');
    dispatch({ type: 'LOGOUT' });
  }, []);

  const updateUser = useCallback((updates) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
    const userStr = localStorage.getItem('tvarita_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        localStorage.setItem('tvarita_user', JSON.stringify({ ...user, ...updates }));
      } catch {}
    }
  }, []);

  const isRole = useCallback((...roles) => {
    return roles.some((r) => state.user?.role === r);
  }, [state.user]);

  const value = {
    ...state,
    isAuthenticated: !!state.token && !state.loading,
    login,
    register,
    logout,
    updateUser,
    isRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
