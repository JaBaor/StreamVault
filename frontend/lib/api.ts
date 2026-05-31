export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "/api/v1";

const TOKEN_KEY = "streamvault:access-token";

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

async function refreshAccessToken() {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) return null;
  const data = await response.json();
  if (data.accessToken) setAccessToken(data.accessToken);
  return data.accessToken as string | null;
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit & { _retried?: boolean; _silent?: boolean } = {}
) {
  const token = getAccessToken();
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      credentials: "include",
      headers,
      ...options,
    }
  );

  if (response.status === 401 && !options._retried) {
    if (token) {
      const nextToken = await refreshAccessToken();
      if (nextToken) {
        headers.set("Authorization", `Bearer ${nextToken}`);
        return apiFetch(endpoint, { ...options, headers, _retried: true });
      }
      clearAccessToken();
      if (typeof window !== "undefined" && !options._silent) {
        window.dispatchEvent(new CustomEvent("streamvault:session-expired"));
      }
      throw new Error("Session expired. Please log in again.");
    }
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}
