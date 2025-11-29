import express, { Router } from 'express';
import discountController from '../../controllers/discount.controller';
import { asyncHandler } from '../../helpers/asyncHandler';
import { authenticationV2 } from '../../auth/authUtils';

const router: Router = express.Router();

// get amount a discount
router.post('/amount', asyncHandler(discountController.getDiscountAmount));
router.get(
  '/list_product_code',
  asyncHandler(discountController.getAllDiscountCodesWithProducts)
);

// authentication
router.use(authenticationV2);

router.post('', asyncHandler(discountController.createDiscountCode));
router.get('', asyncHandler(discountController.getAllDiscountCodes));

export default router;

