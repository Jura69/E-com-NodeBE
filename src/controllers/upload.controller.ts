import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../core/error.response';
import { SuccessResponse } from '../core/success.response';
import { uploadImageFromUrl, uploadImageFromLocal } from '../services/upload.service';

class UploadController {
  uploadFileUrl = async (
    _req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    new SuccessResponse({
      message: 'Upload file success',
      metadata: await uploadImageFromUrl(),
    }).send(res);
  };

  uploadFileLocal = async (
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    const { file } = req;
    if (!file) {
      throw new BadRequestError('File missing');
    }

    new SuccessResponse({
      message: 'Upload file success',
      metadata: await uploadImageFromLocal(file.path),
    }).send(res);
  };
}

export default new UploadController();

