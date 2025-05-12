import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedTimeFrame: '30days', 
};

const priceSlice = createSlice({
  name: 'price',
  initialState,
  reducers: {
    setTimeFrame: (state, action) => {
      state.selectedTimeFrame = action.payload;
    },
  },
});

export const { setTimeFrame } = priceSlice.actions;

export const selectPriceData = (state) => {
  // First check if orders array exists
  if (!state.sales.orders || state.sales.orders.length === 0) {
    return [];
  }
  
  // Get appropriate sales data based on selection
  let salesData = [];
  
  if (state.sales.selectedVariant) {
    // Filter orders for selected variant
    salesData = state.sales.orders.filter(order => 
      order.variant_id === state.sales.selectedVariant.variant_id
    );
  } else if (state.sales.selectedProduct) {
    // Filter orders for all variants of selected product
    const productVariantIds = (state.sales.variants || [])
      .filter(variant => variant.product_id === state.sales.selectedProduct.product_id)
      .map(variant => variant.variant_id);
    
    if (productVariantIds.length > 0) {
      salesData = state.sales.orders.filter(order => 
        productVariantIds.includes(order.variant_id)
      );
    }
  } else {
    return []; // No selection
  }

  // Now filter by time frame
  const today = new Date();
  let startDate = new Date();
  
  switch (state.price.selectedTimeFrame) {
    case '7days':
      startDate.setDate(today.getDate() - 7);
      break;
    case '30days':
      startDate.setDate(today.getDate() - 30);
      break;
    case '90days':
      startDate.setDate(today.getDate() - 90);
      break;
    case 'year':
      startDate.setFullYear(today.getFullYear() - 1);
      break;
    default:
      startDate.setDate(today.getDate() - 30);
  }

  // Filter by date range
  return salesData.filter(order => {
    if (!order.date) return false;
    try {
      const orderDate = new Date(order.date);
      return !isNaN(orderDate) && orderDate >= startDate && orderDate <= today;
    } catch (e) {
      console.error('Error parsing date:', order.date, e);
      return false;
    }
  });
};

export default priceSlice.reducer; 