import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectProduct,
  selectVariant,
  selectAllProducts,
  selectProductVariants,
  selectSalesData
} from '@/store/slices/salesSlice';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const SalesAnalytics = () => {
  const dispatch = useDispatch();
  const products = useSelector(selectAllProducts);
  const variants = useSelector(selectProductVariants);
  const salesData = useSelector(selectSalesData);
  const selectedProduct = useSelector(state => state.sales.selectedProduct);
  const selectedVariant = useSelector(state => state.sales.selectedVariant);

  const totalUnitsSold = salesData.reduce((total, order) => total + order.quantity, 0);
  const totalRevenue = salesData.reduce((total, order) => total + (order.price * order.quantity), 0);

  const salesByMonth = salesData.reduce((acc, order) => {
    if (!order.date) {
      return acc;
    }

    const date = new Date(order.date);
    if (isNaN(date.getTime())) {
      return acc;
    }

    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

    if (!acc[monthYear]) {
      acc[monthYear] = {
        revenue: 0,
        units: 0,
        date: date,
        timestamp: date.getTime(),
        avgPrice: 0,
        orders: 0
      };
    }

    acc[monthYear].revenue += order.price * order.quantity;
    acc[monthYear].units += order.quantity;
    acc[monthYear].orders += 1;

    return acc;
  }, {});

  Object.values(salesByMonth).forEach(month => {
    month.avgPrice = month.units > 0 ? month.revenue / month.units : 0;
  });


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


  const calculateTrendValues = () => {
    if (sortedSalesByMonth.length <= 1) return sortedSalesByMonth;
    const trendData = [...sortedSalesByMonth];

    const n = trendData.length;
    const sumX = trendData.reduce((sum, _, i) => sum + i, 0);
    const sumY = trendData.reduce((sum, d) => sum + d.revenue, 0);
    const sumXY = trendData.reduce((sum, d, i) => sum + (i * d.revenue), 0);
    const sumX2 = trendData.reduce((sum, _, i) => sum + (i * i), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    return trendData.map((data, index) => ({
      ...data,
      trendValue: intercept + slope * index
    }));
  };

  const trendedSalesData = calculateTrendValues();

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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const revenueData = payload.find(p => p.dataKey === 'revenue')?.payload;
      const trendData = payload.find(p => p.dataKey === 'trendValue')?.payload;
      
      const dataObj = revenueData || trendData;
      if (!dataObj) return null;
      
      return (
        <div className="bg-gray-800 text-white text-xs rounded py-2 px-3">
          <p className="font-semibold">{dataObj.month}</p>
          <p>Revenue: ${dataObj.revenue.toFixed(2)}</p>
          <p>Units: {dataObj.units}</p>
          <p>Orders: {dataObj.orders}</p>
          <p>Avg Price: ${dataObj.avgPrice.toFixed(2)}</p>
          {dataObj.trendValue && (
            <p className="mt-1 pt-1 border-t border-gray-600">
              Trend: ${dataObj.trendValue.toFixed(2)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 mb-4 sm:mb-6">
          <div>
            <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">
              Select Product
            </label>
            <select
              id="product"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
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
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-gray-50 p-2 sm:p-4 rounded-lg border border-gray-200">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Total Units Sold</h3>
            <p className="text-lg sm:text-3xl font-bold text-gray-900">{totalUnitsSold.toLocaleString()}</p>
            {sortedSalesByMonth.length > 1 && (
              <p className={`text-xs sm:text-sm mt-1 ${growth.units >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growth.units >= 0 ? '↑' : '↓'} {Math.abs(growth.units).toFixed(1)}%
              </p>
            )}
          </div>

          <div className="bg-gray-50 p-2 sm:p-4 rounded-lg border border-gray-200">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Total Revenue</h3>
            <p className="text-lg sm:text-3xl font-bold text-gray-900">
              ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            {sortedSalesByMonth.length > 1 && (
              <p className={`text-xs sm:text-sm mt-1 ${growth.revenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growth.revenue >= 0 ? '↑' : '↓'} {Math.abs(growth.revenue).toFixed(1)}%
              </p>
            )}
          </div>

          <div className="bg-gray-50 p-2 sm:p-4 rounded-lg border border-gray-200">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Average Price</h3>
            <p className="text-lg sm:text-3xl font-bold text-gray-900">
              ${totalUnitsSold > 0
                ? (totalRevenue / totalUnitsSold).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : '0.00'}
            </p>
          </div>

          <div className="bg-gray-50 p-2 sm:p-4 rounded-lg border border-gray-200">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Total Orders</h3>
            <p className="text-lg sm:text-3xl font-bold text-gray-900">
              {salesData.length.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
          <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-4">Sales Over Time</h3>

          {sortedSalesByMonth.length > 0 ? (
            <div className="h-60 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendedSalesData}
                  margin={{
                    top: 5,
                    right: 5,
                    left: 5,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    label={{ value: 'Month/Year', position: 'insideBottom', offset: -5 }}
                    tick={{fontSize: 10}}
                  />
                  <YAxis 
                    yAxisId="left"
                    label={{ value: 'Revenue ($)', angle: -90, position: 'insideLeft' }}
                    tickFormatter={(value) => `$${value}`}
                    tick={{fontSize: 10}}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    label={{ value: 'Units', angle: 90, position: 'insideRight' }}
                    tick={{fontSize: 10}}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: 10 }} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    yAxisId="left"
                  />
                  <Line
                    type="monotone"
                    dataKey="units"
                    name="Units Sold"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    yAxisId="right"
                  />
                  {sortedSalesByMonth.length > 1 && (
                    <Line
                      type="monotone"
                      dataKey="trendValue"
                      name="Sales Trend"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      yAxisId="left"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex justify-center items-center p-6 sm:p-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-sm">
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