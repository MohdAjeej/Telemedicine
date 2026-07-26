import multer from 'multer';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter(_req, file, callback) {
    const allowed = [
      'image/png',
      'image/jpeg',
      'image/webp',
      'application/pdf',
      'application/dicom',
    ];
    if (allowed.includes(file.mimetype)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Unsupported file type: ${file.mimetype}`));
  },
});
