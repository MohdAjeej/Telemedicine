import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

/**
 * Reserved for requests RTK Query isn't a good fit for (e.g. multipart file
 * uploads that need progress events). Everyday data fetching goes through
 * store/api/baseApi.ts instead.
 */
export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});
