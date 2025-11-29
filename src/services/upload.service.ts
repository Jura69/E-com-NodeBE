import cloudinary from '../configs/cloudinary.config';
import { BadRequestError } from '../core/error.response';

export const uploadImageFromUrl = async (): Promise<void> => {
  try {
    const urlImage =
      'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lvb7sq2fnerx53';
    const folderName = 'product/1111';

    const result = await cloudinary.uploader.upload(urlImage, {
      folder: folderName,
    });
    console.log(result);
  } catch (error: any) {
    console.log(error);
  }
};

export const uploadImageFromLocal = async (
  path: string | { path?: string; filePath?: string },
  folderName: string = 'product/1111'
): Promise<{
  image_url: string;
  shopId: number;
  thumb_url: string;
}> => {
  try {
    if (!path) {
      throw new BadRequestError('File path is required');
    }

    const filePath =
      typeof path === 'string' ? path : path.path || path.filePath || null;

    if (!filePath || typeof filePath !== 'string') {
      throw new BadRequestError('File path must be a valid string');
    }

    const result = await cloudinary.uploader.upload(filePath, {
      public_id: 'local',
      folder: folderName,
    });

    return {
      image_url: result.secure_url,
      shopId: 1111,
      thumb_url: cloudinary.url(result.public_id, {
        transformation: [
          {
            width: 100,
            height: 100,
            format: 'jpg',
          },
        ],
      }),
    };
  } catch (error: any) {
    if (error instanceof BadRequestError) {
      throw error;
    }
    throw new BadRequestError(`Upload failed: ${error.message}`);
  }
};

