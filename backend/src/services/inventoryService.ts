
import { getDb } from '../config/db.js';

interface Category { id: string; name: string; }
interface Brand { id: string; category_id: string; name: string; }
interface Model { id: number; brand_id: string; name: string; }

export const getInventoryHierarchy = async () => {
    const db = await getDb();

    // Get all categories
    const categories = await db.all<Category[]>('SELECT * FROM device_categories');

    // Get all brands
    const brands = await db.all<Brand[]>('SELECT * FROM brands');

    // Get all models
    const models = await db.all<Model[]>('SELECT * FROM models');

    // Assemble hierarchy
    // This could be done with JOINs but for hierarchy stricture assembly JS is often easier to read

    const hierarchy = categories.map((cat: Category) => {
        const catBrands = brands.filter((b: Brand) => b.category_id === cat.id);

        const mappedBrands = catBrands.map((brand: Brand) => {
            const brandModels = models
                .filter((m: Model) => m.brand_id === brand.id)
                .map((m: Model) => m.name); // Frontend expects just array of strings for models currently

            return {
                id: brand.id,
                name: brand.name,
                models: brandModels
            };
        });

        return {
            id: cat.id,
            name: cat.name,
            brands: mappedBrands,
            // Parts are not yet dynamic in DB fully (only stubbed), so we static fallbacks or fetch if exists
            // For now adhering to existing structure, parts are hardcoded in frontend or we can add them to DB later
            // The migration added `parts_catalog` but we didn't seed it.
            // Let's return empty array or default list for now to not break types.
            parts: [
                'Écran',
                'Batterie',
                'Connecteur de charge',
                'Caméra arrière',
                'Caméra avant',
                'Vitre arrière',
                'Haut-parleur',
                'Écouteur interne',
                'Bouton Home/Power',
                'Nappe volume',
                'Vibreur',
                'Carte mère',
                'Face ID / Touch ID',
                'Autre'
            ]
        };
    });

    return hierarchy;
};

// --- CRUD Operations ---

// Categories
export const addCategory = async (id: string, name: string) => {
    const db = await getDb();
    await db.run('INSERT INTO device_categories (id, name) VALUES (?, ?)', [id, name]);
    return { id, name };
};

export const deleteCategory = async (id: string) => {
    const db = await getDb();
    await db.run('DELETE FROM device_categories WHERE id = ?', [id]);
};

// Brands
export const addBrand = async (categoryId: string, name: string) => {
    const db = await getDb();
    // Generate an ID for the brand. Simple approach: timestamp or uuid.
    // Or simpler: name-slug.
    // The migration used Composite like "phone_apple". 
    // Let's generate a unique one.
    const id = `${categoryId}_${name.toLowerCase().replace(/\s+/g, '')}_${Date.now()}`;

    await db.run('INSERT INTO brands (id, category_id, name) VALUES (?, ?, ?)', [id, categoryId, name]);
    return { id, category_id: categoryId, name, models: [] };
};

export const deleteBrand = async (id: string) => {
    const db = await getDb();
    await db.run('DELETE FROM brands WHERE id = ?', [id]);
};

// Models
export const addModel = async (brandId: string, name: string) => {
    const db = await getDb();
    const result = await db.run('INSERT INTO models (brand_id, name) VALUES (?, ?)', [brandId, name]);
    return { id: result.lastID, brand_id: brandId, name };
};

export const deleteModel = async (id: number) => { // Model ID is integer in DB
    const db = await getDb();
    await db.run('DELETE FROM models WHERE id = ?', [id]);
};

// We might need a way to delete model by name if the frontend sends name (since models are string[] in the hierarchy type)
// But for management UI we should probably use IDs. 
// Existing Hierarchy type has `models: string[]`. 
// The management UI will probably need to know IDs to delete efficiently.
// We will address this by extending the type on frontend or handling lookup.
export const deleteModelByName = async (brandId: string, name: string) => {
    const db = await getDb();
    await db.run('DELETE FROM models WHERE brand_id = ? AND name = ?', [brandId, name]);
};
