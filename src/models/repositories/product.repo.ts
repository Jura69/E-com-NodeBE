import { Types } from 'mongoose';
import { product } from '../../models/product.model';
import {
  getSelectData,
  unGetSelectData,
  convertToObjectIdMongodb,
} from '../../utils';

export const publishProductByShop = async ({
  product_shop,
  product_id,
}: {
  product_shop: string;
  product_id: string;
}): Promise<number | null> => {
  const foundShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });
  if (!foundShop) return null;
  foundShop.isDraft = false;
  foundShop.isPublished = true;
  const { modifiedCount } = await foundShop.updateOne(foundShop);
  return modifiedCount;
};

export const unPublishProductByShop = async ({
  product_shop,
  product_id,
}: {
  product_shop: string;
  product_id: string;
}): Promise<number | null> => {
  const foundShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });
  if (!foundShop) return null;
  foundShop.isDraft = true;
  foundShop.isPublished = false;
  const { modifiedCount } = await foundShop.updateOne(foundShop);
  return modifiedCount;
};

const queryProduct = async ({
  query,
  limit,
  skip,
}: {
  query: any;
  limit: number;
  skip: number;
}): Promise<any[]> => {
  return await product
    .find(query)
    .populate('product_shop', 'name email -_id')
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

export const findAllDraftsForShop = async ({
  query,
  limit,
  skip,
}: {
  query: any;
  limit: number;
  skip: number;
}): Promise<any[]> => {
  return await queryProduct({ query, limit, skip });
};

export const findAllPublishForShop = async ({
  query,
  limit,
  skip,
}: {
  query: any;
  limit: number;
  skip: number;
}): Promise<any[]> => {
  return await queryProduct({ query, limit, skip });
};

export const searchProductByUser = async ({
  keySearch,
}: {
  keySearch: string;
}): Promise<any[]> => {
  const result = await product
    .find(
      {
        isPublished: true,
        $text: { $search: keySearch },
      },
      {
        score: { $meta: 'textScore' },
      }
    )
    .sort({ score: { $meta: 'textScore' } })
    .lean();

  return result;
};

export const findAllProducts = async ({
  limit,
  sort,
  page,
  filter,
  select,
}: {
  limit: number;
  sort: string;
  page: number;
  filter: any;
  select: string[];
}): Promise<any[]> => {
  const skip = (page - 1) * limit;
  const sortBy: any = sort === 'ctime' ? { _id: -1 } : { _id: 1 };
  const products = await product
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();

  return products;
};

export const findProduct = async ({
  product_id,
  unSelect,
}: {
  product_id: string;
  unSelect: string[];
}): Promise<any> => {
  return await product.findById(product_id).select(unGetSelectData(unSelect));
};

export const getProductById = async (productId: string): Promise<any> => {
  return await product
    .findOne({ _id: convertToObjectIdMongodb(productId) })
    .lean();
};

export const updateProductById = async ({
  product_id,
  bodyUpdate,
  model,
  isNew = true,
}: {
  product_id: string;
  bodyUpdate: any;
  model: any;
  isNew?: boolean;
}): Promise<any> => {
  return await model.findByIdAndUpdate(product_id, bodyUpdate, { new: isNew });
};

export const checkProductByServer = async (
  products: Array<{ productId: string; quantity: number }>
): Promise<Array<{ price: number; quantity: number; producId: string } | undefined>> => {
  return await Promise.all(
    products.map(async (product) => {
      const foundProduct = await getProductById(product.productId);
      if (foundProduct) {
        return {
          price: foundProduct.product_price,
          quantity: product.quantity,
          producId: product.productId,
        };
      }
      return undefined;
    })
  );
};

