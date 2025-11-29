import JWT from 'jsonwebtoken';
import { asyncHandler } from '../helpers/asyncHandler';
import { AuthFailureError, NotFoundError } from '../core/error.response';
import KeyTokenService from '../services/keyToken.service';
import { Request, Response, NextFunction } from 'express';

const HEADER = {
  API_KEY: 'x-api-key',
  CLIENT_ID: 'x-client-id',
  AUTHORIZATION: 'authorization',
  REFRESHTOKEN: 'x-refreshtoken-id',
} as const;

export interface JwtPayload {
  userId: string;
  email?: string;
  [key: string]: any;
}

export interface AuthRequest extends Request {
  keyStore?: any;
  user?: JwtPayload;
  refreshToken?: string;
}

export const createTokenPair = async (
  payload: JwtPayload,
  publicKey: string,
  privateKey: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: '2 days',
    });

    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: '7 days',
    });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Error creating token pair:', error);
    throw new Error('Token creation failed');
  }
};

export const authenticationV2 = asyncHandler(
  async (req: AuthRequest, _res: Response, next: NextFunction) => {
    const userId = req.headers[HEADER.CLIENT_ID] as string;
    if (!userId) throw new AuthFailureError('Invalid Request');

    const keyStore = await KeyTokenService.findByUserId(userId);
    if (!keyStore) throw new NotFoundError('Not Found Keystore');

    if (req.headers[HEADER.REFRESHTOKEN]) {
      try {
        const refreshToken = req.headers[HEADER.REFRESHTOKEN] as string;
        const decodeUser = JWT.verify(refreshToken, keyStore.privateKey) as JwtPayload;
        if (userId !== decodeUser.userId)
          throw new AuthFailureError('Invalid Userid');
        req.keyStore = keyStore;
        req.user = decodeUser;
        req.refreshToken = refreshToken;
        return next();
      } catch (error) {
        throw error;
      }
    }

    const accessToken = req.headers[HEADER.AUTHORIZATION] as string;
    if (!accessToken) throw new AuthFailureError('Invalid Request');

    try {
      const decodeUser = JWT.verify(accessToken, keyStore.publicKey) as JwtPayload;
      if (userId !== decodeUser.userId)
        throw new AuthFailureError('Invalid Userid');
      req.keyStore = keyStore;
      req.user = decodeUser;
      return next();
    } catch (error) {
      throw error;
    }
  }
);

export const verifyJWT = async (
  token: string,
  keySecret: string
): Promise<any> => {
  return await JWT.verify(token, keySecret);
};

