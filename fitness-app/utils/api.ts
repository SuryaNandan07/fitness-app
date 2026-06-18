const BASE_URL = "http://192.168.0.118:5000/api";

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

  const text = await response.text();

  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}
