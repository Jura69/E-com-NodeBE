import { inventory } from '../inventory.model';
import { convertToObjectIdMongodb } from '../../utils';

export const insertInvetory = async ({
  productId,
  shopId,
  stock,
  location = 'unKnow',
}: {
  productId: string | any;
  shopId: string | any;
  stock: number;
  location?: string;
}): Promise<any> => {
  return await inventory.create({
    inven_productId: productId,
    inven_stock: stock,
    inven_location: location,
    inven_shopId: shopId,
  });
};

export const reservationInventory = async ({
  productId,
  quantity,
  cartId,
}: {
  productId: string;
  quantity: number;
  cartId: string;
}): Promise<any> => {
  const query = {
    inven_productId: convertToObjectIdMongodb(productId),
    inven_stock: { $gte: quantity },
  };

  const updateSet = {
    $inc: {
      inven_stock: -quantity,
    },
    $push: {
      inven_reservations: {
        quantity,
        cartId,
        createOn: new Date(),
      },
      },
    };

  return await inventory.updateOne(query, updateSet);
};

