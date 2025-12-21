
import express from 'express';
import * as inventoryController from '../controllers/inventoryController.js';

const router = express.Router();

router.get('/hierarchy', inventoryController.getHierarchy);

router.post('/categories', inventoryController.addCategory);
router.delete('/categories/:id', inventoryController.deleteCategory);

router.post('/brands', inventoryController.addBrand);
router.delete('/brands/:id', inventoryController.deleteBrand);

router.post('/models', inventoryController.addModel);

// Delete by query params (brandId, name) - MUST match exact /models path
router.delete('/models', inventoryController.deleteModel);
// Delete by ID
router.delete('/models/:id', inventoryController.deleteModel);

export default router;
