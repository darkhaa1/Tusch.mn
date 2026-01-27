import { BadRequestException } from '@nestjs/common';

/**
 * Validates file type by checking magic bytes (file signature)
 * This prevents MIME type spoofing attacks
 */
export async function validateImageMagicBytes(
  buffer: Buffer,
): Promise<'jpeg' | 'png' | 'webp'> {
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'png';
  }

  // WebP: RIFF....WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'webp';
  }

  throw new BadRequestException(
    'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
  );
}

/**
 * Validates filename to prevent path traversal attacks
 */
export function sanitizeFilename(filename: string): string {
  // Remove any directory separators and null bytes
  const cleaned = filename.replace(/[\/\\.\0]/g, '');

  // Ensure it's a valid UUID-like format (alphanumeric + hyphens only)
  if (!/^[a-f0-9-]+\.(jpg|jpeg|png|webp)$/i.test(cleaned)) {
    throw new BadRequestException('Invalid filename format');
  }

  return cleaned;
}
