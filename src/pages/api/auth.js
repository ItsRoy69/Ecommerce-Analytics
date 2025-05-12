import sqlite3 from 'sqlite3';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { shopName } = req.body;

  if (!shopName || shopName.trim() === '') {
    return res.status(400).json({ error: 'Shop name is required' });
  }

  const dbPath = path.join(process.cwd(), 'database.sqlite');
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Database connection error:', err);
      return res.status(500).json({ error: 'Failed to connect to database' });
    }

    db.get(
      'SELECT shop_id, shop_name FROM shop WHERE shop_name = ?', 
      [shopName],
      (err, shop) => {
        if (err) {
          console.error('Database query error:', err);
          db.close();
          return res.status(500).json({ error: 'Database query failed' });
        }

        if (!shop) {
          db.close();
          return res.status(404).json({ error: 'Shop not found' });
        }

        db.close();
        return res.status(200).json({ 
          success: true, 
          shop: {
            id: shop.shop_id,
            name: shop.shop_name
          }
        });
      }
    );
  });
} 