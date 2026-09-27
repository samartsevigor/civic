import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export function ensureUploadDir(uploadDir: string): void {
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }
}

export function createIssuePhotoStorage(uploadDir: string) {
  ensureUploadDir(uploadDir);

  return diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const ext = extname(file.originalname) || '.jpg';
      cb(null, `${uuidv4()}${ext}`);
    },
  });
}

export function resolveUploadRoot(): string {
  const dir = process.env.UPLOAD_DIR ?? './uploads/issue-photos';
  return join(process.cwd(), dir);
}
