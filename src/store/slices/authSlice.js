import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { saveShopToStorage, removeShopFromStorage } from '@/utils/auth';
import { API_ENDPOINTS, REDUX_STATUS, ERROR_MESSAGES } from '@/constants';

export const authenticateShop = createAsyncThunk(
  'auth/authenticateShop',
  async (shopName, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shopName }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.error || ERROR_MESSAGES.AUTHENTICATION_FAILED);
      }
      
      saveShopToStorage(data.shop);
      
      return data.shop;
    } catch (error) {
      return rejectWithValue(error.message || ERROR_MESSAGES.AUTHENTICATION_FAILED);
    }
  }
);

const initialState = {
  shop: null,
  status: REDUX_STATUS.IDLE,
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.shop = null;
      state.isAuthenticated = false;
      state.status = REDUX_STATUS.IDLE;
      state.error = null;
      removeShopFromStorage();
    },
    clearError: (state) => {
      state.error = null;
    },
    setShop: (state, action) => {
      state.shop = action.payload;
      state.isAuthenticated = true;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(authenticateShop.pending, (state) => {
        state.status = REDUX_STATUS.LOADING;
        state.error = null;
      })
      .addCase(authenticateShop.fulfilled, (state, action) => {
        state.status = REDUX_STATUS.SUCCEEDED;
        state.shop = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(authenticateShop.rejected, (state, action) => {
        state.status = REDUX_STATUS.FAILED;
        state.error = action.payload;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearError, setShop } = authSlice.actions;
export default authSlice.reducer; 