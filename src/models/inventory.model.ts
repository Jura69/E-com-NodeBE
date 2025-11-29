import { model, Schema, Document, Types } from 'mongoose';

const DOCUMENT_NAME = 'Inventory';
const COLLECTION_NAME = 'Inventories';

export interface IInventoryReservation {
  quantity: number;
  cartId: string;
  createOn: Date;
}

export interface IInventory extends Document {
  inven_productId: Types.ObjectId;
  inven_location?: string;
  inven_stock: number;
  inven_shopId: Types.ObjectId;
  inven_reservations?: IInventoryReservation[];
  createdAt?: Date;
  updatedAt?: Date;
}

const inventorySchema = new Schema<IInventory>(
  {
    inven_productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    inven_location: { type: String, default: 'unKnow' },
    inven_stock: { type: Number, required: true },
    inven_shopId: { type: Schema.Types.ObjectId, ref: 'Shop' },
    inven_reservations: { type: Array, default: [] },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

export const inventory = model<IInventory>(DOCUMENT_NAME, inventorySchema);

