import type { Recording } from '@telemedicine/types';
import { baseApi } from '../../store/api/baseApi';

export interface UploadRecordingBody {
  appointmentId: string;
  file: Blob;
}

export const recordingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listRecordings: builder.query<Recording[], string>({
      query: (appointmentId) => `/recordings/${appointmentId}`,
      transformResponse: (response: { data: Recording[] }) => response.data,
      providesTags: (result) =>
        result
          ? [...result.map((recording) => ({ type: 'Recording' as const, id: recording._id })), 'Recording']
          : ['Recording'],
    }),
    uploadRecording: builder.mutation<Recording, UploadRecordingBody>({
      query: ({ appointmentId, file }) => {
        const formData = new FormData();
        // Ensure the blob has the correct MIME type for video
        // The MediaRecorder produces blobs with type like "video/webm;codecs=vp9,opus"
        // We need to preserve or set a valid video MIME type
        const videoBlob = file.type.startsWith('video/') 
          ? file 
          : new Blob([file], { type: 'video/webm' });
        formData.append('video', videoBlob, 'recording.webm');
        return { url: `/recordings/${appointmentId}`, method: 'POST', body: formData };
      },
      transformResponse: (response: { data: Recording }) => response.data,
      invalidatesTags: ['Recording'],
    }),
  }),
});

export const { useListRecordingsQuery, useUploadRecordingMutation } = recordingApi;
