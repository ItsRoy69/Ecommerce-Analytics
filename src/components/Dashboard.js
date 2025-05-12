import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { fetchShopData } from '@/store/slices/salesSlice';
import SalesAnalytics from './analytics/SalesAnalytics';
import PriceAnalytics from './analytics/PriceAnalytics';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const { shop } = useSelector((state) => state.auth);
  const { status: salesDataStatus, error: salesDataError } = useSelector((state) => state.sales);
  const dispatch = useDispatch();

  useEffect(() => {
    if (shop && shop.id) {
      console.log('Dashboard mounted, fetching data for shop ID:', shop.id);
      dispatch(fetchShopData(shop.id));
    } else {
      console.error('No shop ID available for fetching data');
    }
  }, [dispatch, shop]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const renderContent = () => {
    if (salesDataStatus === 'loading') {
      return (
        <div className="flex justify-center items-center p-20">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading data...</p>
          </div>
        </div>
      );
    }

    if (salesDataStatus === 'failed') {
      return (
        <div className="p-8 bg-white rounded-lg shadow">
          <p className="text-red-600">Failed to load analytics data: {salesDataError || 'Unknown error'}</p>
          <button 
            onClick={() => shop?.id && dispatch(fetchShopData(shop.id))}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      );
    }

    if (salesDataStatus === 'succeeded') {
      return activeTab === 'sales' ? <SalesAnalytics /> : <PriceAnalytics />;
    }

    return (
      <div className="p-8 bg-white rounded-lg shadow">
        <p className="text-gray-600">Waiting for data...</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {shop?.name} Analytics Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-500">Shop ID: {shop?.id}</p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <div className="mx-auto max-w-7xl mt-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('sales')}
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === 'sales'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sales Analytics
          </button>
          <button
            onClick={() => setActiveTab('price')}
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === 'price'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Price Analytics
          </button>
        </div>
      </div>
      
      <main className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard; 