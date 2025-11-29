import { Request, Response, NextFunction } from 'express';
import { SuccessResponse } from '../core/success.response';
import ProductService from '../services/product.service';
import { AuthRequest } from '../auth/authUtils';

class ProductController {
  createProduct = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    new SuccessResponse({
      message: 'Create product success',
      metadata: await ProductService.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user?.userId || '',
      }),
    }).send(res);
  };

  updateProduct = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    new SuccessResponse({
      message: 'Update product success',
      metadata: await ProductService.updateProduct(
        req.body.product_type,
        req.params.productId,
        {
          ...req.body,
          product_shop: req.user?.userId || '',
        }
      ),
    }).send(res);
  };

  publishProductByShop = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    new SuccessResponse({
      message: 'publishProductByShop success',
      metadata: await ProductService.publishProductByShop({
        product_id: req.params.id,
        product_shop: req.user?.userId || '',
      }),
    }).send(res);
  };

  unPublishProductByShop = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    new SuccessResponse({
      message: 'unPublishProductByShop success',
      metadata: await ProductService.unPublishProductByShop({
        product_id: req.params.id,
        product_shop: req.user?.userId || '',
      }),
    }).send(res);
  };

  getAllDraftsForShop = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    new SuccessResponse({
      message: 'Get list success!',
      metadata: await ProductService.findAllDraftsForShop({
        product_shop: req.user?.userId || '',
      }),
    }).send(res);
  };

  getAllPublishForShop = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    new SuccessResponse({
      message: 'Get AllPublishForShop success!',
      metadata: await ProductService.findAllPublishForShop({
        product_shop: req.user?.userId || '',
      }),
    }).send(res);
  };

  getListSearchProduct = async (
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    new SuccessResponse({
      message: 'Get ListSearchProduct success!',
      metadata: await ProductService.searchProducts(req.params as { keySearch: string }),
    }).send(res);
  };

  findAllProducts = async (
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    new SuccessResponse({
      message: 'Get findAllProducts success!',
      metadata: await ProductService.findAllProducts(req.query as any),
    }).send(res);
  };

  findProduct = async (
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    new SuccessResponse({
      message: 'Get findProduct success!',
      metadata: await ProductService.findProduct({
        product_id: req.params.product_id,
      }),
    }).send(res);
  };
}

export default new ProductController();

