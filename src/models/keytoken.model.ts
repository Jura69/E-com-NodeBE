import { Schema, model, Document, Types } from 'mongoose';

const DOCUMENT_NAME = 'Key';
const COLLECTION_NAME = 'Keys';

export interface IKeyToken extends Document {
  user: Types.ObjectId;
  privateKey: string;
  publicKey: string;
  refreshTokensUsed?: string[];
  refreshToken: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const keyTokenSchema = new Schema<IKeyToken>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Shop',
    },
    privateKey: {
      type: String,
      required: true,
    },
    publicKey: {
      type: String,
      required: true,
    },
    refreshTokensUsed: {
      type: Array,
      default: [],
    },
    refreshToken: {
      type: String,
      required: true,
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

export default model<IKeyToken>(DOCUMENT_NAME, keyTokenSchema);

