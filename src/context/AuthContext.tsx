import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginPayload, SignupPayload } from '@/types';
import { authAPI } from '@/services/api';
import { storage } from '@/utils/helpers';
import toast from 'react-hot-toast';

interface AuthContextType extends AuthState {
  login:  (payload: LoginPayload)  => Promise<{ success: boolean; error?: string; user?: any }>;
  signup: (payload: SignupPayload) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user:            action.payload.user,
        token:           action.payload.token,
        isAuthenticated: true,
        isLoading:       false,
      };
    case 'LOGOUT':
      return { user: null, token: null, isAuthenticated: false, isLoading: false };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user:            storage.get<User>('rb_user'),
  token:           storage.get<string>('rb_token'),
  isAuthenticated: !!storage.get<string>('rb_token'),
  isLoading:       false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = storage.get<string>('rb_token');
    const user  = storage.get<User>('rb_user');
    if (token && user) {
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
    }
  }, []);

  const login = async (
    payload: LoginPayload
  ): Promise<{ success: boolean; error?: string; user?: any }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authAPI.login(payload);

      // ✅ FIX: store full user object INCLUDING role field
      storage.set('rb_token', response.token);
      storage.set('rb_user',  response.user);

      dispatch({
        type:    'LOGIN_SUCCESS',
        payload: { user: response.user, token: response.token },
      });

      toast.success(`Welcome back, ${response.user.name}! 🎉`);

      // ✅ FIX: return user so LoginPage can check role for redirect
      return { success: true, user: response.user };
    } catch (err: unknown) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
      return { success: false, error: message };
    }
  };

  const signup = async (
    payload: SignupPayload
  ): Promise<{ success: boolean; error?: string }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authAPI.signup(payload);
      storage.set('rb_token', response.token);
      storage.set('rb_user',  response.user);
      dispatch({
        type:    'LOGIN_SUCCESS',
        payload: { user: response.user, token: response.token },
      });
      toast.success(`Welcome to redBus, ${response.user.name}! 🚌`);
      return { success: true };
    } catch (err: unknown) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const message = err instanceof Error ? err.message : 'Signup failed. Please try again.';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    authAPI.logout();
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};