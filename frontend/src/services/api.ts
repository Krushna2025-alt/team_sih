import axios, { AxiosError } from 'axios';
import { supabase } from './supabaseClient';
export type ErrorCode =
| 'badRequest' | 'unauthorized' | 'forbidden' | 'notFound'
| 'server' | 'network' | 'timeout' | 'generic';
export class ApiError extends Error {
constructor(message: string, public status?: number, public code: ErrorCode = 'generic') {
super(message);
this.name = 'ApiError';
}
}
export const errorCode = (e: unknown): ErrorCode => (e instanceof ApiError ? e.code : 'generic');
export const errorMessage = (e: unknown): string => (e instanceof Error ? e.message : 
'Something went wrong');
const DEFAULTS: Record<ErrorCode, string> = {
badRequest: 'Invalid request.',
unauthorized: 'Please log in again.',
forbidden: 'You do not have access.',
notFound: 'Not found.',
server: 'Server error. Try again later.',
network: 'No internet connection.',
timeout: 'Request timed out.',
generic: 'Something went wrong.',
};
// One central Axios instance — all backend requests go through /api/v1
const api = axios.create({
baseURL: (import.meta.env.VITE_API_BASE_URL || '') + '/api/v1',
timeout: 60000,
});
api.interceptors.request.use(async (config) => {
if (supabase) {
const { data } = await supabase.auth.getSession();
const token = data.session?.access_token;
if (token) config.headers.Authorization = `Bearer ${token}`;
}
return config;
});
api.interceptors.response.use(
(res) => res,
(error: AxiosError<any>) => {
const status = error.response?.status;
const code: ErrorCode =
error.code === 'ECONNABORTED' ? 'timeout'
: !error.response ? 'network'
: status === 400 ? 'badRequest'
: status === 401 ? 'unauthorized'
: status === 403 ? 'forbidden'
: status === 404 ? 'notFound'
: 'server';
const message = error.response?.data?.message || DEFAULTS[code];
return Promise.reject(new ApiError(message, status, code));
}
);
// Backend contract: { "success": true, "data": ... } — services unwrap "data"
export async function getData<T>(url: string, params?: unknown): Promise<T> {
const res = await api.get(url, { params });
return res.data?.data as T;
}
export async function postData<T>(url: string, body?: unknown): Promise<T> {
const res = await api.post(url, body);
return res.data?.data as T;
}
export async function patchData<T>(url: string, body?: unknown): Promise<T> {
const res = await api.patch(url, body);
return res.data?.data as T;
}
export async function deleteData<T>(url: string): Promise<T> {
const res = await api.delete(url);
return res.data?.data as T;
}
export default api;
