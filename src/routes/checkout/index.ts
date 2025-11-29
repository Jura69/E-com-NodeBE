import express, { Router } from 'express';
import checkoutController from '../../controllers/checkout.controller';
import { asyncHandler } from '../../helpers/asyncHandler';
import { authenticationV2 } from '../../auth/authUtils';

const router: Router = express.Router();

router.use(authenticationV2);

router.post('/review', asyncHandler(checkoutController.checkoutReview));

export default router;

