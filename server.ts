import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";

const db = new Database("putri_parfume.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS catalog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    size INTEGER NOT NULL,
    price INTEGER NOT NULL,
    stock INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    buyer_name TEXT NOT NULL,
    aroma TEXT NOT NULL,
    size TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    order_date TEXT DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'Pending',
    delivery_date TEXT,
    is_custom INTEGER DEFAULT 0
  );
`);

// Add columns if they don't exist (for existing databases)
try {
  db.exec("ALTER TABLE orders ADD COLUMN quantity INTEGER DEFAULT 1");
} catch (e) {}
try {
  db.exec("ALTER TABLE orders ADD COLUMN is_custom INTEGER DEFAULT 0");
} catch (e) {}
try {
  // SQLite doesn't support changing column types easily, but it's flexible with types.
  // We'll just ensure we can insert text into size.
} catch (e) {}

// Seed data if empty
const catalogCount = db.prepare("SELECT COUNT(*) as count FROM catalog").get() as { count: number };
if (catalogCount.count === 0) {
  const insert = db.prepare("INSERT INTO catalog (name, size, price, stock) VALUES (?, ?, ?, ?)");
  insert.run("Mawar Melati", 30, 75000, 10);
  insert.run("Vanilla Sky", 50, 120000, 5);
  insert.run("Ocean Breeze", 30, 85000, 0); // Out of stock
  insert.run("Lavender Dream", 100, 180000, 8);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // Get Catalog
  app.get("/api/catalog", (req, res) => {
    const items = db.prepare("SELECT * FROM catalog").all();
    res.json(items);
  });

  // Add/Update Catalog Item
  app.post("/api/catalog", (req, res) => {
    const { id, name, size, price, stock } = req.body;
    if (id) {
      db.prepare("UPDATE catalog SET name = ?, size = ?, price = ?, stock = ? WHERE id = ?")
        .run(name, size, price, stock, id);
    } else {
      db.prepare("INSERT INTO catalog (name, size, price, stock) VALUES (?, ?, ?, ?)")
        .run(name, size, price, stock);
    }
    res.json({ success: true });
  });

  // Delete Catalog Item
  app.delete("/api/catalog/:id", (req, res) => {
    db.prepare("DELETE FROM catalog WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Get Orders
  app.get("/api/orders", (req, res) => {
    const items = db.prepare("SELECT * FROM orders ORDER BY order_date DESC").all();
    res.json(items);
  });

  // Create Order
  app.post("/api/orders", (req, res) => {
    const { buyer_name, aroma, size, quantity, is_custom } = req.body;
    const qty = parseInt(quantity) || 1;
    const custom = is_custom ? 1 : 0;
    
    db.prepare("INSERT INTO orders (buyer_name, aroma, size, quantity, is_custom) VALUES (?, ?, ?, ?, ?)")
      .run(buyer_name, aroma, size.toString(), qty, custom);
    
    // Reduce stock only if not custom
    if (!custom) {
      db.prepare("UPDATE catalog SET stock = stock - ? WHERE name = ? AND size = ? AND stock >= ?")
        .run(qty, aroma, size, qty);
    }

    res.json({ success: true });
  });

  // Update Order Status/Delivery
  app.patch("/api/orders/:id", (req, res) => {
    const { status, delivery_date } = req.body;
    db.prepare("UPDATE orders SET status = ?, delivery_date = ? WHERE id = ?")
      .run(status, delivery_date, req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
