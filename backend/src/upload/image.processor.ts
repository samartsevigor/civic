import { BadRequestException } from '@nestjs/common';
import { existsSync } from 'fs';
import { rename, unlink, writeFile } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

export function imageFileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, accept: boolean) => void,
): void {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    callback(new BadRequestException('Only image uploads are allowed'), false);
    return;
  }
  callback(null, true);
}

export async function optimizeUploadedImage(
  uploadDir: string,
  filename: string,
): Promise<string> {
  const absolutePath = join(uploadDir, filename);
  if (!existsSync(absolutePath)) return filename;

  const buffer = await sharp(absolutePath)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toBuffer();

  const jpegName = `${filename.replace(/\.[^.]+$/, '')}.jpg`;
  const jpegPath = join(uploadDir, jpegName);
  const tempPath = `${jpegPath}.tmp`;
  await writeFile(tempPath, buffer);
  if (existsSync(absolutePath)) await unlink(absolutePath);
  if (jpegPath !== absolutePath && existsSync(jpegPath)) await unlink(jpegPath);
  await rename(tempPath, jpegPath);
  return jpegName;
}
