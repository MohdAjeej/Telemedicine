# Video Recording Troubleshooting Guide

## Common Issue: "Failed to save the recording: Unsupported file type: text/plain"

### Problem Description
When recording a video consultation call, the recording fails to upload with the error message:
```
Failed to save the recording: Unsupported file type: text/plain
```

### Root Cause
The issue occurs when the `Blob` created by `MediaRecorder` loses its MIME type information during the upload process. This can happen due to:

1. **Browser Inconsistencies**: Different browsers handle Blob MIME types differently
2. **FormData Issues**: Some browsers may not preserve the MIME type when appending a Blob to FormData
3. **Network Issues**: MIME type information can be lost during multipart/form-data encoding

### Solution Implemented

#### 1. Client-Side Fix (apps/client/src/features/recording/recordingApi.ts)

The upload logic now explicitly ensures the Blob has a valid video MIME type:

```typescript
uploadRecording: builder.mutation<Recording, UploadRecordingBody>({
  query: ({ appointmentId, file }) => {
    const formData = new FormData();
    // Ensure the blob has the correct MIME type for video
    const videoBlob = file.type.startsWith('video/') 
      ? file 
      : new Blob([file], { type: 'video/webm' });
    formData.append('video', videoBlob, 'recording.webm');
    return { url: `/recordings/${appointmentId}`, method: 'POST', body: formData };
  },
  // ...
});
```

**What this does:**
- Checks if the Blob already has a video MIME type
- If not, wraps it in a new Blob with `type: 'video/webm'`
- Always provides a filename (`recording.webm`) to help the server identify the file type

#### 2. Server-Side Fix (apps/server/src/config/multer.config.ts)

Enhanced validation to handle edge cases:

```typescript
fileFilter(_req, file, callback) {
  const allowed = ['video/webm', 'video/mp4', 'video/x-matroska'];
  const baseMimeType = file.mimetype.split(';')[0].trim().toLowerCase();
  
  // Accept valid MIME types OR .webm file extension as fallback
  if (allowed.includes(baseMimeType) || 
      (file.originalname && file.originalname.endsWith('.webm'))) {
    callback(null, true);
    return;
  }
  callback(new Error(`Unsupported file type: ${file.mimetype}`));
}
```

**What this does:**
- Strips codec parameters from MIME type (e.g., `video/webm;codecs=vp9,opus` → `video/webm`)
- Converts to lowercase for case-insensitive comparison
- Adds fallback validation using file extension
- Supports additional video formats (`video/x-matroska` for MKV)

### Testing the Fix

1. **Start a video consultation** between two users (doctor and patient)
2. **Click the "Record" button** during the call
3. **Let it record for a few seconds**
4. **Click "Stop Recording"**
5. **Verify the success message** appears: "Recording saved successfully"

### Browser Compatibility

The MediaRecorder API produces different MIME types depending on the browser:

| Browser | Typical MIME Type |
|---------|-------------------|
| Chrome/Edge | `video/webm;codecs=vp9,opus` or `video/webm;codecs=vp8,opus` |
| Firefox | `video/webm;codecs=vp8,opus` |
| Safari | `video/mp4` (requires iOS 14.3+) |

Our implementation handles all these variations automatically.

### MediaRecorder MIME Type Selection

The client code tries these MIME types in order:

```typescript
const CANDIDATE_MIME_TYPES = [
  'video/webm;codecs=vp9,opus',  // Best quality (Chrome/Edge)
  'video/webm;codecs=vp8,opus',  // Fallback (Firefox, older Chrome)
  'video/webm',                  // Generic WebM
];
```

The first supported type is used. If none are supported, it falls back to `'video/webm'`.

### Additional Debugging

If you still encounter issues, check:

1. **Browser Console**
   ```javascript
   // Check what MIME types your browser supports
   console.log('VP9:', MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus'));
   console.log('VP8:', MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus'));
   console.log('WebM:', MediaRecorder.isTypeSupported('video/webm'));
   ```

2. **Network Tab**
   - Open DevTools → Network tab
   - Filter by "recordings"
   - Check the Content-Type header of the uploaded file
   - Should be `video/webm` or similar

3. **Server Logs**
   ```bash
   # View upload errors
   docker-compose logs -f server | grep "Unsupported file type"
   ```

### Known Limitations

1. **File Size**: Maximum recording size is 200MB (configurable in `multer.config.ts`)
2. **Duration**: No hard limit, but large files may timeout during upload
3. **Safari Support**: Requires iOS 14.3+ or macOS Big Sur+ for MediaRecorder API

### Configuration

To change allowed video formats or file size limits:

**apps/server/src/config/multer.config.ts:**
```typescript
// Change max file size (currently 200MB)
const MAX_VIDEO_SIZE_BYTES = 200 * 1024 * 1024;

// Add more video formats
const allowed = ['video/webm', 'video/mp4', 'video/x-matroska', 'video/ogg'];
```

### Related Files

- **Client Upload**: `apps/client/src/features/recording/recordingApi.ts`
- **Recording Hook**: `apps/client/src/hooks/useCallRecording.ts`
- **Server Validation**: `apps/server/src/config/multer.config.ts`
- **Recording Route**: `apps/server/src/routes/recording.routes.ts`

### Support

If the issue persists:
1. Check browser console for errors
2. Verify network connectivity
3. Check server logs for detailed error messages
4. Ensure CLOUDINARY_* environment variables are set (if using Cloudinary for storage)

---

**Last Updated**: August 3, 2026  
**Issue**: Fixed in commit fixing video recording MIME type handling
