import express, { Router } from 'express';
import accessController from '../../controllers/access.controller';
import { asyncHandler } from '../../helpers/asyncHandler';
import { authenticationV2 } from '../../auth/authUtils';

const router: Router = express.Router();

// signUp
router.post('/shop/signup', asyncHandler(accessController.signUp));
router.post('/shop/login', asyncHandler(accessController.logIn));

// authentication
router.use(authenticationV2);

router.post('/shop/logout', asyncHandler(accessController.logOut));
router.post(
  '/shop/handlerRefreshToken',
  asyncHandler(accessController.handlerRefreshToken)
);

export default router;

