import express, { Router } from 'express';
import uploadController from '../../controllers/upload.controller';
import { asyncHandler } from '../../helpers/asyncHandler';
import { uploadDisk } from '../../configs/multer.config';

const router: Router = express.Router();

router.post('/product', asyncHandler(uploadController.uploadFileUrl));
router.post(
  '/product/local',
  uploadDisk.single('file'),
  asyncHandler(uploadController.uploadFileLocal)
);

export default router;

