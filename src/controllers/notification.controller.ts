import { Request, Response, NextFunction } from 'express';
import { SuccessResponse } from '../core/success.response';
import { listNotiByUser } from '../services/notification.service';

class NotificationController {
  listNotiByUser = async (
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    new SuccessResponse({
      message: 'create new listNotiByUser',
      metadata: await listNotiByUser(req.query as any),
    }).send(res);
  };
}

export default new NotificationController();

