import { model, Schema, Document, Model } from 'mongoose';

const DOCUMENT_NAME = 'Shop';
const COLLECTION_NAME = 'Shops';

export interface IShop extends Document {
  name: string;
  email: string;
  password: string;
  status?: 'active' | 'inactive';
  verify?: boolean;
  roles?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const shopSchema = new Schema<IShop>(
  {
    name: {
      type: String,
      trim: true,
      maxLength: 150,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'inactive',
    },
    verify: {
      type: Schema.Types.Boolean,
      default: false,
    },
    roles: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

const ShopModel: Model<IShop> = model<IShop>(DOCUMENT_NAME, shopSchema);

export default ShopModel;

