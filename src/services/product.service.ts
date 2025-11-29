import { product, clothing, electronic } from '../models/product.model';
import { BadRequestError } from '../core/error.response';
import {
  publishProductByShop,
  findAllPublishForShop,
  findAllDraftsForShop,
  unPublishProductByShop,
  searchProductByUser,
  findAllProducts,
  findProduct,
  updateProductById,
} from '../models/repositories/product.repo';
import {
  removeUndefinedObject,
  cleanAndFlattenObject,
} from '../utils';
import { insertInvetory } from '../models/repositories/inventory.repo';
import { pushNotiToSystem } from './notification.service';

interface ProductPayload {
  product_name: string;
  product_thumb: string;
  product_description?: string;
  product_price: number;
  product_type: string;
  product_shop: string;
  product_attributes: any;
  product_quantity: number;
}

class ProductFactory {
  static productRegistry: Record<string, any> = {};

  static registerProductType(type: string, classRef: any): void {
    ProductFactory.productRegistry[type] = classRef;
  }

  static async createProduct(type: string, payload: ProductPayload): Promise<any> {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass) {
      throw new BadRequestError(`Invalid Product Types ${type}`);
    }
    return new productClass(payload).createProduct();
  }

  static async updateProduct(
    type: string,
    productId: string,
    payload: ProductPayload
  ): Promise<any> {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass) {
      throw new BadRequestError(`Invalid Product Types ${type}`);
    }
    return new productClass(payload).updateProduct(productId);
  }

  static async publishProductByShop({
    product_shop,
    product_id,
  }: {
    product_shop: string;
    product_id: string;
  }): Promise<number | null> {
    return await publishProductByShop({ product_shop, product_id });
  }

  static async unPublishProductByShop({
    product_shop,
    product_id,
  }: {
    product_shop: string;
    product_id: string;
  }): Promise<number | null> {
    return await unPublishProductByShop({ product_shop, product_id });
  }

  static async findAllDraftsForShop({
    product_shop,
    limit = 50,
    skip = 0,
  }: {
    product_shop: string;
    limit?: number;
    skip?: number;
  }): Promise<any[]> {
    const query = { product_shop, isDraft: true };
    return await findAllDraftsForShop({ query, limit, skip });
  }

  static async findAllPublishForShop({
    product_shop,
    limit = 50,
    skip = 0,
  }: {
    product_shop: string;
    limit?: number;
    skip?: number;
  }): Promise<any[]> {
    const query = { product_shop, isPublished: true };
    return await findAllPublishForShop({ query, limit, skip });
  }

  static async searchProducts({ keySearch }: { keySearch: string }): Promise<any[]> {
    return await searchProductByUser({ keySearch });
  }

  static async findAllProducts({
    limit = 50,
    sort = 'ctime',
    page = 1,
    filter = { isPublished: true },
  }: {
    limit?: number;
    sort?: string;
    page?: number;
    filter?: any;
  }): Promise<any[]> {
    return await findAllProducts({
      limit,
      sort,
      page,
      filter,
      select: ['product_name', 'product_thumb', 'product_price', 'product_shop'],
    });
  }

  static async findProduct({ product_id }: { product_id: string }): Promise<any> {
    return await findProduct({ product_id, unSelect: ['__v'] });
  }
}

class Product {
  product_name: string;
  product_thumb: string;
  product_description?: string;
  product_price: number;
  product_type: string;
  product_shop: string;
  product_attributes: any;
  product_quantity: number;

  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_type,
    product_shop,
    product_attributes,
    product_quantity,
  }: ProductPayload) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
    this.product_quantity = product_quantity;
  }

  async createProduct(product_id?: string): Promise<any> {
    const newProduct = await product.create({ ...this, _id: product_id });

    if (newProduct) {
      await insertInvetory({
        productId: newProduct._id,
        shopId: this.product_shop,
        stock: this.product_quantity,
      });
      pushNotiToSystem({
        type: 'SHOP-001',
        receivedId: 1,
        senderId: this.product_shop,
        options: {
          product_name: this.product_name,
          shope_name: this.product_shop,
        },
      })
        .then((rs: any) => console.log(rs))
        .catch(console.error);
    }

    return newProduct;
  }

  async updateProduct(product_id: string, bodyUpdate?: any): Promise<any> {
    return await updateProductById({
      product_id,
      bodyUpdate: bodyUpdate || this,
      model: product,
    });
  }
}

class Clothing extends Product {
  async createProduct(): Promise<any> {
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newClothing) throw new BadRequestError('create new Clothing error');

    const newProduct = await super.createProduct((newClothing as any)._id);
    if (!newProduct) throw new BadRequestError('create new Product error');

    return newProduct;
  }

  async updateProduct(productId: string): Promise<any> {
    const objectParams = removeUndefinedObject(this);
    if (objectParams.product_attributes) {
      await updateProductById({
        product_id: productId,
        bodyUpdate: cleanAndFlattenObject(objectParams.product_attributes),
        model: clothing,
      });
    }
    const updateProduct = await super.updateProduct(
      productId,
      cleanAndFlattenObject(objectParams)
    );
    return updateProduct;
  }
}

class Electronics extends Product {
  async createProduct(): Promise<any> {
    const newElectronic = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newElectronic) throw new BadRequestError('create new Electronics error');

    const newProduct = await super.createProduct((newElectronic as any)._id);
    if (!newProduct) throw new BadRequestError('create new Product error');

    return newProduct;
  }

  async updateProduct(productId: string): Promise<any> {
    const objectParams = cleanAndFlattenObject(this);

    if (objectParams.product_attributes) {
      await updateProductById({
        product_id: productId,
        bodyUpdate: cleanAndFlattenObject(objectParams.product_attributes),
        model: electronic,
      });
    }
    const updateProduct = await super.updateProduct(
      productId,
      cleanAndFlattenObject(objectParams)
    );
    return updateProduct;
  }
}

ProductFactory.registerProductType('Clothing', Clothing);
ProductFactory.registerProductType('Electronics', Electronics);

export default ProductFactory;

