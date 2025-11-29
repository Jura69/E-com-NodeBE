import express, { Router } from 'express';
import { apiKey, permission } from '../auth/checkAuth';
import accessRoutes from './access';
import cartRoutes from './cart';
import productRoutes from './product';
import checkoutRoutes from './checkout';
import notificationRoutes from './notification';

const router: Router = express.Router();

// Public routes
router.use('/v1/api', accessRoutes);

// Protected routes
// check apikey
router.use(apiKey);
// check permission
router.use(permission('0000'));

router.use('/v1/api/checkout', checkoutRoutes);
import discountRoutes from './discount';
import commentRoutes from './comment';
import inventoryRoutes from './inventory';
import uploadRoutes from './upload';
router.use('/v1/api/discount', discountRoutes);
router.use('/v1/api/inventory', inventoryRoutes);
router.use('/v1/api/cart', cartRoutes);
router.use('/v1/api/product', productRoutes);
router.use('/v1/api/upload', uploadRoutes);
router.use('/v1/api/comment', commentRoutes);
router.use('/v1/api/notification', notificationRoutes);

// Shop routes (if needed in future)
// import shopRoutes from './shop';
// router.use('/v1/api/shop', shopRoutes);

export default router;

