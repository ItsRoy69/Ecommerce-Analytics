import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authenticateShop, clearError } from '@/store/slices/authSlice';

const Login = () => {
  const [shopName, setShopName] = useState('');
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (shopName.trim()) {
      dispatch(authenticateShop(shopName.trim()));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-4 sm:p-8 space-y-6 sm:space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">E-commerce Analytics</h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">Sign in with your shop name to access your dashboard</p>
        </div>

        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="shopName" className="block text-sm font-medium text-gray-700">
              Shop Name
            </label>
            <div className="mt-1">
              <input
                id="shopName"
                name="shopName"
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Enter your shop name"
                disabled={status === 'loading'}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 text-xs sm:text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={status === 'loading' || !shopName.trim()}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 ${
                status === 'loading' || !shopName.trim() 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {status === 'loading' ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-xs sm:text-sm">
          <p className="text-gray-600">
            Try one of these shops: Fashion Store, Electronics Hub, Home Goods
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 