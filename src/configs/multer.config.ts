import multer from 'multer';
import { Request } from 'express';

const uploadMemory = multer({
  storage: multer.memoryStorage(),
});

const uploadDisk = multer({
  storage: multer.diskStorage({
    destination: function (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
      cb(null, './src/uploads');
    },
    filename: function (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
});

export { uploadDisk, uploadMemory };

