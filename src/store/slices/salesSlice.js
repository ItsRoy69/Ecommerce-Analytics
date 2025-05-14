import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  API_ENDPOINTS, 
  REDUX_STATUS, 
  ERROR_MESSAGES 
} from '@/constants';

export const fetchShopData = createAsyncThunk(
  'sales/fetchShopData',
  async (shopId, { rejectWithValue }) => {
    try {
      console.log('Fetching shop data for ID:', shopId);
      const response = await fetch(API_ENDPOINTS.SHOP_DATA(shopId));
      const data = await response.json();
      
      if (!response.ok) {
        console.error('API Error:', data.error);
        return rejectWithValue(data.error || ERROR_MESSAGES.FETCH_DATA_FAILED);
      }
      
      console.log('Successfully fetched data:', {
        productsCount: data.products?.length,
        variantsCount: data.variants?.length,
        ordersCount: data.orders?.length
      });
      
      return data;
    } catch (error) {
      console.error('Error fetching shop data:', error);
      return rejectWithValue(error.message || ERROR_MESSAGES.FETCH_DATA_FAILED);
    }
  }
);

const initialState = {
  products: [],
  variants: [],
  orders: [],
  selectedProduct: null,
  selectedVariant: null,
  status: REDUX_STATUS.IDLE,
  error: null,
};

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    selectProduct: (state, action) => {
      state.selectedProduct = action.payload;
      state.selectedVariant = null;
    },
    selectVariant: (state, action) => {
      state.selectedVariant = action.payload;
    },
    clearSelection: (state) => {
      state.selectedProduct = null;
      state.selectedVariant = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShopData.pending, (state) => {
        state.status = REDUX_STATUS.LOADING;
        state.error = null;
      })
      .addCase(fetchShopData.fulfilled, (state, action) => {
        state.status = REDUX_STATUS.SUCCEEDED;
        state.products = action.payload.products || [];
        state.variants = action.payload.variants || [];
        
        state.orders = (action.payload.orders || []).map(order => {
          if (order.date && typeof order.date === 'string') {
            return order;
          } else {
            return {
              ...order,
              date: new Date().toISOString().split('T')[0]
            };
          }
        });
        
        state.error = null;
      })
      .addCase(fetchShopData.rejected, (state, action) => {
        state.status = REDUX_STATUS.FAILED;
        state.error = action.payload;
      });
  },
});

export const { selectProduct, selectVariant, clearSelection } = salesSlice.actions;

export const selectAllProducts = (state) => state.sales.products || [];

export const selectProductVariants = (state) => {
  if (!state.sales.selectedProduct) return [];
  return (state.sales.variants || []).filter(variant => 
    variant.product_id === state.sales.selectedProduct.product_id
  );
};

export const selectSalesData = (state) => {
  if (!state.sales.orders || state.sales.orders.length === 0) {
    return [];
  }
  
  if (state.sales.selectedVariant) {
    return state.sales.orders.filter(order => 
      order.variant_id === state.sales.selectedVariant.variant_id
    );
  } else if (state.sales.selectedProduct) {
    const productVariantIds = (state.sales.variants || [])
      .filter(variant => variant.product_id === state.sales.selectedProduct.product_id)
      .map(variant => variant.variant_id);
    
    if (productVariantIds.length > 0) {
      return state.sales.orders.filter(order => 
        productVariantIds.includes(order.variant_id)
      );
    }
  } else {
    return state.sales.orders;
  }
  
  return [];
};

export default salesSlice.reducer; 