const SHOP_KEY = 'ecommerce_analytics_shop';

export const saveShopToStorage = (shop) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SHOP_KEY, JSON.stringify(shop));
  }
};

export const getShopFromStorage = () => {
  if (typeof window !== 'undefined') {
    const shop = localStorage.getItem(SHOP_KEY);
    return shop ? JSON.parse(shop) : null;
  }
  return null;
};

export const removeShopFromStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SHOP_KEY);
  }
}; 