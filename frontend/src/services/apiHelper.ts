import { deleteData, getData, patchData } from './api';
export { deleteData, getData, patchData };
export async function putData<T>(url: string, body?: unknown): Promise<T> {
const { default: api } = await import('./api');
const res = await api.put(url, body);
return res.data?.data as T;
}
