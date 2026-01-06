
// This file manages configuration for different environments (Dev vs Prod)

const isProd = process.env.NODE_ENV === 'production';

export const config = {
  // When you deploy your backend, replace this URL
  API_BASE_URL: isProd ? 'https://api.your-domain.com' : 'http://localhost:3000',
  
  // Feature flags
  ENABLE_MOCK_DATA: true, // Set to false when backend is ready
  
  // External Service Configs (Public keys only!)
  WECHAT_APP_ID: 'wx_sample_app_id', 
};
