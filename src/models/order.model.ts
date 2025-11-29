import { model, Schema, Document } from 'mongoose';

const DOCUMENT_NAME = 'Order';
const COLLECTION_NAME = 'Orders';

export interface IOrderCheckout {
  totalPrice: number;
  totalApllyDiscount?: number;
  feeShip?: number;
}

export interface IOrderShipping {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface IOrderPayment {
  [key: string]: any;
}

export interface IOrder extends Document {
  order_userId: number;
  order_checkout: IOrderCheckout;
  order_shipping: IOrderShipping;
  order_payment: IOrderPayment;
  order_products: any[];
  order_trackingNumber?: string;
  order_status?: 'pending' | 'confirmed' | 'shipped' | 'cancelled' | 'delivered';
  createdOn?: Date;
  modifiedOn?: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    order_userId: { type: Number, required: true },
    order_checkout: { type: Object, default: {} },
    order_shipping: { type: Object, default: {} },
    order_payment: { type: Object, default: {} },
    order_products: { type: Array, required: true } as any,
    order_trackingNumber: { type: String, default: '#0000118052022' },
    order_status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'cancelled', 'delivered'],
      default: 'pending',
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: {
      createdAt: 'createdOn',
      updatedAt: 'modifiedOn',
    },
  }
);

export const order = model<IOrder>(DOCUMENT_NAME, orderSchema);

