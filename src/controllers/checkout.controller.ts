import { Request, Response, NextFunction } from 'express';
import CheckoutService from '../services/checkout.service';
import { SuccessResponse } from '../core/success.response';

class CheckoutController {
  checkoutReview = async (
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    new SuccessResponse({
      message: 'Create new Checkout success',
      metadata: await CheckoutService.checkoutReview(req.body),
    }).send(res);
  };
}

export default new CheckoutController();

