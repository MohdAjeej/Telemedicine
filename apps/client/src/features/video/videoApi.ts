import { baseApi } from '../../store/api/baseApi';

export interface VideoRoom {
  roomId: string;
  appointmentId: string;
  participants: string[];
}

export const videoApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVideoRoom: builder.query<VideoRoom, string>({
      query: (appointmentId) => `/video/${appointmentId}/room`,
      transformResponse: (response: { data: VideoRoom }) => response.data,
    }),
  }),
});

export const { useGetVideoRoomQuery } = videoApi;
