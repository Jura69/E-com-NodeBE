import express, { Router } from 'express';
import cartController from '../../controllers/cart.controller';
import { asyncHandler } from '../../helpers/asyncHandler';
import { authenticationV2 } from '../../auth/authUtils';

const router: Router = express.Router();

router.use(authenticationV2);

router.post('', asyncHandler(cartController.addToCart));
router.patch('', asyncHandler(cartController.update));
router.delete('', asyncHandler(cartController.delete));
router.get('', asyncHandler(cartController.listToCart));

export default router;

