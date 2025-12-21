
import type { Request, Response } from 'express';
import * as inventoryService from '../services/inventoryService.js';

export const getHierarchy = async (req: Request, res: Response) => {
    try {
        const hierarchy = await inventoryService.getInventoryHierarchy();
        res.json(hierarchy);
    } catch (error) {
        console.error('Error fetching hierarchy:', error);
        res.status(500).json({ error: 'Failed to fetch hierarchy' });
    }
};

export const addCategory = async (req: Request, res: Response) => {
    try {
        const { id, name } = req.body;
        if (!id || !name) {
            res.status(400).json({ error: 'ID and Name are required' });
            return;
        }
        const result = await inventoryService.addCategory(id, name);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ error: 'Failed to add category' });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await inventoryService.deleteCategory(id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete category' });
    }
};

export const addBrand = async (req: Request, res: Response) => {
    try {
        const { categoryId, name } = req.body;
        const result = await inventoryService.addBrand(categoryId, name);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error adding brand:', error);
        res.status(500).json({ error: 'Failed to add brand' });
    }
};

export const deleteBrand = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await inventoryService.deleteBrand(id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting brand:', error);
        res.status(500).json({ error: 'Failed to delete brand' });
    }
};

export const addModel = async (req: Request, res: Response) => {
    try {
        const { brandId, name } = req.body;
        console.log(`Adding model '${name}' to brand '${brandId}'`);
        const result = await inventoryService.addModel(brandId, name);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error adding model:', error);
        res.status(500).json({ error: 'Failed to add model' });
    }
};

export const deleteModel = async (req: Request, res: Response) => {
    try {
        // We accept query params to distinguish delete by ID or Name+Brand
        const { id } = req.params;
        // If ID is numeric, assume ID delete? Actually route param string.
        // Let's try to parse as int or use specific route.
        // Simpler: Use query param for delete-by-name if needed, or stick to just name deletion since frontend uses strings currently.

        // Actually, frontend Hierarchy has string[] for models. It does NOT have IDs.
        // So we MUST delete by (BrandID + Name).
        const brandId = req.query.brandId as string;
        const name = req.query.name as string;

        if (brandId && name) {
            await inventoryService.deleteModelByName(brandId, name);
            res.json({ success: true });
            return;
        }

        // Fallback to ID if provided directly (though route is /:id usually)
        if (id) {
            // If we implement ID based deletion later
            // await inventoryService.deleteModel(Number(id));
        }

        res.status(400).json({ error: 'Missing brandId and name query params' });

    } catch (error) {
        res.status(500).json({ error: 'Failed to delete model' });
    }
};
