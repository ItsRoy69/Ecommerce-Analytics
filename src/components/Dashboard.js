import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { fetchShopData } from '@/store/slices/salesSlice';
import SalesAnalytics from './analytics/SalesAnalytics';
import PriceAnalytics from './analytics/PriceAnalytics';
import { REDUX_STATUS, ANALYTICS_TABS, ERROR_MESSAGES } from '@/constants';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(ANALYTICS_TABS.SALES);
  const { shop } = useSelector((state) => state.auth);
  const { status: salesDataStatus, error: salesDataError } = useSelector((state) => state.sales);
  const dispatch = useDispatch();

  useEffect(() => {
    if (shop && shop.id) {
      dispatch(fetchShopData(shop.id));
    } else {
      console.error(ERROR_MESSAGES.NO_SHOP_ID);
    }
  }, [dispatch, shop]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const renderContent = () => {
    if (salesDataStatus === REDUX_STATUS.LOADING) {
      return (
        <div className="flex justify-center items-center p-4 sm:p-20">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading data...</p>
          </div>
        </div>
      );
    }

    if (salesDataStatus === REDUX_STATUS.FAILED) {
      return (
        <div className="p-4 sm:p-8 bg-white rounded-lg shadow">
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

    if (salesDataStatus === REDUX_STATUS.SUCCEEDED) {
      return activeTab === ANALYTICS_TABS.SALES ? <SalesAnalytics /> : <PriceAnalytics />;
    }

    return (
      <div className="p-4 sm:p-8 bg-white rounded-lg shadow">
        <p className="text-gray-600">Waiting for data...</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="px-3 py-4 sm:px-4 sm:py-6 mx-auto max-w-7xl md:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words max-w-full">
            {shop?.name} Analytics Dashboard
          </h1>
          <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-start">
            <p className="text-xs sm:text-sm text-gray-500">Shop ID: {shop?.id}</p>
            <button
              onClick={handleLogout}
              className="px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <div className="mx-auto max-w-7xl mt-4 sm:mt-6 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex overflow-x-auto border-b border-gray-200">
          <button
            onClick={() => setActiveTab(ANALYTICS_TABS.SALES)}
            className={`py-2 sm:py-4 px-4 sm:px-6 font-medium text-xs sm:text-sm whitespace-nowrap ${
              activeTab === ANALYTICS_TABS.SALES
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sales Analytics
          </button>
          <button
            onClick={() => setActiveTab(ANALYTICS_TABS.PRICE)}
            className={`py-2 sm:py-4 px-4 sm:px-6 font-medium text-xs sm:text-sm whitespace-nowrap ${
              activeTab === ANALYTICS_TABS.PRICE
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Price Analytics
          </button>
        </div>
      </div>
      
      <main className="px-3 py-4 sm:px-4 sm:py-6 mx-auto max-w-7xl md:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard; 