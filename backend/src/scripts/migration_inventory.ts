
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// Manual definition of hierarchy to avoid import issues from frontend
const INVENTORY_HIERARCHY = [
    {
        id: 'phone',
        name: 'Téléphone',
        brands: [
            {
                id: 'apple',
                name: 'Apple',
                models: [
                    'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
                    'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
                    'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13 mini', 'iPhone 13',
                    'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12 mini', 'iPhone 12',
                    'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11',
                    'iPhone XS Max', 'iPhone XS', 'iPhone XR', 'iPhone X',
                    'iPhone 8 Plus', 'iPhone 8', 'iPhone SE (2020)', 'iPhone SE (2022)'
                ]
            },
            {
                id: 'samsung',
                name: 'Samsung',
                models: [
                    'Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24',
                    'Galaxy S23 Ultra', 'Galaxy S23+', 'Galaxy S23',
                    'Galaxy S22 Ultra', 'Galaxy S22+', 'Galaxy S22',
                    'Galaxy S21 Ultra', 'Galaxy S21+', 'Galaxy S21',
                    'Galaxy A54', 'Galaxy A53', 'Galaxy A34', 'Galaxy A14'
                ]
            },
            {
                id: 'google',
                name: 'Google',
                models: [
                    'Pixel 8 Pro', 'Pixel 8',
                    'Pixel 7 Pro', 'Pixel 7', 'Pixel 7a',
                    'Pixel 6 Pro', 'Pixel 6', 'Pixel 6a'
                ]
            },
            {
                id: 'motorola',
                name: 'Motorola',
                models: ['Moto G Power', 'Moto G Stylus', 'Edge+', 'Razr+']
            }
        ]
    },
    {
        id: 'tablet',
        name: 'Tablette',
        brands: [
            {
                id: 'apple',
                name: 'Apple',
                models: [
                    'iPad Pro 12.9 (6th gen)', 'iPad Pro 11 (4th gen)',
                    'iPad Air (5th gen)', 'iPad (10th gen)', 'iPad mini (6th gen)'
                ]
            },
            {
                id: 'samsung',
                name: 'Samsung',
                models: ['Galaxy Tab S9 Ultra', 'Galaxy Tab S9', 'Galaxy Tab S8', 'Galaxy Tab A8']
            }
        ]
    },
    {
        id: 'console',
        name: 'Console',
        brands: [
            {
                id: 'sony',
                name: 'Sony',
                models: ['PlayStation 5', 'PlayStation 5 Digital', 'PlayStation 4 Pro', 'PlayStation 4 Slim', 'PlayStation 4']
            },
            {
                id: 'microsoft',
                name: 'Microsoft',
                models: ['Xbox Series X', 'Xbox Series S', 'Xbox One X', 'Xbox One S']
            },
            {
                id: 'nintendo',
                name: 'Nintendo',
                models: ['Switch OLED', 'Switch', 'Switch Lite']
            }
        ]
    },
    {
        id: 'laptop',
        name: 'Laptop',
        brands: [
            {
                id: 'apple',
                name: 'Apple',
                models: ['MacBook Pro 14 M3', 'MacBook Pro 16 M3', 'MacBook Air 15 M2', 'MacBook Air 13 M2', 'MacBook Air 13 M1']
            },
            {
                id: 'dell',
                name: 'Dell',
                models: ['XPS 15', 'XPS 13', 'Inspiron 15']
            },
            {
                id: 'hp',
                name: 'HP',
                models: ['Spectre x360', 'Envy', 'Pavilion']
            },
            {
                id: 'lenovo',
                name: 'Lenovo',
                models: ['ThinkPad X1 Carbon', 'IdeaPad']
            }
        ]
    },
    {
        id: 'computer',
        name: 'Ordinateur',
        brands: [
            {
                id: 'custom',
                name: 'Custom / Gaming',
                models: ['Tower ATX', 'Mini ITX']
            },
            {
                id: 'apple',
                name: 'Apple',
                models: ['iMac 24 M3', 'Mac Studio', 'Mac mini']
            }
        ]
    }
];

async function migrate() {
    // In ESM, __dirname is not available. Using process.cwd() is often easier for scripts run from project root.
    // Assuming script is run from backend/ dir.
    const dbPath = path.resolve(process.cwd(), 'database_new.sqlite');

    console.log('Opening DB at:', dbPath);

    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    try {
        console.log('Starting Inventory Hierarchy Migration...');

        // 1. Create Tables
        await db.exec(`
            CREATE TABLE IF NOT EXISTS device_categories (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL
            );
        `);

        await db.exec(`
            CREATE TABLE IF NOT EXISTS brands (
                id TEXT PRIMARY KEY,
                category_id TEXT,
                name TEXT NOT NULL,
                FOREIGN KEY(category_id) REFERENCES device_categories(id) ON DELETE CASCADE
            );
        `);

        await db.exec(`
            CREATE TABLE IF NOT EXISTS models (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                brand_id TEXT,
                name TEXT NOT NULL,
                FOREIGN KEY(brand_id) REFERENCES brands(id) ON DELETE CASCADE
            );
        `);

        // NEW: parts_catalog table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS parts_catalog (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category_id TEXT,
                name TEXT NOT NULL,
                FOREIGN KEY(category_id) REFERENCES device_categories(id) ON DELETE CASCADE
            );
        `);


        // 2. Seed Data
        for (const cat of INVENTORY_HIERARCHY) {
            // Insert Category
            await db.run(
                'INSERT OR IGNORE INTO device_categories (id, name) VALUES (?, ?)',
                [cat.id, cat.name]
            );

            for (const brand of cat.brands) {
                // Determine a unique ID for brand (since ID 'apple' duplicates across cat)
                // We'll use composite or generate a uuid. But existing 'id' is simple 'apple'.
                // To support 'Apple' in both Phone and Laptop, we must uniquify the ID or allow dups?
                // The frontend 'id' was simple string.
                // Let's make primary key composite or just use a generated UUID for brand table, 
                // but keep the 'slug' for reference if needed?
                // Actually, let's keep it simple: brand ID will be 'category_brand' e.g. 'phone_apple' to be unique.

                const uniqueBrandId = `${cat.id}_${brand.id}`;

                await db.run(
                    'INSERT OR IGNORE INTO brands (id, category_id, name) VALUES (?, ?, ?)',
                    [uniqueBrandId, cat.id, brand.name]
                );

                for (const modelName of brand.models) {
                    await db.run(
                        'INSERT INTO models (brand_id, name) VALUES (?, ?)',
                        [uniqueBrandId, modelName]
                    ); // ID auto increments
                }
            }
        }

        console.log('Migration completed successfully.');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await db.close();
    }
}

migrate();
