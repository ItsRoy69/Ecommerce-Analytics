export const AUTH_STORAGE_KEY = 'ecommerce_analytics_shop';
export const SAMPLE_SHOPS = ['Fashion Store', 'Electronics Hub', 'Home Goods'];

export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  SHOP_DATA: (shopId) => `/api/shop/${shopId}/data`,
};

export const REDUX_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
};

export const ANALYTICS_TABS = {
  SALES: 'sales',
  PRICE: 'price',
};

export const DATE_FORMATS = {
  MONTH_YEAR: 'MM/YYYY',
};

export const CHART_COLORS = {
  REVENUE: '#3b82f6',
  UNITS: '#10b981',  
  TREND: '#6366f1',  
  PRICE: '#f59e0b', 
};

export const UI = {
  PAGE_SIZE: 10,
  MOBILE_BREAKPOINT: 640,
  TABLET_BREAKPOINT: 768,
  DESKTOP_BREAKPOINT: 1024,
};

export const ERROR_MESSAGES = {
  AUTHENTICATION_FAILED: 'Authentication failed. Please check your shop name and try again.',
  FETCH_DATA_FAILED: 'Failed to fetch data. Please try again later.',
  NO_SHOP_ID: 'No shop ID available for fetching data',
};

export const SUCCESS_MESSAGES = {
  AUTHENTICATION_SUCCESS: 'Authentication successful!',
}; 