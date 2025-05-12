import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';

const Dashboard = () => {
  const { shop } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {shop?.name} Analytics Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="p-8 bg-white rounded-lg shadow">
          <h2 className="mb-6 text-xl font-semibold">Welcome to Your Dashboard</h2>
          <p className="text-gray-600">
            This is a placeholder for your analytics dashboard. In a complete application, 
            you would see charts, graphs, and data tables here showing your sales performance.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 