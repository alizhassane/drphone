-- Create Clients Table
CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Products Table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    price REAL NOT NULL DEFAULT 0,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Repairs Table
CREATE TABLE IF NOT EXISTS repairs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER REFERENCES clients(id),
    device_details TEXT NOT NULL,
    issue_description TEXT,
    status TEXT DEFAULT 'Pending',
    cost_estimate REAL,
    depot REAL DEFAULT 0,
    warranty INTEGER DEFAULT 90,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Sales Table
CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    total_amount REAL NOT NULL DEFAULT 0,
    tax_tps REAL DEFAULT 0,
    tax_tvq REAL DEFAULT 0,
    final_total REAL NOT NULL DEFAULT 0,
    payment_method TEXT,
    status TEXT DEFAULT 'Completed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Sale Items Table
CREATE TABLE IF NOT EXISTS sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price REAL NOT NULL,
    is_manual INTEGER DEFAULT 0, -- Boolean as 0/1
    manual_name TEXT
);

-- Create Repair Parts Table (Linking Inventory to Repairs)
CREATE TABLE IF NOT EXISTS repair_parts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repair_id INTEGER REFERENCES repairs(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1
);

-- Create Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER REFERENCES sales(id),
    repair_id INTEGER REFERENCES repairs(id),
    amount REAL NOT NULL,
    method TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Phones Table (NEW)
CREATE TABLE IF NOT EXISTS phones (
    id TEXT PRIMARY KEY, -- UUID
    imei TEXT UNIQUE NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    storage TEXT NOT NULL,
    color TEXT NOT NULL,
    condition TEXT NOT NULL, -- A, B, C
    battery_health INTEGER,
    buying_price REAL NOT NULL,
    selling_price REAL NOT NULL,
    warranty_days INTEGER DEFAULT 30,
    status TEXT DEFAULT 'in_stock', -- in_stock, sold, returned
    source TEXT DEFAULT 'customer', -- customer, supplier
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Phone Purchases Table (NEW)
CREATE TABLE IF NOT EXISTS phone_purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone_id TEXT REFERENCES phones(id),
    client_id INTEGER REFERENCES clients(id),
    purchase_price REAL NOT NULL,
    payment_method TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Note: sale_items updated to support phone_id mapping
-- ALTER TABLE sale_items ADD COLUMN phone_id TEXT REFERENCES phones(id);
