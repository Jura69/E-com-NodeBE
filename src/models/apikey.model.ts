import { model, Schema, Document, Model } from 'mongoose';

const DOCUMENT_NAME = 'Apikey';
const COLLECTION_NAME = 'Apikeys';

export interface IApiKey extends Document {
  key: string;
  status: boolean;
  permissions: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const apiKeySchema = new Schema<IApiKey>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    permissions: {
      type: [String],
      required: true,
      enum: ['0000', '1111', '2222'],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

const ApiKeyModel: Model<IApiKey> = model<IApiKey>(DOCUMENT_NAME, apiKeySchema);

export default ApiKeyModel;

