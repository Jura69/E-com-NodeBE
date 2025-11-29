import { Request, Response, NextFunction } from 'express';
import { CREATED, SuccessResponse } from '../core/success.response';
import AccessService from '../services/access.service';
import { AuthRequest } from '../auth/authUtils';

class AccessController {
  handlerRefreshToken = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    if (!req.user || !req.keyStore || !req.refreshToken) {
      throw new Error('Invalid request');
    }
    new SuccessResponse({
      message: 'Get token success!',
      metadata: await AccessService.handlerRefreshTokenV2({
        refreshToken: req.refreshToken,
        user: { userId: req.user.userId, email: req.user.email || '' },
        keyStore: req.keyStore,
      }),
    }).send(res);
  };

  logOut = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    new SuccessResponse({
      message: 'Logout success',
      metadata: await AccessService.logOut(req.keyStore!),
    }).send(res);
  };

  logIn = async (
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    new SuccessResponse({
      metadata: await AccessService.logIn(req.body),
    }).send(res);
  };

  signUp = async (
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    new CREATED({
      message: 'Registered OK!',
      metadata: (await AccessService.signUp(req.body)).metadata,
    }).send(res);
  };
}

export default new AccessController();

