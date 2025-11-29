import { convertToObjectIdMongodb } from '../../utils';
import { cart } from '../cart.model';

export const findCartById = async (cartId: string): Promise<any> => {
  return await cart
    .findOne({ _id: convertToObjectIdMongodb(cartId), cart_state: 'active' })
    .lean();
};

