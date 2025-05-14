import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectProduct, 
  selectVariant, 
  selectAllProducts, 
  selectProductVariants, 
  selectSalesData
} from '@/store/slices/salesSlice';

const SalesAnalytics = () => {
  const dispatch = useDispatch();
  const products = useSelector(selectAllProducts);
  const variants = useSelector(selectProductVariants);
  const salesData = useSelector(selectSalesData);
  const selectedProduct = useSelector(state => state.sales.selectedProduct);
  const selectedVariant = useSelector(state => state.sales.selectedVariant);
  
  // Debug logs
  console.log('Selected Product:', selectedProduct);
  console.log('Selected Variant:', selectedVariant);
  console.log('Sales Data:', salesData);

  const totalUnitsSold = salesData.reduce((total, order) => total + order.quantity, 0);
  const totalRevenue = salesData.reduce((total, order) => total + (order.price * order.quantity), 0);
  
  // Group sales data by month for the chart
  const salesByMonth = salesData.reduce((acc, order) => {
    if (!order.date) {
      console.log('Order missing date:', order);
      return acc;
    }
    
    const date = new Date(order.date);
    if (isNaN(date.getTime())) {
      console.log('Invalid date format:', order.date, order);
      return acc;
    }
    
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    
    if (!acc[monthYear]) {
      acc[monthYear] = {
        revenue: 0,
        units: 0,
        date: date,
        timestamp: date.getTime(), // Add timestamp for easier sorting
        avgPrice: 0,
        orders: 0
      };
    }
    
    acc[monthYear].revenue += order.price * order.quantity;
    acc[monthYear].units += order.quantity;
    acc[monthYear].orders += 1;
    
    return acc;
  }, {});

  // Calculate average price per unit for each month
  Object.values(salesByMonth).forEach(month => {
    month.avgPrice = month.units > 0 ? month.revenue / month.units : 0;
  });

  console.log('Sales By Month:', salesByMonth);
  
  // Properly sort by date chronologically
  const sortedSalesByMonth = Object.entries(salesByMonth)
    .map(([monthYear, data]) => ({
      month: monthYear,
      revenue: data.revenue,
      units: data.units,
      timestamp: data.timestamp,
      avgPrice: data.avgPrice,
      orders: data.orders
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
    
  console.log('Sorted Sales By Month:', sortedSalesByMonth);

  // Calculate period over period growth
  const calculateGrowth = () => {
    if (sortedSalesByMonth.length < 2) return { revenue: 0, units: 0 };
    
    const currentPeriod = sortedSalesByMonth[sortedSalesByMonth.length - 1];
    const previousPeriod = sortedSalesByMonth[sortedSalesByMonth.length - 2];
    
    const revenueGrowth = previousPeriod.revenue !== 0 
      ? ((currentPeriod.revenue - previousPeriod.revenue) / previousPeriod.revenue) * 100 
      : 100;
      
    const unitsGrowth = previousPeriod.units !== 0 
      ? ((currentPeriod.units - previousPeriod.units) / previousPeriod.units) * 100 
      : 100;
      
    return { revenue: revenueGrowth, units: unitsGrowth };
  };
  
  const growth = calculateGrowth();

  const handleProductChange = (e) => {
    const productId = parseInt(e.target.value);
    if (isNaN(productId) || productId === 0) {
      dispatch(selectProduct(null));
      return;
    }
    const selectedProduct = products.find(p => p.product_id === productId);
    console.log('Selected product from dropdown:', selectedProduct);
    dispatch(selectProduct(selectedProduct));
  };

  const handleVariantChange = (e) => {
    const variantId = parseInt(e.target.value);
    if (isNaN(variantId) || variantId === 0) {
      dispatch(selectVariant(null));
      return;
    }
    const selectedVariant = variants.find(v => v.variant_id === variantId);
    dispatch(selectVariant(selectedVariant));
  };

  const maxRevenue = sortedSalesByMonth.length > 0 
    ? Math.max(...sortedSalesByMonth.map(d => d.revenue))
    : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Sales Analytics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">
              Select Product
            </label>
            <select
              id="product"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              onChange={handleProductChange}
              value={selectedProduct?.product_id || ''}
            >
              <option value="">All Products</option>
              {products.map(product => (
                <option key={product.product_id} value={product.product_id}>
                  {product.product_name}
                </option>
              ))}
            </select>
          </div>
          
          {selectedProduct && (
            <div>
              <label htmlFor="variant" className="block text-sm font-medium text-gray-700 mb-1">
                Select Variant
              </label>
              <select
                id="variant"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                onChange={handleVariantChange}
                value={selectedVariant?.variant_id || ''}
              >
                <option value="">All Variants</option>
                {variants.map(variant => (
                  <option key={variant.variant_id} value={variant.variant_id}>
                    {variant.variant_name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Units Sold</h3>
            <p className="text-3xl font-bold text-gray-900">{totalUnitsSold.toLocaleString()}</p>
            {sortedSalesByMonth.length > 1 && (
              <p className={`text-sm mt-1 ${growth.units >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growth.units >= 0 ? '↑' : '↓'} {Math.abs(growth.units).toFixed(1)}%
              </p>
            )}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Revenue</h3>
            <p className="text-3xl font-bold text-gray-900">
              ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            {sortedSalesByMonth.length > 1 && (
              <p className={`text-sm mt-1 ${growth.revenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growth.revenue >= 0 ? '↑' : '↓'} {Math.abs(growth.revenue).toFixed(1)}%
              </p>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Average Price</h3>
            <p className="text-3xl font-bold text-gray-900">
              ${totalUnitsSold > 0 
                ? (totalRevenue / totalUnitsSold).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
                : '0.00'
              }
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Product</h3>
            <p className="text-lg font-semibold text-gray-900 truncate">
              {selectedProduct 
                ? (selectedVariant 
                    ? `${selectedVariant.variant_name}`
                    : `${selectedProduct.product_name} (all variants)`) 
                : 'All Products'}
            </p>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Trends</h3>
          
          {sortedSalesByMonth.length > 0 ? (
            <div className="relative h-80 mt-10">
              {/* Y-axis label */}
              <div className="absolute -left-10 h-full flex items-center">
                <div className="transform -rotate-90 text-xs text-gray-500">Revenue ($)</div>
              </div>
              
              {/* Chart container */}
              <div className="flex h-full items-end mb-8 pl-2">
                {sortedSalesByMonth.map((data, index) => {
                  // Force minimum height to be 4px so all bars are visible
                  const heightPx = Math.max(4, (data.revenue / maxRevenue) * 300); 
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center px-0.5">
                      <div className="relative w-full group">
                        <div 
                          className="w-full bg-blue-500 hover:bg-blue-600 transition-colors rounded-t"
                          style={{ 
                            height: `${heightPx}px`, // Use explicit pixels for height
                            minHeight: '4px' // Ensure minimum height
                          }}
                        ></div>
                        {/* Tooltip */}
                        <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                          <div className="font-semibold">{data.month}</div>
                          <div>Revenue: ${data.revenue.toFixed(2)}</div>
                          <div>Units: {data.units}</div>
                          <div>Orders: {data.orders}</div>
                          <div>Avg Price: ${data.avgPrice.toFixed(2)}</div>
                        </div>
                      </div>
                      {/* Month label */}
                      <div className={`text-xs text-gray-500 mt-2 w-full text-center overflow-hidden text-ellipsis whitespace-nowrap ${index % 2 !== 0 ? 'hidden sm:block' : ''}`}>
                        {data.month}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* X-axis label */}
              <div className="text-xs text-gray-500 text-center mt-4">Month/Year</div>
              
              {/* Legend */}
              <div className="flex justify-end mt-2">
                <div className="flex items-center text-xs text-gray-500">
                  <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
                  <span>Revenue</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center p-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                {selectedProduct ? "No sales data available for the selected criteria" : "No sales data available"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesAnalytics; 