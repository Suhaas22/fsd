import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';

// Where to store uploaded files
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Create the folder if it doesn't exist yet
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ------------------------------------------------------------------
// Storage: save files to disk with the original extension preserved
// ------------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext       = path.extname(file.originalname);        // ".png"
    const baseName  = path.basename(file.originalname, ext);   // "avatar"
    const unique    = Date.now();                               // 1725276000000
    cb(null, `${baseName}-${unique}${ext}`);                   // "avatar-1725276000000.png"
  },
});

// ------------------------------------------------------------------
// File type filter: only allow images and PDFs
// ------------------------------------------------------------------
function fileFilter(_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];
  const ext     = path.extname(file.originalname).toLowerCase();

  if (allowed.includes(ext)) {
    cb(null, true);   // accept
  } else {
    cb(new Error(`File type "${ext}" is not allowed. Accepted: ${allowed.join(', ')}`));
  }
}

// ------------------------------------------------------------------
// Export a ready-to-use multer instance
//   single('file')   → upload ONE file with field name "file"
//   array('files', 5)→ up to 5 files with field name "files"
// ------------------------------------------------------------------
export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
});
