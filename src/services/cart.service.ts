import { BadRequestError, NotFoundError } from '../core/error.response';
import { cart, ICartProduct } from '../models/cart.model';
import { getProductById } from '../models/repositories/product.repo';
import mongoose, { Types } from 'mongoose';

class CartService {
  static async createUserCart({
    userId,
    product,
  }: {
    userId: string | Types.ObjectId;
    product: ICartProduct;
  }): Promise<any> {
    const userIdObj = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;
    const query = { cart_userId: userIdObj, cart_state: 'active' };
    const updateOrInsert = {
      $addToSet: {
        cart_products: product,
      },
    };
    const options = { upsert: true, new: true };
    return await cart.findOneAndUpdate(query, updateOrInsert, options);
  }

  static async updateUserCartQuantity({
    userId,
    product,
  }: {
    userId: string | Types.ObjectId;
    product: { productId: string; quantity: number };
  }): Promise<any> {
    const { productId, quantity } = product;
    const userIdObj = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;
    const query = {
      cart_userId: userIdObj,
      'cart_products.productId': productId,
      cart_state: 'active',
    };
    const updateSet = {
      $inc: {
        'cart_products.$.quantity': quantity,
      },
    };
    const options = { upsert: true, new: true };
    return await cart.findOneAndUpdate(query, updateSet, options);
  }

  static async addToCart({
    userId,
    product,
  }: {
    userId: string | Types.ObjectId;
    product: ICartProduct;
  }): Promise<any> {
    const userIdObj = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;
    const userCart = await cart.findOne({
      cart_userId: userIdObj,
      cart_state: 'active',
    });

    if (!userCart) {
      return await CartService.createUserCart({ userId, product });
    }

    if (!userCart.cart_products.length) {
      userCart.cart_products.push(product);
      return await userCart.save();
    }

    const productExists = userCart.cart_products.some(
      (p: any) => p.productId.toString() === product.productId
    );

    if (productExists) {
      return await CartService.updateUserCartQuantity({ userId, product });
    } else {
      userCart.cart_products.push(product);
      return await userCart.save();
    }
  }

  static async addToCartV2({
    userId,
    shop_order_ids,
  }: {
    userId: string | Types.ObjectId;
    shop_order_ids: Array<{
      shopId: string;
      item_products: Array<{
        productId: string;
        quantity: number;
        old_quantity: number;
      }>;
    }>;
  }): Promise<any> {
    const userIdObj = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;
    const { productId, quantity, old_quantity } =
      shop_order_ids[0]?.item_products[0] || {};
    if (!productId) throw new BadRequestError('Product ID is required');

    const foundProduct = await getProductById(productId);
    if (!foundProduct) throw new NotFoundError('Product not found');

    if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId) {
      throw new NotFoundError('Product do not belong to the shop');
    }

    if (quantity === 0) {
      // deleted
    }

    return await CartService.updateUserCartQuantity({
      userId: userIdObj,
      product: {
        productId,
        quantity: quantity - old_quantity,
      },
    });
  }

  static async deleteUserCart({
    userId,
    productId,
  }: {
    userId: string | Types.ObjectId;
    productId: string;
  }): Promise<any> {
    const userIdObj = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;
    const query = { cart_userId: userIdObj, cart_state: 'active' };
    const updateSet = {
      $pull: {
        cart_products: {
          productId,
        },
      },
    };

    const deleteCart = await cart.updateOne(query, updateSet);
    return deleteCart;
  }

  static async getListUserCart({
    userId,
  }: {
    userId: string | Types.ObjectId;
  }): Promise<any> {
    const userIdObj = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;
    return await cart
      .findOne({
        cart_userId: userIdObj,
      })
      .lean();
  }
}

export default CartService;

