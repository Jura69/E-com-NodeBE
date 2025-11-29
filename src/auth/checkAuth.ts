import { Request, Response, NextFunction } from 'express';
import { findById } from '../services/apikey.service';

const HEADER = {
  API_KEY: 'x-api-key',
  AUTHORIZATION: 'authorization',
} as const;

interface ApiKeyRequest extends Request {
  objKey?: any;
}

export const apiKey = async (
  req: ApiKeyRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const key = req.headers[HEADER.API_KEY]?.toString();
    if (!key) {
      return res.status(403).json({
        message: 'Forbidden Error',
      });
    }
    const objKey = await findById(key);
    if (!objKey) {
      return res.status(403).json({
        message: 'Forbidden Error',
      });
    }

    req.objKey = objKey;
    return next();
  } catch (error) {
    return res.status(403).json({
      message: 'Forbidden Error',
    });
  }
};

export const permission = (permission: string) => {
  return (req: ApiKeyRequest, res: Response, next: NextFunction): Response | void => {
    if (!req.objKey?.permissions) {
      return res.status(403).json({ message: 'permissions denided' });
    }
    const validPermission = req.objKey.permissions.includes(permission);
    if (!validPermission) {
      return res.status(403).json({ message: 'permissions denided' });
    }

    return next();
  };
};

