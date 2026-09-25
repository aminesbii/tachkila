import type { PublicRoom } from "@/lib/types";

export const TOKEN_STORAGE_KEY = (code: string) => `tachkila:token:${code}`;

export function getToken(code: string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY(code));
}

export function setToken(code: string, token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_STORAGE_KEY(code), token);
}

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data?.error ?? "error", data?.message ?? "Something went wrong.");
  }
  return data as T;
}

export function fetchRoom(code: string, token: string | null): Promise<PublicRoom> {
  return request<PublicRoom>(`/api/rooms/${encodeURIComponent(code)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export function createRoom(input: {
  name: string;
  formationKey: string;
  blindMode: boolean;
}): Promise<{ code: string; token: string }> {
  return request("/api/rooms", { method: "POST", body: JSON.stringify(input) });
}

export function joinRoom(input: {
  code: string;
  name: string;
}): Promise<{ code: string; token: string }> {
  return request("/api/rooms/join", { method: "POST", body: JSON.stringify(input) });
}

export function startAuction(code: string, token: string): Promise<{ ok: true }> {
  return request(`/api/rooms/${encodeURIComponent(code)}/start`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function assignPlayer(
  code: string,
  token: string,
  input: { entryId: string; seat: number; bid: number }
): Promise<{ ok: true }> {
  return request(`/api/rooms/${encodeURIComponent(code)}/assign`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
}

export function markUnsold(code: string, token: string): Promise<{ ok: true }> {
  return request(`/api/rooms/${encodeURIComponent(code)}/unsold`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function resetRoom(code: string, token: string): Promise<{ ok: true }> {
  return request(`/api/rooms/${encodeURIComponent(code)}/reset`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}