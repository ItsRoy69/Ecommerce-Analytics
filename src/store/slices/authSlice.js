import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { saveShopToStorage, removeShopFromStorage } from '@/utils/auth';

export const authenticateShop = createAsyncThunk(
  'auth/authenticateShop',
  async (shopName, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shopName }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.error || 'Authentication failed');
      }
      
      saveShopToStorage(data.shop);
      
      return data.shop;
    } catch (error) {
      return rejectWithValue(error.message || 'Authentication failed');
    }
  }
);

const initialState = {
  shop: null,
  status: 'idle',
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
      state.status = 'idle';
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
        state.status = 'loading';
        state.error = null;
      })
      .addCase(authenticateShop.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.shop = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(authenticateShop.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearError, setShop } = authSlice.actions;
export default authSlice.reducer; 