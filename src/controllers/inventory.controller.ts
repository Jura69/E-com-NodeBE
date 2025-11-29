import { Request, Response, NextFunction } from 'express';
import InventoryService from '../services/inventory.service';
import { SuccessResponse } from '../core/success.response';

class InventoryController {
  addStockToInventory = async (
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    new SuccessResponse({
      message: 'Create new addStockToInventory',
      metadata: await InventoryService.addStockToInventory(req.body),
    }).send(res);
  };
}

export default new InventoryController();

