import { Request, Response, NextFunction } from 'express';
import { SuccessResponse } from '../core/success.response';
import {
  createComment,
  getCommentsByParentId,
  deleteComment,
} from '../services/comment.service';

class CommentController {
  createComment = async (
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    new SuccessResponse({
      message: 'create new comment',
      metadata: await createComment(req.body),
    }).send(res);
  };

  deleteComment = async (
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    new SuccessResponse({
      message: 'delete Comments',
      metadata: await deleteComment(req.body),
    }).send(res);
  };

  getCommentsByParentId = async (
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    new SuccessResponse({
      message: 'parent comment',
      metadata: await getCommentsByParentId(req.query as any),
    }).send(res);
  };
}

export default new CommentController();

