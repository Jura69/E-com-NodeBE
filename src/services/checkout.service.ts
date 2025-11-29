import { BadRequestError } from '../core/error.response';
import { order } from '../models/order.model';
import { findCartById } from '../models/repositories/cart.repo';
import { checkProductByServer } from '../models/repositories/product.repo';
import DiscountService from './discount.service';
import { releaseLock, acquireLock } from './redis.service';

interface ShopOrderItem {
  shopId: string;
  shop_discounts?: Array<{
    shopId: string;
    discountId: string;
    codeId: string;
  }>;
  item_products: Array<{
    price: number;
    quantity: number;
    productId: string;
  }>;
}

interface CheckoutReviewParams {
  cartId: string;
  userId: string;
  shop_order_ids?: ShopOrderItem[];
}

interface OrderByUserParams extends CheckoutReviewParams {
  user_address?: Record<string, any>;
  user_payment?: Record<string, any>;
}

class CheckoutService {
  static async checkoutReview({
    cartId,
    userId,
    shop_order_ids = [],
  }: CheckoutReviewParams): Promise<{
    shop_order_ids: ShopOrderItem[];
    shop_order_ids_new: any[];
    checkout_order: {
      totalPrice: number;
      feeShip: number;
      totalDiscount: number;
      totalCheckout: number;
    };
  }> {
    const foundCart = await findCartById(cartId);
    if (!foundCart) throw new BadRequestError('Cart does not exists!');

    const checkout_order = {
      totalPrice: 0,
      feeShip: 0,
      totalDiscount: 0,
      totalCheckout: 0,
    };
    const shop_order_ids_new: any[] = [];

    for (let i = 0; i < shop_order_ids.length; i++) {
      const {
        shopId,
        shop_discounts = [],
        item_products = [],
      } = shop_order_ids[i];

      const checkProductServer = (await checkProductByServer(item_products)).filter(
        (p: any): p is { price: number; quantity: number; producId: string } => p !== undefined
      );
      console.log('checkProductServer::', checkProductServer);
      if (!checkProductServer[0]) throw new BadRequestError('order wrong!!!');

      const checkoutPrice = checkProductServer.reduce((acc: number, product) => {
        return acc + product.quantity * product.price;
      }, 0);

      checkout_order.totalPrice = +checkoutPrice;

      const itemCheckout = {
        shopId,
        shop_discounts,
        priceRaw: checkoutPrice,
        priceApplyDiscount: checkoutPrice,
        item_products: checkProductServer,
      };

      if (shop_discounts.length > 0) {
        const { discount = 0 } = await DiscountService.getDiscountAmount({
          codeId: shop_discounts[0].codeId,
          userId,
          shopId,
          products: checkProductServer.map((p) => ({
            quantity: p.quantity,
            price: p.price,
          })),
        });
        checkout_order.totalDiscount += discount;

        if (discount > 0) {
          itemCheckout.priceApplyDiscount = checkoutPrice - discount;
        }
      }

      checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
      shop_order_ids_new.push(itemCheckout);
    }

    return {
      shop_order_ids,
      shop_order_ids_new,
      checkout_order,
    };
  }

  static async orderByUser({
    shop_order_ids,
    cartId,
    userId,
    user_address = {},
    user_payment = {},
  }: OrderByUserParams): Promise<any> {
    const { shop_order_ids_new, checkout_order } =
      await CheckoutService.checkoutReview({
        cartId,
        userId,
        shop_order_ids,
      });

    const products = shop_order_ids_new.flatMap((order: any) => order.item_products);

    console.log(`[1]:`, products);

    const acquireProduct: boolean[] = [];

    for (let i = 0; i < products.length; i++) {
      const { productId, quantity } = products[i];
      const keyLock = await acquireLock(productId, quantity, cartId);
      acquireProduct.push(keyLock ? true : false);
      if (keyLock) {
        await releaseLock(keyLock);
      }
    }

    if (acquireProduct.includes(false)) {
      throw new BadRequestError(
        'Mot so san pham da duoc cap nhat, vui long quay lai gio hang...'
      );
    }

    const newOrder = await order.create({
      order_userId: userId,
      order_checkout: checkout_order,
      order_shipping: user_address,
      order_payment: user_payment,
      order_products: shop_order_ids_new,
    });

    return newOrder;
  }

  static async getOrdersByUser(): Promise<void> {}
  static async getOneOrderByUser(): Promise<void> {}
  static async cancelOrderByUser(): Promise<void> {}
  static async updateOrderStatusbyShop(): Promise<void> {}
}

export default CheckoutService;

