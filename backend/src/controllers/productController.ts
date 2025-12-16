import type { Request, Response } from 'express';
import * as productService from '../services/productService.js';

export const getProductBySku = async (req: Request, res: Response) => {
    try {
        const sku = req.params.sku;
        if (!sku) {
            res.status(400).json({ error: 'SKU is required' });
            return;
        }
        const product = await productService.getProductBySku(sku);
        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
};

export const getProducts = async (req: Request, res: Response) => {
    try {
        const query = req.query.search as string;
        if (query) {
            const products = await productService.searchProducts(query);
            res.json(products);
        } else {
            const products = await productService.getAllProducts();
            res.json(products);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const product = await productService.createProduct(req.body);
        res.status(201).json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create product' });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const product = await productService.updateProduct(id, req.body);
        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update product' });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        await productService.deleteProduct(id);
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete product' });
    }
};
