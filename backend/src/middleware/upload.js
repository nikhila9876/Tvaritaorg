import multer from 'multer';
import { AppError } from '../utils/helpers.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (!file.originalname.toLowerCase().endsWith('.csv') && file.mimetype !== 'text/csv') {
      return cb(new AppError('Only CSV files are allowed', 400));
    }
    cb(null, true);
  },
});

export const csvUpload = upload.single('file');
