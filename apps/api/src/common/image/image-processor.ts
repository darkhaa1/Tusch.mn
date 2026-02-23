import * as sharp from 'sharp';
import { readFile, writeFile } from 'fs/promises';

const MAIN_MAX_WIDTH = 1200;
const MAIN_JPEG_QUALITY = 80;
const THUMB_MAX_WIDTH = 400;
const THUMB_JPEG_QUALITY = 70;

/**
 * Resize to max 1200px wide (no upscale), convert to JPEG at 80% quality.
 */
export async function processImage(
  inputPath: string,
  outputPath: string,
): Promise<void> {
  const input = await readFile(inputPath);
  const buffer = await sharp(input)
    .resize({ width: MAIN_MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: MAIN_JPEG_QUALITY })
    .toBuffer();

  await writeFile(outputPath, buffer);
}

/**
 * Resize to 400px wide (no upscale), convert to JPEG at 70% quality.
 */
export async function generateThumbnail(
  inputPath: string,
  outputPath: string,
): Promise<void> {
  const buffer = await sharp(inputPath)
    .resize({ width: THUMB_MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: THUMB_JPEG_QUALITY })
    .toBuffer();

  await writeFile(outputPath, buffer);
}
