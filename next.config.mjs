/** @type {import('next').NextConfig} */
import sqlite3 from "sqlite3";
import path from 'path';

const nextConfig = async () => {
  const dbPath = path.join(process.cwd(), 'database.sqlite');
  const db = new sqlite3.Database(dbPath);
  
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create tables
      db.run(`CREATE TABLE IF NOT EXISTS shop (
        shop_id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_name TEXT NOT NULL
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS product (
        product_id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        FOREIGN KEY (shop_id) REFERENCES shop(shop_id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS variant (
        variant_id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        variant_name TEXT NOT NULL,
        FOREIGN KEY (product_id) REFERENCES product(product_id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS orders (
        order_id INTEGER PRIMARY KEY AUTOINCREMENT,
        variant_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (variant_id) REFERENCES variant(variant_id)
      )`);

      // Check if data already exists
      db.get("SELECT COUNT(*) as count FROM shop", (err, row) => {
        if (err) {
          console.error(err);
          db.close();
          reject(err);
          return;
        }
        
        if (row.count === 0) {
          // Insert sample data only if the table is empty
          // Insert shops
          const shopStmt = db.prepare("INSERT INTO shop (shop_name) VALUES (?)");
          const shops = ['Fashion Store', 'Electronics Hub', 'Home Goods'];
          shops.forEach(shop => shopStmt.run(shop));
          shopStmt.finalize();

          // Insert products
          const productStmt = db.prepare("INSERT INTO product (shop_id, product_name) VALUES (?, ?)");
          const products = [
            [1, 'T-Shirt'],
            [1, 'Jeans'],
            [2, 'Smartphone'],
            [2, 'Laptop'],
            [3, 'Sofa'],
            [3, 'Table']
          ];
          products.forEach(product => productStmt.run(product));
          productStmt.finalize();

          // Insert variants
          const variantStmt = db.prepare("INSERT INTO variant (product_id, variant_name) VALUES (?, ?)");
          const variants = [
            [1, 'Small - Black'],
            [1, 'Medium - White'],
            [2, '32 - Blue'],
            [2, '34 - Black'],
            [3, '128GB - Black'],
            [3, '256GB - Silver'],
            [4, '16GB RAM - 512GB SSD'],
            [4, '32GB RAM - 1TB SSD'],
            [5, '3-Seater - Gray'],
            [5, '2-Seater - Brown'],
            [6, 'Wooden - Oak'],
            [6, 'Glass - Modern']
          ];
          variants.forEach(variant => variantStmt.run(variant));
          variantStmt.finalize();

          // Insert orders
          const orderStmt = db.prepare("INSERT INTO orders (variant_id, quantity, price, date) VALUES (?, ?, ?, ?)");

          // Generate 500 orders
          const orders = [];
          const variantPrices = {
            1: [29.99, 32.99, 34.99],  // T-Shirt Small - Black
            2: [29.99, 33.99, 34.99],  // T-Shirt Medium - White
            3: [79.99, 89.99, 99.99],  // Jeans 32 - Blue
            4: [79.99, 89.99, 99.99],  // Jeans 34 - Black
            5: [799.99, 899.99, 999.99], // Smartphone 128GB - Black
            6: [999.99, 1099.99, 1199.99],// Smartphone 256GB - Silver
            7: [1499.99, 1588.99, 1599.99],// Laptop 16GB RAM - 512GB SSD
            8: [1799.99, 1899.99, 1999.99],// Laptop 32GB RAM - 1TB SSD
            9: [799.99, 849.99, 899.99], // Sofa 3-Seater - Gray
            10: [599.99, 699.99, 799.99],// Sofa 2-Seater - Brown
            11: [299.99, 349.99, 399.99],// Table Wooden - Oak
            12: [399.99, 349.99, 499.99] // Table Glass - Modern
          };

          // Generate orders for the past 500 days
          for (let i = 0; i < 500; i++) {
            const variantId = Math.floor(Math.random() * 12) + 1; // Random variant between 1-12
            const quantity = Math.floor(Math.random() * 5) + 1; // Random quantity between 1-5
            const price = variantPrices[variantId][Math.floor(Math.random() * 3)];
            const date = new Date();
            date.setDate(date.getDate() - i); // Go back i days
            const dateStr = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD

            orders.push([variantId, quantity, price, dateStr]);
          }
          
          // Insert all orders
          orders.forEach(order => orderStmt.run(order));
          orderStmt.finalize();

          console.log('Database initialized with sample data');
        }

        // Close the database connection after all operations are complete
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
            reject(err);
            return;
          }
          resolve({
            reactStrictMode: true
          });
        });
      });
    });
  });
}

export default nextConfig;