
import { User } from '../types';
import { authService } from './authService';

export const paymentService = {
  // 1. Create Order
  createOrder: async (userId: string, planId: string): Promise<{ orderId: string, qrCodeUrl: string }> => {
    // REAL WORLD: await axios.post('/api/orders', { planId })
    // Returns a WeChat Pay Native QR Code URL (code_url)
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          orderId: `ord_${Date.now()}`,
          // In real life, this comes from WeChat Pay API
          qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=wxp://f2f0dd1RSz...', 
        });
      }, 600);
    });
  },

  // 2. Check Payment Status (Polling)
  checkPaymentStatus: async (orderId: string): Promise<'PENDING' | 'SUCCESS' | 'FAILED'> => {
    // REAL WORLD: await axios.get(`/api/orders/${orderId}/status`)
    
    // Simulate random success for demo
    return new Promise((resolve) => {
      const status = Math.random() > 0.7 ? 'SUCCESS' : 'PENDING';
      setTimeout(() => {
        resolve(status);
      }, 300);
    });
  },

  // 3. Mock Upgrade (For demo only)
  mockUpgradeUser: async (currentUser: User): Promise<User> => {
     const upgradedUser = { ...currentUser, isPro: true };
     await authService.updateProfile(upgradedUser);
     return upgradedUser;
  }
};
