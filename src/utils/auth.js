import { AUTH_STORAGE_KEY } from '@/constants';
import Cookies from 'js-cookie';

export const saveShopToStorage = (shop) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(shop));
    Cookies.set(AUTH_STORAGE_KEY, JSON.stringify(shop), { 
      expires: 7,
      path: '/',
      sameSite: 'strict'
    });
  }
};

export const getShopFromStorage = () => {
  if (typeof window !== 'undefined') {
    const shop = localStorage.getItem(AUTH_STORAGE_KEY);
    return shop ? JSON.parse(shop) : null;
  }
  return null;
};

export const removeShopFromStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    Cookies.remove(AUTH_STORAGE_KEY, { path: '/' });
  }
}; 