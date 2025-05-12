import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import salesReducer from './slices/salesSlice';
import priceReducer from './slices/priceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    sales: salesReducer,
    price: priceReducer,
  },
}); 