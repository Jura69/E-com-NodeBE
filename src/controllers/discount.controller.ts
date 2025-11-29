import { Request, Response, NextFunction } from 'express';
import DiscountService from '../services/discount.service';
import { SuccessResponse } from '../core/success.response';
import { AuthRequest } from '../auth/authUtils';

class DiscountController {
  createDiscountCode = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    new SuccessResponse({
      message: 'Successful Code Generations',
      metadata: await DiscountService.createDiscountCode({
        ...req.body,
        shopId: req.user?.userId || '',
      }),
    }).send(res);
  };

  getAllDiscountCodes = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    new SuccessResponse({
      message: 'Successful Code Found',
      metadata: await DiscountService.getAllDiscountCodesByShop({
        ...req.query,
        shopId: req.user?.userId || '',
      } as any),
    }).send(res);
  };

  getDiscountAmount = async (
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    new SuccessResponse({
      message: 'Successful Code Found',
      metadata: await DiscountService.getDiscountAmount(req.body),
    }).send(res);
  };

  getAllDiscountCodesWithProducts = async (
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    new SuccessResponse({
      message: 'Successful Code Found',
      metadata: await DiscountService.getAllDiscountCodesWithProduct(req.query as any),
    }).send(res);
  };
}

export default new DiscountController();

