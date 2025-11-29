import express, { Router } from 'express';
import { asyncHandler } from '../../helpers/asyncHandler';
import { authenticationV2 } from '../../auth/authUtils';
import NotificationController from '../../controllers/notification.controller';

const router: Router = express.Router();

// authentication
router.use(authenticationV2);

router.get('', asyncHandler(NotificationController.listNotiByUser));

export default router;

