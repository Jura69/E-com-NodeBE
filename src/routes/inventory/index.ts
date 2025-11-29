import express, { Router } from 'express';
import inventoryController from '../../controllers/inventory.controller';
import { asyncHandler } from '../../helpers/asyncHandler';
import { authenticationV2 } from '../../auth/authUtils';

const router: Router = express.Router();

router.use(authenticationV2);
router.post('', asyncHandler(inventoryController.addStockToInventory));

export default router;

