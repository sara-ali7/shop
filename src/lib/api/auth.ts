import type { LoginRequest, LoginResponse, User } from "@/types";
import { ApiError, apiFetch } from "./client";
import { parseUser } from "./normalizers";


export async function login(request: LoginRequest): Promise<LoginResponse> {
  try {
    const data = await apiFetch<Partial<LoginResponse>>("/auth/login", {
      method: "POST",
      body: {
        email: request.email.trim().toLowerCase(),
        password: request.password,
      },
    });
    if (!data.access_token || !data.refresh_token) {
      throw new ApiError("The server returned an unexpected login response.", 502);
    }
    return { access_token: data.access_token, refresh_token: data.refresh_token };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      throw new ApiError("Invalid email or password.", 401);
    }
    throw error;
  }
}

export async function getProfile(): Promise<User> {
  const user = parseUser(await apiFetch<unknown>("/auth/profile", { auth: true }));
  if (!user) throw new ApiError("The profile returned by the API was invalid.", 502);
  return user;
}
