import { inventory } from '../models/inventory.model';
import { getProductById } from '../models/repositories/product.repo';
import { BadRequestError } from '../core/error.response';

class InventoryService {
  static async addStockToInventory({
    stock,
    productId,
    shopId,
    location = '134, Tran Phu, HCM city',
  }: {
    stock: number;
    productId: string;
    shopId: string;
    location?: string;
  }): Promise<any> {
    const product = await getProductById(productId);
    if (!product) throw new BadRequestError('The product does not exists!');

    const query = { inven_shopId: shopId, inven_productId: productId };
    const updateSet = {
      $inc: {
        inven_stock: stock,
      },
      $set: {
        inven_location: location,
      },
    };
    const options = { upsert: true, new: true };

    return await inventory.findOneAndUpdate(query, updateSet, options);
  }
}

export default InventoryService;

