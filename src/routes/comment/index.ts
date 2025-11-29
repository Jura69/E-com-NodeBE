import express, { Router } from 'express';
import { asyncHandler } from '../../helpers/asyncHandler';
import { authenticationV2 } from '../../auth/authUtils';
import CommentController from '../../controllers/comment.controller';

const router: Router = express.Router();

// authentication
router.use(authenticationV2);

router.post('', asyncHandler(CommentController.createComment));
router.delete('', asyncHandler(CommentController.deleteComment));
router.get('', asyncHandler(CommentController.getCommentsByParentId));

export default router;

