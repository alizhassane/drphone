import * as productService from '../services/productService.js';
export const getProducts = async (req, res) => {
    try {
        const query = req.query.search;
        if (query) {
            const products = await productService.searchProducts(query);
            res.json(products);
        }
        else {
            const products = await productService.getAllProducts();
            res.json(products);
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};
export const createProduct = async (req, res) => {
    try {
        const product = await productService.createProduct(req.body);
        res.status(201).json(product);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create product' });
    }
};
//# sourceMappingURL=productController.js.map