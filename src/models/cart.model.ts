import { model, Schema, Document, Types } from 'mongoose';

const DOCUMENT_NAME = 'Cart';
const COLLECTION_NAME = 'Carts';

export interface ICartProduct {
  productId: string;
  shopId?: string;
  quantity: number;
  name?: string;
  price?: number;
}

export interface ICart extends Document {
  cart_state: 'active' | 'completed' | 'failed' | 'pending';
  cart_products: ICartProduct[];
  cart_count_product?: number;
  cart_userId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const cartSchema = new Schema<ICart>(
  {
    cart_state: {
      type: String,
      required: true,
      enum: ['active', 'completed', 'failed', 'pending'],
      default: 'active',
    },
    cart_products: {
      type: Array,
      required: true,
      default: [],
    } as any,
    cart_count_product: {
      type: Number,
      default: 0,
    },
    cart_userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Shop',
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

export const cart = model<ICart>(DOCUMENT_NAME, cartSchema);

