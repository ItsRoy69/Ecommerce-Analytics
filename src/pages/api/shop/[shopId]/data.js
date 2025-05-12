import sqlite3 from 'sqlite3';
import path from 'path';

export default function handler(req, res) {
  console.log('API endpoint called with shopId:', req.query.shopId);
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { shopId } = req.query;

  if (!shopId) {
    return res.status(400).json({ error: 'Shop ID is required' });
  }

  const dbPath = path.join(process.cwd(), 'database.sqlite');
  console.log('Database path:', dbPath);
  
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Database connection error:', err);
      return res.status(500).json({ error: 'Failed to connect to database' });
    }

    console.log('Connected to database successfully');

    db.get('SELECT * FROM shop WHERE shop_id = ?', [shopId], (err, shop) => {
      if (err) {
        console.error('Database query error:', err);
        db.close();
        return res.status(500).json({ error: 'Database query failed' });
      }

      if (!shop) {
        console.log('Shop not found with ID:', shopId);
        db.close();
        return res.status(404).json({ error: 'Shop not found' });
      }

      console.log('Found shop:', shop);

      const data = {
        shop: shop,
        products: [],
        variants: [],
        orders: []
      };

      db.all('SELECT * FROM product WHERE shop_id = ?', [shopId], (err, products) => {
        if (err) {
          console.error('Failed to fetch products:', err);
          db.close();
          return res.status(500).json({ error: 'Failed to fetch products' });
        }

        console.log(`Found ${products.length} products`);
        data.products = products;
        
        if (products.length === 0) {
          db.close();
          return res.status(200).json(data);
        }

        const productIds = products.map(p => p.product_id);
        const placeholders = productIds.map(() => '?').join(',');
        
        db.all(
          `SELECT * FROM variant WHERE product_id IN (${placeholders})`,
          productIds,
          (err, variants) => {
            if (err) {
              console.error('Failed to fetch variants:', err);
              db.close();
              return res.status(500).json({ error: 'Failed to fetch variants' });
            }

            console.log(`Found ${variants.length} variants`);
            data.variants = variants;
            
            if (variants.length === 0) {
              db.close();
              return res.status(200).json(data);
            }

            const variantIds = variants.map(v => v.variant_id);
            const variantPlaceholders = variantIds.map(() => '?').join(',');

            db.all(
              `SELECT * FROM orders WHERE variant_id IN (${variantPlaceholders})`,
              variantIds,
              (err, orders) => {
                if (err) {
                  console.error('Failed to fetch orders:', err);
                  db.close();
                  return res.status(500).json({ error: 'Failed to fetch orders' });
                }

                console.log(`Found ${orders.length} orders`);
                data.orders = orders;
                
                db.close();
                return res.status(200).json(data);
              }
            );
          }
        );
      });
    });
  });
} 