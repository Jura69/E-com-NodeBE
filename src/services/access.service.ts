import shopModel, { IShop } from '../models/shop.model';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import KeyTokenService from './keyToken.service';
import { createTokenPair } from '../auth/authUtils';
import { getIntoData } from '../utils';
import {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} from '../core/error.response';
import { findByEmail } from './shop.service';
import { IKeyToken } from '../models/keytoken.model';

const RoleShop = {
  SHOP: 'SHOP',
  WRITTER: 'WRITTER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN',
} as const;

interface RefreshTokenParams {
  keyStore: IKeyToken;
  user: { userId: string; email: string };
  refreshToken: string;
}

interface LoginParams {
  email: string;
  password: string;
}

interface SignUpParams {
  name: string;
  email: string;
  password: string;
}

class AccessService {
  static handlerRefreshTokenV2 = async ({
    keyStore,
    user,
    refreshToken,
  }: RefreshTokenParams): Promise<{
    user: { userId: string; email: string };
    tokens: { accessToken: string; refreshToken: string };
  }> => {
    const { userId, email } = user;

    if (keyStore.refreshTokensUsed?.includes(refreshToken)) {
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenError('Something wrong happened !! Pls relogin');
    }

    if (keyStore.refreshToken !== refreshToken) {
      throw new AuthFailureError('Shop not registered');
    }

    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new AuthFailureError('Shop not registered 2');
    }

    const tokens = await createTokenPair(
      { userId, email },
      keyStore.publicKey,
      keyStore.privateKey
    );

    await keyStore.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken,
      },
    });

    return {
      user,
      tokens,
    };
  };

  static logOut = async (keyStore: IKeyToken): Promise<any> => {
    const id = String((keyStore as any)._id || '');
    const delKey = await KeyTokenService.removeKeyById(id);
    return delKey;
  };

  static logIn = async ({ email, password }: LoginParams): Promise<{
    shop: Partial<IShop>;
    tokens: { accessToken: string; refreshToken: string };
  }> => {
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new BadRequestError('Shop not registered');

    const match = await bcrypt.compare(password, foundShop.password as string);
    if (!match) throw new AuthFailureError('Authentication error');

    const privateKey = crypto.randomBytes(64).toString('hex');
    const publicKey = crypto.randomBytes(64).toString('hex');

    const userId = String((foundShop as any)._id || '');
    const tokens = await createTokenPair(
      { userId, email },
      publicKey,
      privateKey
    );

    await KeyTokenService.createKeyToken(
      userId,
      publicKey,
      privateKey,
      tokens.refreshToken
    );

    return {
      shop: getIntoData({
        fields: ['_id', 'name', 'email'],
        object: foundShop,
      }),
      tokens,
    };
  };

  static signUp = async ({
    name,
    email,
    password,
  }: SignUpParams): Promise<{
    code: number;
    metadata: {
      shop: Partial<IShop>;
      tokens: { accessToken: string; refreshToken: string };
    };
  }> => {
    const holderShop = await shopModel.findOne({ email }).lean();
    if (holderShop) {
      throw new BadRequestError('Error: Shop already registered!');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [RoleShop.SHOP],
    });

    if (newShop) {
      const privateKey = crypto.randomBytes(64).toString('hex');
      const publicKey = crypto.randomBytes(64).toString('hex');

      const userId = (newShop._id as any)?.toString() || '';
      const tokens = await createTokenPair(
        { userId, email },
        publicKey,
        privateKey
      );

      const keyStore = await KeyTokenService.createKeyToken(
        userId,
        publicKey,
        privateKey,
        tokens.refreshToken
      );

      if (!keyStore) {
        throw new BadRequestError('Error: keyStore error!');
      }

      return {
        code: 201,
        metadata: {
          shop: getIntoData({
            fields: ['_id', 'name', 'email'],
            object: newShop,
          }),
          tokens,
        },
      };
    }

    throw new BadRequestError('Error: Shop creation failed!');
  };
}

export default AccessService;

