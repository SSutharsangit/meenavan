import { API_BASE_URL } from "@/lib/admin-config";

const normalizePath = (path: string) => path.replace(/^\/+/, "");

export const apiUrl = (path: string) => `${API_BASE_URL}/${normalizePath(path)}`;

export const adminApiUrl = (path: string) =>
  apiUrl(`admin/${normalizePath(path)}`);

export const defaultHeaders = {
  Accept: "application/json",
};

export const jsonHeaders = {
  ...defaultHeaders,
  "Content-Type": "application/json",
};
