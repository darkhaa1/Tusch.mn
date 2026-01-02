import { join } from 'path';

export const AVATAR_UPLOAD_DIR = join(process.cwd(), 'uploads', 'avatars');
export const LISTING_UPLOAD_DIR = join(process.cwd(), 'uploads', 'listings');
export const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
export const MAX_LISTING_FILES = 3;
export const MAX_LISTING_FILE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);
