
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/auth/me');
          
          // ✅ FIXED: Ensure user has both _id and id for compatibility
          const userData = {
            ...response.data,
            _id: response.data._id || response.data.id,
            id: response.data._id || response.data.id
          };
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: userData,
              token
            }
          });
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initAuth();
  }, []);

  const login = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      let response;
      
      if (userData.isEmailAuth) {
        // Handle email authentication
        response = await api.post('/auth/email', {
          email: userData.email,
          password: userData.password,
          name: userData.name,
          isSignup: userData.isSignup
        });
      } else {
        // Handle Google OAuth
        response = await api.post('/auth/google', userData);
      }
      
      const { token, user } = response.data;
      
      // ✅ FIXED: Ensure user has both _id and id for compatibility
      const fixedUser = {
        ...user,
        _id: user._id || user.id,
        id: user._id || user.id
      };

      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: fixedUser, token }
      });

      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return {
        success: false,
        error: error.response?.data?.message || 'Authentication failed'
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateUser = (userData) => {
    // ✅ FIXED: Ensure updated user data has both _id and id
    const fixedUserData = {
      ...userData,
      _id: userData._id || userData.id,
      id: userData._id || userData.id
    };
    
    dispatch({ type: 'UPDATE_USER', payload: fixedUserData });
  };

  const value = {
    ...state,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};