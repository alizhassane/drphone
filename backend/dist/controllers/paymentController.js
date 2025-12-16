import * as paymentService from '../services/paymentService.js';
export const getPayments = async (req, res) => {
    try {
        const payments = await paymentService.getAllPayments();
        res.json(payments);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
};
//# sourceMappingURL=paymentController.js.map