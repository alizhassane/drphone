import * as repairService from '../services/repairService.js';
export const getRepairs = async (req, res) => {
    try {
        const repairs = await repairService.getAllRepairs();
        res.json(repairs);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch repairs' });
    }
};
export const createRepair = async (req, res) => {
    try {
        const repair = await repairService.createRepair(req.body);
        res.status(201).json(repair);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create repair' });
    }
};
export const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const repair = await repairService.updateRepairStatus(Number(id), status);
        res.json(repair);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update repair status' });
    }
};
//# sourceMappingURL=repairController.js.map