import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import {
  ALLOWED_IMAGE_MIMES,
  AVATAR_UPLOAD_DIR,
  LISTING_UPLOAD_DIR,
  MAX_AVATAR_SIZE,
  MAX_LISTING_FILES,
  MAX_LISTING_FILE_SIZE,
} from './constants';
import { BadRequestException } from '@nestjs/common';

// Ensure upload dirs exist
fs.mkdirSync(AVATAR_UPLOAD_DIR, { recursive: true });
fs.mkdirSync(LISTING_UPLOAD_DIR, { recursive: true });

const baseStorage = (destination: string) =>
  diskStorage({
    destination,
    filename: (_req, file, cb) => {
      const ext = extname(file.originalname || '').toLowerCase() || '.jpg';
      cb(null, `${randomUUID()}${ext}`);
    },
  });

const fileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  if (!ALLOWED_IMAGE_MIMES.has(file.mimetype)) {
    return cb(new BadRequestException('Only image files are allowed'), false);
  }
  cb(null, true);
};

export const avatarMulterOptions = {
  storage: baseStorage(AVATAR_UPLOAD_DIR),
  fileFilter,
  limits: { fileSize: MAX_AVATAR_SIZE, files: 1 },
};

export const listingImagesMulterOptions = {
  storage: baseStorage(LISTING_UPLOAD_DIR),
  fileFilter,
  limits: { fileSize: MAX_LISTING_FILE_SIZE, files: MAX_LISTING_FILES },
};
