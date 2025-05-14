import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectProduct, 
  selectVariant, 
  selectAllProducts, 
  selectProductVariants 
} from '@/store/slices/salesSlice';
import { setTimeFrame, selectPriceData } from '@/store/slices/priceSlice';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

const PriceAnalytics = () => {
  const dispatch = useDispatch();
  const products = useSelector(selectAllProducts);
  const variants = useSelector(selectProductVariants);
  const priceData = useSelector(selectPriceData);
  const selectedProduct = useSelector(state => state.sales.selectedProduct);
  const selectedVariant = useSelector(state => state.sales.selectedVariant);
  const selectedTimeFrame = useSelector(state => state.price.selectedTimeFrame);
  const [showUnit, setShowUnit] = useState(false); // Toggle between total revenue and per unit

  // Debug logs to help identify issues
  useEffect(() => {
    console.log('View mode changed:', showUnit ? 'Per Unit' : 'Total Revenue');
  }, [showUnit]);

  // Calculate metrics
  const totalUnitsSold = priceData.reduce((total, order) => total + order.quantity, 0);
  const totalRevenue = priceData.reduce((total, order) => total + (order.price * order.quantity), 0);
  
  // Calculate average price
  const averagePrice = totalUnitsSold > 0 
    ? totalRevenue / totalUnitsSold 
    : 0;

  // Find min and max prices
  const prices = priceData.map(order => order.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  // Group data by price points
  const priceAnalysis = {};
  
  priceData.forEach(order => {
    const price = Math.round(order.price * 100) / 100; // Round to 2 decimal places
    
    if (!priceAnalysis[price]) {
      priceAnalysis[price] = {
        price,
        occurrences: 0,
        totalUnits: 0,
        totalRevenue: 0,
        averageUnitsPerOrder: 0,
        revenuePerUnit: 0
      };
    }
    
    priceAnalysis[price].occurrences++;
    priceAnalysis[price].totalUnits += order.quantity;
    priceAnalysis[price].totalRevenue += (order.price * order.quantity);
  });
  
  // Calculate derived metrics
  Object.values(priceAnalysis).forEach(point => {
    point.averageUnitsPerOrder = point.occurrences > 0 ? point.totalUnits / point.occurrences : 0;
    point.revenuePerUnit = point.totalUnits > 0 ? point.totalRevenue / point.totalUnits : 0;
  });
  
  // Sort by price for display
  const pricePoints = Object.values(priceAnalysis).sort((a, b) => a.price - b.price);
  
  // Calculate optimal price point (highest revenue per order)
  const optimalPricePoint = pricePoints.length > 0 
    ? pricePoints.reduce((optimal, current) => 
        current.totalRevenue > optimal.totalRevenue ? current : optimal, 
        pricePoints[0])
    : null;

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

  const handleTimeFrameChange = (e) => {
    dispatch(setTimeFrame(e.target.value));
  };

  // Toggle between total revenue and per unit revenue
  const handleToggleView = (showUnitView) => {
    console.log('Toggling view to:', showUnitView ? 'Per Unit' : 'Total Revenue');
    setShowUnit(showUnitView);
  };

  // Custom tooltip for both charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isOptimal = optimalPricePoint && data.price === optimalPricePoint.price;
      
      return (
        <div className="bg-gray-800 text-white text-xs rounded py-2 px-3">
          <p className="font-semibold">Price: ${data.price.toFixed(2)}</p>
          <p>Total Revenue: ${data.totalRevenue.toFixed(2)}</p>
          <p>Units Sold: {data.totalUnits}</p>
          <p>Orders: {data.occurrences}</p>
          <p>Revenue Per Unit: ${data.revenuePerUnit.toFixed(2)}</p>
          {isOptimal && <p className="text-green-400 font-semibold">Optimal Price Point</p>}
        </div>
      );
    }
    return null;
  };

  // Format X axis ticks to show dollar amounts
  const formatPrice = (price) => `$${price.toFixed(2)}`;

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Price Analytics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

          <div>
            <label htmlFor="timeframe" className="block text-sm font-medium text-gray-700 mb-1">
              Time Frame
            </label>
            <select
              id="timeframe"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              onChange={handleTimeFrameChange}
              value={selectedTimeFrame}
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>
      
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Average Price</h3>
            <p className="text-3xl font-bold text-gray-900">
              ${averagePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Price Range</h3>
            <p className="text-xl font-bold text-gray-900">
              ${minPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - 
              ${maxPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Optimal Price Point</h3>
            <p className="text-3xl font-bold text-gray-900">
              ${optimalPricePoint ? optimalPricePoint.price.toFixed(2) : 'N/A'}
            </p>
            {optimalPricePoint && (
              <p className="text-sm text-gray-500">
                Max revenue: ${optimalPricePoint.totalRevenue.toFixed(2)}
              </p>
            )}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-1">View Mode</h3>
            <div className="flex w-full mt-2 bg-gray-200 rounded-md p-1">
              <button
                onClick={() => handleToggleView(false)}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition ${
                  !showUnit ? 'bg-white shadow text-gray-800' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Total Revenue
              </button>
              <button
                onClick={() => handleToggleView(true)}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition ${
                  showUnit ? 'bg-white shadow text-gray-800' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Per Unit
              </button>
            </div>
          </div>
        </div>
        
        {pricePoints.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="relative h-80 mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                {showUnit ? 'Revenue Per Unit by Price Point' : 'Total Revenue by Price Point'}
              </h3>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart
                  data={pricePoints}
                  margin={{
                    top: 5,
                    right: 20,
                    left: 20,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="price" 
                    tickFormatter={formatPrice}
                    label={{ value: 'Price Points ($)', position: 'insideBottom', offset: -10 }}
                  />
                  <YAxis 
                    label={{ 
                      value: showUnit ? 'Revenue Per Unit ($)' : 'Total Revenue ($)', 
                      angle: -90, 
                      position: 'insideLeft' 
                    }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey={showUnit ? "revenuePerUnit" : "totalRevenue"} 
                    name={showUnit ? "Revenue Per Unit" : "Total Revenue"}
                    fill="#3B82F6"
                  >
                    {pricePoints.map((entry, index) => {
                      const isOptimal = optimalPricePoint && entry.price === optimalPricePoint.price;
                      return <Cell key={`cell-${index}`} fill={isOptimal ? "#10B981" : "#3B82F6"} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Units Sold Chart */}
            <div className="relative h-80 mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                Units Sold by Price Point
              </h3>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart
                  data={pricePoints}
                  margin={{
                    top: 5,
                    right: 20,
                    left: 20,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="price" 
                    tickFormatter={formatPrice}
                    label={{ value: 'Price Points ($)', position: 'insideBottom', offset: -10 }}
                  />
                  <YAxis 
                    label={{ value: 'Units Sold', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="totalUnits" 
                    name="Units Sold" 
                    fill="#A855F7"
                  >
                    {pricePoints.map((entry, index) => {
                      const isOptimal = optimalPricePoint && entry.price === optimalPricePoint.price;
                      return <Cell key={`cell-${index}`} fill={isOptimal ? "#10B981" : "#A855F7"} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center p-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              {selectedProduct ? "No price data available for the selected criteria" : "No price data available"}
            </p>
          </div>
        )}
        
        {/* Price Point Insights */}
        {pricePoints.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Price Point Insights</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price Point
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Units Sold
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Revenue
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Units Per Order
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue Per Unit
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pricePoints.map((point, index) => {
                    const isOptimal = optimalPricePoint && point.price === optimalPricePoint.price;
                    
                    return (
                      <tr key={index} className={isOptimal ? 'bg-green-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${point.price.toFixed(2)} {isOptimal && <span className="text-green-500 ml-1">★</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {point.occurrences}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {point.totalUnits}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${point.totalRevenue.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {point.averageUnitsPerOrder.toFixed(1)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${point.revenuePerUnit.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        <div className="mt-8 text-sm text-gray-600">
          <h3 className="font-medium text-gray-900 mb-2">Understanding This Analysis</h3>
          <p>This visualization shows the relationship between product price points and revenue. The left chart displays 
          {showUnit ? ' revenue per unit' : ' total revenue'} at each price point, while the right chart shows the number of units sold. 
          Green bars indicate the price point that generated the highest total revenue.</p>
        </div>
      </div>
    </div>
  );
};

export default PriceAnalytics; 