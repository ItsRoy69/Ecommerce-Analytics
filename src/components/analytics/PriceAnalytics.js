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
  const [showUnit, setShowUnit] = useState(false);

  const totalUnitsSold = priceData.reduce((total, order) => total + order.quantity, 0);
  const totalRevenue = priceData.reduce((total, order) => total + (order.price * order.quantity), 0);
  
  const averagePrice = totalUnitsSold > 0 
    ? totalRevenue / totalUnitsSold 
    : 0;

  const prices = priceData.map(order => order.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  const priceAnalysis = {};
  
  priceData.forEach(order => {
    const price = Math.round(order.price * 100) / 100;
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
  
  Object.values(priceAnalysis).forEach(point => {
    point.averageUnitsPerOrder = point.occurrences > 0 ? point.totalUnits / point.occurrences : 0;
    point.revenuePerUnit = point.totalUnits > 0 ? point.totalRevenue / point.totalUnits : 0;
  });
  
  const pricePoints = Object.values(priceAnalysis).sort((a, b) => a.price - b.price);
  
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

  const handleToggleView = (showUnitView) => {
    setShowUnit(showUnitView);
  };

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

  const formatPrice = (price) => `$${price.toFixed(2)}`;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Price Impact Analysis</h2>
          <p className="text-sm text-gray-600 mt-1">
            This visualization demonstrates how different price points affect your revenue. 
            Select products and variants to analyze their optimal pricing strategy.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-4 mb-4 sm:mb-6">
          <div>
            <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">
              Select Product
            </label>
            <select
              id="product"
              className="block w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                className="block w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
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
              className="block w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
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
      
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-gray-50 p-2 sm:p-4 rounded-lg border border-gray-200">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Average Price</h3>
            <p className="text-base sm:text-3xl font-bold text-gray-900">
              ${averagePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="bg-gray-50 p-2 sm:p-4 rounded-lg border border-gray-200">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Price Range</h3>
            <p className="text-base sm:text-xl font-bold text-gray-900">
              ${minPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - 
              ${maxPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="bg-gray-50 p-2 sm:p-4 rounded-lg border border-gray-200">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Optimal Price Point</h3>
            <p className="text-base sm:text-3xl font-bold text-gray-900">
              ${optimalPricePoint ? optimalPricePoint.price.toFixed(2) : 'N/A'}
            </p>
            {optimalPricePoint && (
              <p className="text-xs sm:text-sm text-gray-500">
                Max revenue: ${optimalPricePoint.totalRevenue.toFixed(2)}
              </p>
            )}
          </div>
          
          <div className="bg-gray-50 p-2 sm:p-4 rounded-lg border border-gray-200">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">View Mode</h3>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Revenue Chart */}
            <div className="relative h-80 sm:h-100 mt-2 sm:mt-4 overflow-hidden">
              <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-4">
                {showUnit ? 'Revenue Per Unit by Price Point' : 'Total Revenue by Price Point'}
              </h3>
              <ResponsiveContainer width="99%" height="90%">
                <BarChart
                  data={pricePoints}
                  margin={{
                    top: 5,
                    right: 10,
                    left: 10,
                    bottom: 30,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="price" 
                    tickFormatter={formatPrice}
                    label={{ value: 'Price Points ($)', position: 'insideBottom', offset: -15, dy: 20 }}
                    tick={{fontSize: 9}}
                    tickMargin={10}
                  />
                  <YAxis 
                    label={{ 
                      value: showUnit ? 'Revenue Per Unit ($)' : 'Total Revenue ($)', 
                      angle: -90, 
                      position: 'insideLeft',
                      offset: 5,
                      dy: 20
                    }}
                    tickFormatter={(value) => `$${value}`}
                    tick={{fontSize: 9}}
                    tickMargin={5}
                    width={60}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{fontSize: '10px'}} />
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
            <div className="relative h-80 sm:h-100 mt-2 sm:mt-4 overflow-hidden">
              <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-4">
                Units Sold by Price Point
              </h3>
              <ResponsiveContainer width="99%" height="90%">
                <BarChart
                  data={pricePoints}
                  margin={{
                    top: 5,
                    right: 10,
                    left: 10,
                    bottom: 30,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="price" 
                    tickFormatter={formatPrice}
                    label={{ value: 'Price Points ($)', position: 'insideBottom', offset: -15, dy: 20 }}
                    tick={{fontSize: 9}}
                    tickMargin={10}
                  />
                  <YAxis 
                    label={{ value: 'Units Sold', angle: -90, position: 'insideLeft', offset: -5 }}
                    tick={{fontSize: 9}}
                    tickMargin={5}
                    width={40}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{fontSize: '10px'}} />
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
          <div className="flex justify-center items-center p-6 sm:p-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-sm">
              {selectedProduct ? "No price data available for the selected criteria" : "No price data available"}
            </p>
          </div>
        )}
        
        {/* Price Point Insights */}
        {pricePoints.length > 0 && (
          <div className="mt-6 sm:mt-8">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Price Point Insights</h3>
            
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price Point
                      </th>
                      <th scope="col" className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Orders
                      </th>
                      <th scope="col" className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Units Sold
                      </th>
                      <th scope="col" className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Revenue
                      </th>
                      <th scope="col" className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Units/Order
                      </th>
                      <th scope="col" className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue/Unit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pricePoints.map((point, index) => {
                      const isOptimal = optimalPricePoint && point.price === optimalPricePoint.price;
                      
                      return (
                        <tr key={index} className={isOptimal ? 'bg-green-50' : ''}>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                            ${point.price.toFixed(2)} {isOptimal && <span className="text-green-500 ml-1">★</span>}
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            {point.occurrences}
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            {point.totalUnits}
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            ${point.totalRevenue.toFixed(2)}
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            {point.averageUnitsPerOrder.toFixed(1)}
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            ${point.revenuePerUnit.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-6 sm:mt-8 text-xs sm:text-sm text-gray-600">
          <h3 className="font-medium text-gray-900 mb-2">Understanding This Analysis</h3>
          <p>This visualization shows the relationship between product price points and revenue. The left chart displays 
          {showUnit ? ' revenue per unit' : ' total revenue'} at each price point, while the right chart shows the number of units sold. 
          Green bars indicate the price point that generated the highest total revenue.</p>
          <p className="mt-2">Key insights:</p>
          <ul className="list-disc pl-5 mt-1">
            <li>Higher prices may increase per-unit revenue but can reduce overall sales volume</li>
            <li>Lower prices often increase sales volume but may reduce per-unit profit</li>
            <li>The optimal price point (highlighted in green) balances these factors for maximum total revenue</li>
            <li>Use this analysis to experiment with different pricing strategies for your products</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PriceAnalytics; 