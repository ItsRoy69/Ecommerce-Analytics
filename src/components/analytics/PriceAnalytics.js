import { useSelector, useDispatch } from 'react-redux';
import { 
  selectProduct, 
  selectVariant, 
  selectAllProducts, 
  selectProductVariants 
} from '@/store/slices/salesSlice';
import { setTimeFrame, selectPriceData } from '@/store/slices/priceSlice';

const PriceAnalytics = () => {
  const dispatch = useDispatch();
  const products = useSelector(selectAllProducts);
  const variants = useSelector(selectProductVariants);
  const priceData = useSelector(selectPriceData);
  const selectedProduct = useSelector(state => state.sales.selectedProduct);
  const selectedVariant = useSelector(state => state.sales.selectedVariant);
  const selectedTimeFrame = useSelector(state => state.price.selectedTimeFrame);

  const totalUnitsSold = priceData.reduce((total, order) => total + order.quantity, 0);
  const totalRevenue = priceData.reduce((total, order) => total + (order.price * order.quantity), 0);
  const averagePrice = totalUnitsSold > 0 
    ? totalRevenue / totalUnitsSold 
    : 0;

  const prices = priceData.map(order => order.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  const priceDistribution = priceData.reduce((acc, order) => {
    const price = Math.round(order.price * 100) / 100;
    if (!acc[price]) {
      acc[price] = {
        price,
        count: 0,
        revenue: 0
      };
    }
    acc[price].count += order.quantity;
    acc[price].revenue += order.price * order.quantity;
    return acc;
  }, {});

  const pricePoints = Object.values(priceDistribution).sort((a, b) => a.price - b.price);

  const handleProductChange = (e) => {
    const productId = parseInt(e.target.value);
    const selectedProduct = products.find(p => p.product_id === productId);
    dispatch(selectProduct(selectedProduct));
  };

  const handleVariantChange = (e) => {
    const variantId = parseInt(e.target.value);
    const selectedVariant = variants.find(v => v.variant_id === variantId);
    dispatch(selectVariant(selectedVariant));
  };

  const handleTimeFrameChange = (e) => {
    dispatch(setTimeFrame(e.target.value));
  };

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
      
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Average Price</h3>
            <p className="text-3xl font-bold text-gray-900">
              ${averagePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Minimum Price</h3>
            <p className="text-3xl font-bold text-gray-900">
              ${minPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Maximum Price</h3>
            <p className="text-3xl font-bold text-gray-900">
              ${maxPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        
        {/* Price Distribution Chart */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Price Distribution</h3>
          
          {pricePoints.length > 0 ? (
            <div className="relative h-64">
              <div className="flex h-full items-end space-x-2">
                {pricePoints.map((data, index) => {
                  // Calculate height percentage for bar (with some min height)
                  const maxCount = Math.max(...pricePoints.map(d => d.count));
                  const heightPercentage = Math.max(5, (data.count / maxCount) * 100);
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-green-500 rounded-t"
                        style={{ height: `${heightPercentage}%` }}
                        title={`Price: $${data.price.toFixed(2)}, Units: ${data.count}, Revenue: $${data.revenue.toFixed(2)}`}
                      />
                      <div className="text-xs text-gray-500 mt-1 w-full text-center overflow-hidden text-ellipsis whitespace-nowrap">
                        ${data.price.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center p-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                {selectedProduct ? "No price data available for the selected criteria" : "Please select a product to see price analysis"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceAnalytics; 