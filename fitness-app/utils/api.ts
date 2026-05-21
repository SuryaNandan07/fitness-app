const BASE_URL = "http://192.168.29.101:5000/api";

export async function apiRequest(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: any,
  token?: string | null,
) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}
