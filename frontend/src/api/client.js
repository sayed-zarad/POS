const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function apiRequest(path, options = {}) {
  const accessToken = localStorage.getItem("accessToken");
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || "Request failed");
  }

  return result;
}
