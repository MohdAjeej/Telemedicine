import type { Conversation, Message } from '@telemedicine/types';
import { baseApi } from '../../store/api/baseApi';

export const messageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    startConversation: builder.mutation<Conversation, { otherUserId: string }>({
      query: (body) => ({ url: '/messages/conversations', method: 'POST', body }),
      invalidatesTags: [{ type: 'Conversation', id: 'LIST' }],
    }),
    listMessages: builder.query<Message[], string>({
      query: (conversationId) => `/messages/conversations/${conversationId}/messages`,
      transformResponse: (response: { data: Message[] }) => response.data,
      providesTags: (_result, _error, conversationId) => [{ type: 'Message', id: conversationId }],
    }),
    sendMessage: builder.mutation<Message, { conversationId: string; content: string }>({
      query: ({ conversationId, content }) => ({
        url: `/messages/conversations/${conversationId}/messages`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (_result, _error, { conversationId }) => [{ type: 'Message', id: conversationId }],
    }),
  }),
});

export const { useStartConversationMutation, useListMessagesQuery, useSendMessageMutation } = messageApi;
