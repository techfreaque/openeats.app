import { env } from "../env";

// Example function to make authenticated API requests
export async function apiRequest(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: any,
) {
  try {
    const response = await fetch(`${env.EXPO_PUBLIC_BACKEND_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        // If using token-based auth in headers instead of cookies
        // 'Authorization': `Bearer ${await getToken()}`
      },
      // Include credentials to send cookies with requests
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "API request failed");
    }

    return await response.json();
  } catch (error) {
    console.error(`API ${method} ${endpoint} error:`, error);
    throw error;
  }
}
