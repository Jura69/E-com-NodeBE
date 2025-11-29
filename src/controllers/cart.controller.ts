import { Request, Response, NextFunction } from 'express';
import CartService from '../services/cart.service';
import { SuccessResponse } from '../core/success.response';
import { AuthRequest } from '../auth/authUtils';

class CartController {
  addToCart = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    const userId = req.user?.userId || (req.headers['x-client-id'] as string);
    if (!userId) {
      throw new Error('User ID is required');
    }
    new SuccessResponse({
      message: 'Create new Cart success',
      metadata: await CartService.addToCart({
        userId,
        product: req.body.product,
      }),
    }).send(res);
  };

  update = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    const userId = req.user?.userId || (req.headers['x-client-id'] as string);
    if (!userId) {
      throw new Error('User ID is required');
    }
    new SuccessResponse({
      message: 'Create new Cart success',
      metadata: await CartService.addToCartV2({
        userId,
        shop_order_ids: req.body.shop_order_ids,
      }),
    }).send(res);
  };

  delete = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    const userId = req.user?.userId || (req.headers['x-client-id'] as string);
    if (!userId) {
      throw new Error('User ID is required');
    }
    new SuccessResponse({
      message: 'Deleted Cart success',
      metadata: await CartService.deleteUserCart({
        userId,
        productId: req.body.productId,
      }),
    }).send(res);
  };

  listToCart = async (
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    const userId =
      (req as AuthRequest).user?.userId ||
      (req.headers['x-client-id'] as string) ||
      (req.query.userId as string);
    if (!userId) {
      throw new Error('User ID is required');
    }
    new SuccessResponse({
      message: 'List Cart success',
      metadata: await CartService.getListUserCart({ userId }),
    }).send(res);
  };
}

export default new CartController();

