import { Types } from 'mongoose';
import keytokenModel, { IKeyToken } from '../models/keytoken.model';

class KeyTokenService {
  static createKeyToken = async (
    userId: string,
    publicKey: string,
    privateKey: string,
    refreshToken: string
  ): Promise<string | null> => {
    try {
      const filter = { user: new Types.ObjectId(userId) };
      const update = {
        publicKey,
        privateKey,
        refreshTokensUsed: [],
        refreshToken,
      };
      const options = { upsert: true, new: true };

      const tokens = await keytokenModel.findOneAndUpdate(
        filter,
        update,
        options
      );

      return tokens ? tokens.publicKey : null;
    } catch (error) {
      console.error('Error creating key token:', error);
      throw error;
    }
  };

  static findByUserId = async (userId: string): Promise<IKeyToken | null> => {
    return await keytokenModel.findOne({ user: new Types.ObjectId(userId) });
  };

  static removeKeyById = async (id: string | Types.ObjectId): Promise<any> => {
    return await keytokenModel.findByIdAndDelete(new Types.ObjectId(id));
  };

  static findByRefreshTokenUsed = async (
    refreshToken: string
  ): Promise<IKeyToken | null> => {
    return await keytokenModel
      .findOne({ refreshTokensUsed: refreshToken })
      .lean();
  };

  static findByRefreshToken = async (
    refreshToken: string
  ): Promise<IKeyToken | null> => {
    return await keytokenModel.findOne({ refreshToken });
  };

  static deleteKeyById = async (userId: string): Promise<any> => {
    return await keytokenModel.deleteOne({ user: new Types.ObjectId(userId) });
  };
}

export default KeyTokenService;

