import * as saleService from '../services/saleService.js';
export const createSale = async (req, res) => {
    try {
        const sale = await saleService.createSale(req.body);
        res.status(201).json(sale);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create sale' });
    }
};
export const getSales = async (req, res) => {
    try {
        const sales = await saleService.getAllSales();
        res.json(sales);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch sales' });
    }
};
//# sourceMappingURL=saleController.js.map