import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchShopData = createAsyncThunk(
  'sales/fetchShopData',
  async (shopId, { rejectWithValue }) => {
    try {
      console.log('Fetching shop data for ID:', shopId);
      const response = await fetch(`/api/shop/${shopId}/data`);
      const data = await response.json();
      
      if (!response.ok) {
        console.error('API Error:', data.error);
        return rejectWithValue(data.error || 'Failed to fetch shop data');
      }
      
      console.log('Successfully fetched data:', {
        productsCount: data.products?.length,
        variantsCount: data.variants?.length,
        ordersCount: data.orders?.length
      });
      
      return data;
    } catch (error) {
      console.error('Error fetching shop data:', error);
      return rejectWithValue(error.message || 'Failed to fetch shop data');
    }
  }
);

const initialState = {
  products: [],
  variants: [],
  orders: [],
  selectedProduct: null,
  selectedVariant: null,
  status: 'idle',
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
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchShopData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.products = action.payload.products || [];
        state.variants = action.payload.variants || [];
        
        // Ensure orders have proper date formatting
        state.orders = (action.payload.orders || []).map(order => {
          // Check if date exists and format it if needed
          if (order.date && typeof order.date === 'string') {
            // Keep the date as is, we'll parse it during display
            return order;
          } else {
            // If no date or not a string, use current date as fallback
            return {
              ...order,
              date: new Date().toISOString().split('T')[0]
            };
          }
        });
        
        state.error = null;
      })
      .addCase(fetchShopData.rejected, (state, action) => {
        state.status = 'failed';
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
    // Filter orders for selected variant
    return state.sales.orders.filter(order => 
      order.variant_id === state.sales.selectedVariant.variant_id
    );
  } else if (state.sales.selectedProduct) {
    // Filter orders for all variants of selected product
    const productVariantIds = (state.sales.variants || [])
      .filter(variant => variant.product_id === state.sales.selectedProduct.product_id)
      .map(variant => variant.variant_id);
    
    // Only return orders that match these variant IDs
    if (productVariantIds.length > 0) {
      return state.sales.orders.filter(order => 
        productVariantIds.includes(order.variant_id)
      );
    }
  }
  
  return [];
};

export default salesSlice.reducer; 