import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setShop } from '@/store/slices/authSlice';
import { getShopFromStorage } from '@/utils/auth';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  useEffect(() => {
    const storedShop = getShopFromStorage();
    if (storedShop) {
      dispatch(setShop(storedShop));
    }
  }, [dispatch]);

  return isAuthenticated ? <Dashboard /> : <Login />;
}
