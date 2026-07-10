import axios from "axios";
import { getToken } from "@/lib/auth";

// Base URL per the design brief §1/§3 (NEXT_PUBLIC_API_BASE_URL), with a back-compat
// fallback and a local default. All routes live under /api.
const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000/api";

export const api = axios.create({ baseURL });

// Attach the JWT as a Bearer header on every request when present.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Success: unwrap the { statusCode, data, message, success } envelope → payload.
// Error: throw an Error carrying statusCode + message (message surfaces in a toast).
api.interceptors.response.use(
  (res) => {
    const body = res.data;
    if (body && typeof body === "object" && "success" in body && "data" in body) {
      res.data = body.data;
    }
    return res;
  },
  (err) => {
    const body = err?.response?.data;
    const message =
      (typeof body?.message === "string" && body.message) ||
      (Array.isArray(body?.errors) && body.errors[0]?.msg) ||
      err?.message ||
      "Something went wrong";
    const error = new Error(message) as Error & { statusCode?: number };
    error.statusCode = err?.response?.status ?? body?.statusCode;
    return Promise.reject(error);
  }
);

// Build a snake_case query string from a params object (the design brief §2: query
// strings must be snake_case; arrays repeat the key, e.g. amenities).
export function toQuery(params: Record<string, string | number | string[] | undefined | null>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v)) v.forEach((x) => qs.append(k, String(x)));
    else qs.set(k, String(v));
  }
  return qs.toString();
}
