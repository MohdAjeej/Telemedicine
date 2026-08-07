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

// Call recordings are short WebM clips produced client-side by MediaRecorder,
// but still far larger than the images/PDFs the config above is tuned for.
const MAX_VIDEO_SIZE_BYTES = 200 * 1024 * 1024; // 200MB

export const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_VIDEO_SIZE_BYTES },
  fileFilter(_req, file, callback) {
    // MediaRecorder's blob.type (and therefore this multipart part's Content-Type)
    // is a full type string like "video/webm;codecs=vp9,opus" — strip the codec
    // parameter before comparing, or every browser-recorded upload gets rejected.
    const allowed = ['video/webm', 'video/mp4', 'video/x-matroska'];
    const baseMimeType = file.mimetype.split(';')[0].trim().toLowerCase();
    
    // Also accept if somehow the client sends without proper MIME type but with .webm extension
    if (allowed.includes(baseMimeType) || (file.originalname && file.originalname.endsWith('.webm'))) {
      callback(null, true);
      return;
    }
    callback(new Error(`Unsupported file type: ${file.mimetype}`));
  },
});
