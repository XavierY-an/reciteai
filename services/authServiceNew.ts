import { apiClient } from './apiClient';
import { User } from '../types';

interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

interface ProfileResponse {
  user: User;
}

export const authService = {
  // 注册
  async register(name: string, email: string, password: string): Promise<User> {
    const response: AuthResponse = await apiClient.post('/api/auth/register', {
      name,
      email,
      password,
    });

    apiClient.setToken(response.token);
    return response.user;
  },

  // 登录
  async login(email: string, password: string): Promise<User> {
    const response: AuthResponse = await apiClient.post('/api/auth/login', {
      email,
      password,
    });

    apiClient.setToken(response.token);
    return response.user;
  },

  // 获取当前用户
  async getCurrentUser(): Promise<User | null> {
    try {
      const response: ProfileResponse = await apiClient.get('/api/auth/profile');
      return response.user;
    } catch (error) {
      return null;
    }
  },

  // 更新用户信息
  async updateProfile(user: User): Promise<User> {
    const response: ProfileResponse = await apiClient.put('/api/auth/profile', {
      name: user.name,
      avatar: user.avatar,
    });
    return response.user;
  },

  // 升级 Pro
  async upgradePro(): Promise<User> {
    const response: ProfileResponse = await apiClient.post('/api/auth/upgrade');
    return response.user;
  },

  // 登出
  logout() {
    apiClient.clearToken();
  },
};
