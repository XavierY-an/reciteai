
import { User } from '../types';
import { config } from '../config';

// Mock storage key
const STORAGE_KEY = 'reciteai_user_session';

export const authService = {
  // 1. Check current session
  getCurrentUser: async (): Promise<User | null> => {
    // In a real app, this might call /api/me
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  // 2. Login with Phone (Simulation)
  loginWithPhone: async (phone: string, code: string): Promise<User> => {
    // REAL WORLD: await axios.post(`${config.API_BASE_URL}/auth/login/phone`, { phone, code })
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (code !== '1234') {
          reject(new Error('验证码错误'));
          return;
        }

        const mockUser: User = {
          id: `u_${phone}`,
          name: `用户 ${phone.slice(-4)}`,
          avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${phone}&backgroundColor=ffdfbf`,
          isPro: false,
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
        resolve(mockUser);
      }, 800);
    });
  },

  // 3. Login with WeChat (Simulation)
  loginWithWeChat: async (): Promise<User> => {
    // REAL WORLD: 
    // 1. Redirect to WeChat QR page: window.location.href = `https://open.weixin.qq.com/...`
    // 2. Or Poll for scan status
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser: User = {
          id: 'u_wx_888',
          name: '微信用户',
          avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=WeChat&backgroundColor=b6e3f4',
          isPro: false
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
        resolve(mockUser);
      }, 1500);
    });
  },

  // 4. Update Profile
  updateProfile: async (user: User): Promise<User> => {
    // REAL WORLD: await axios.put(`${config.API_BASE_URL}/users/${user.id}`, user)
    
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        resolve(user);
      }, 500);
    });
  },

  // 5. Logout
  logout: async (): Promise<void> => {
    // REAL WORLD: await axios.post(`${config.API_BASE_URL}/auth/logout`)
    localStorage.removeItem(STORAGE_KEY);
  }
};
