import { BadRequestError, NotFoundError } from '../core/error.response';
import discount, { IDiscount } from '../models/discount.model';
import {
  findAllDiscountCodesSelect,
  checkDiscountExists,
} from '../models/repositories/discount.repo';
import { findAllProducts } from '../models/repositories/product.repo';
import { convertToObjectIdMongodb } from '../utils';

interface CreateDiscountPayload {
  code: string;
  start_date: string | Date;
  end_date: string | Date;
  is_active?: boolean;
  users_used?: any[];
  shopId: string;
  min_order_value?: number;
  product_ids?: string[];
  applies_to: 'all' | 'specific';
  name: string;
  description: string;
  type: string;
  value: number;
  max_value?: number;
  max_uses: number;
  uses_count?: number;
  max_uses_per_user: number;
}

interface GetDiscountAmountParams {
  codeId: string;
  userId: string;
  shopId: string;
  products: Array<{ quantity: number; price: number }>;
}

class DiscountService {
  static async createDiscountCode(payload: CreateDiscountPayload): Promise<IDiscount> {
    const {
      code,
      start_date,
      end_date,
      is_active,
      users_used,
      shopId,
      min_order_value,
      product_ids,
      applies_to,
      name,
      description,
      type,
      value,
      max_value,
      max_uses,
      uses_count,
      max_uses_per_user,
    } = payload;

    if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
      throw new BadRequestError('Discount code has expried!');
    }

    if (new Date(start_date) > new Date(end_date)) {
      throw new BadRequestError('Start date must be less than end date!');
    }

    const foundDiscount = await discount
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectIdMongodb(shopId),
      })
      .lean();

    if (foundDiscount) {
      throw new BadRequestError('Discount existed!');
    }

    const newDiscount = await discount.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_code: code,
      discount_value: value,
      discount_min_order_value: min_order_value || 0,
      discount_max_value: max_value,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_max_uses: max_uses,
      discount_uses_count: uses_count || 0,
      discount_users_used: users_used || [],
      discount_shopId: shopId as any,
      discount_max_uses_per_user: max_uses_per_user,
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids: applies_to === 'all' ? [] : (product_ids as any),
    });
    return newDiscount;
  }

  static async updateDiscountCode(): Promise<void> {
    // ...
  }

  static async getAllDiscountCodesWithProduct({
    code,
    shopId,
    limit,
    page,
  }: {
    code: string;
    shopId: string;
    userId?: string;
    limit?: number;
    page?: number;
  }): Promise<any[]> {
    const foundDiscount = await discount
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectIdMongodb(shopId),
      })
      .lean();

    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundError('discount not exists!');
    }

    const { discount_applies_to, discount_product_ids } = foundDiscount;
    let products: any[];
    if (discount_applies_to === 'all') {
      products = await findAllProducts({
        filter: {
          product_shop: convertToObjectIdMongodb(shopId),
          isPublished: true,
        },
        limit: Number(limit) || 50,
        page: Number(page) || 1,
        sort: 'ctime',
        select: ['product_name'],
      });
    } else {
      products = await findAllProducts({
        filter: {
          isPublished: true,
          _id: { $in: discount_product_ids },
        },
        limit: Number(limit) || 50,
        page: Number(page) || 1,
        sort: 'ctime',
        select: ['product_name'],
      });
    }
    return products;
  }

  static async getAllDiscountCodesByShop({
    limit,
    page,
    shopId,
  }: {
    limit?: number;
    page?: number;
    shopId: string;
  }): Promise<any[]> {
    const discounts = await findAllDiscountCodesSelect({
      limit: Number(limit) || 50,
      page: Number(page) || 1,
      filter: {
        discount_shopId: convertToObjectIdMongodb(shopId),
        discount_is_active: true,
      },
      select: ['discount_code', 'discount_name'],
      model: discount,
    });
    return discounts;
  }

  static async getDiscountAmount({
    codeId,
    userId,
    shopId,
    products,
  }: GetDiscountAmountParams): Promise<{
    totalOrder: number;
    discount: number;
    totalPrice: number;
  }> {
    const foundDiscount = await checkDiscountExists({
      model: discount,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectIdMongodb(shopId),
      },
    });

    if (!foundDiscount) throw new NotFoundError("discount doesn't exist");

    const {
      discount_is_active,
      discount_max_uses,
      discount_min_order_value,
      discount_users_used,
      discount_start_date,
      discount_end_date,
      discount_max_uses_per_user,
      discount_type,
      discount_value,
    } = foundDiscount;

    if (!discount_is_active) throw new NotFoundError('discount expired!');
    if (!discount_max_uses) throw new NotFoundError('discount are out!');

    if (
      new Date() < new Date(discount_start_date) ||
      new Date() > new Date(discount_end_date)
    ) {
      throw new NotFoundError('discount code has expired!');
    }

    let totalOrder = 0;
    if (discount_min_order_value > 0) {
      totalOrder = products.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);

      if (totalOrder < discount_min_order_value) {
        throw new NotFoundError(
          `discount requires a minimum order value of ${discount_min_order_value}!`
        );
      }
    }

    if (discount_max_uses_per_user > 0) {
      const userUserDiscount = discount_users_used?.find(
        (user: any) => user.userId === userId
      );
      if (userUserDiscount) {
        //...
      }
    }

    const amount =
      discount_type === 'fixed_amount'
        ? discount_value
        : totalOrder * (discount_value / 100);

    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount,
    };
  }

  static async cancelDiscountCode({
    codeId,
    shopId,
    userId,
  }: {
    codeId: string;
    shopId: string;
    userId: string;
  }): Promise<any> {
    const foundDiscount = await checkDiscountExists({
      model: discount,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectIdMongodb(shopId),
      },
    });

    if (!foundDiscount) throw new NotFoundError("discount doesn't exitst");

    const result = await discount.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: userId,
      },
      $inc: {
        discount_max_uses: 1,
        discount_uses_count: -1,
      },
    });

    return result;
  }
}

export default DiscountService;

