import { model, Schema, Document, Types } from 'mongoose';
import slugify from 'slugify';

const DOCUMENT_NAME = 'Product';
const COLLECTION_NAME = 'Products';

export interface IProduct extends Document {
  product_name: string;
  product_thumb: string;
  product_description?: string;
  product_slug?: string;
  product_price: number;
  product_quantity: number;
  product_type: 'Electronics' | 'Clothing';
  product_shop: Types.ObjectId;
  product_attributes: Record<string, any>;
  product_ratingAvr?: number;
  product_variations?: any[];
  isDraft?: boolean;
  isPublished?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const productSchema = new Schema<IProduct>(
  {
    product_name: { type: String, required: true },
    product_thumb: { type: String, required: true },
    product_description: String,
    product_slug: String,
    product_price: { type: Number, required: true },
    product_quantity: { type: Number, required: true },
    product_type: {
      type: String,
      required: true,
      enum: ['Electronics', 'Clothing'],
    },
    product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
    product_attributes: { type: Schema.Types.Mixed, required: true },
    product_ratingAvr: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
      set: (v: number) => Math.round(v * 10) / 10,
    },
    product_variations: { type: Array, default: [] },
    isDraft: { type: Boolean, default: true, index: true, select: false },
    isPublished: { type: Boolean, default: false, index: true, select: false },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

productSchema.index({ product_name: 'text', product_description: 'text' });

productSchema.pre('save', function (next) {
  this.product_slug = slugify(this.product_name, { lower: true });
  next();
});

export interface IClothing {
  brand: string;
  size?: string;
  material?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const clothingSchema = new Schema<IClothing>(
  {
    brand: { type: String, required: true },
    size: String,
    material: String,
  },
  {
    collection: 'clothes',
    timestamps: true,
  }
);

export interface IElectronic {
  manufacturer: string;
  model?: string;
  color?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const electronicSchema = new Schema<IElectronic>(
  {
    manufacturer: { type: String, required: true },
    model: String,
    color: String,
  },
  {
    collection: 'electronics',
    timestamps: true,
  }
);

export const product = model<IProduct>(DOCUMENT_NAME, productSchema);
export const clothing = model('Clothing', clothingSchema);
export const electronic = model('Electronic', electronicSchema);

