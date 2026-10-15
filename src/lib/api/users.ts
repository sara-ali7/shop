import type { EmailAvailabilityResponse, RegisterRequest, User } from "@/types";
import { ApiError, apiFetch } from "./client";
import { parseList, parseUser } from "./normalizers";

export async function isEmailAvailable(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  try {
    const data = await apiFetch<Partial<EmailAvailabilityResponse>>("/users/is-available", {
      method: "POST",
      body: { email: normalized },
    });
    if (data.isAvailable === true) {
      return true;
    }
  } catch {
  }
  try {
    const raw = await apiFetch<unknown>("/users");
    if (Array.isArray(raw)) {
      const exists = raw.some(
        (u) =>
          u &&
          typeof u === "object" &&
          "email" in u &&
          typeof u.email === "string" &&
          u.email.trim().toLowerCase() === normalized,
      );
      return !exists;
    }
  } catch {
    return true;
  }

  return true;
}

export async function registerUser(request: RegisterRequest): Promise<void> {
  await apiFetch<unknown>("/users", {
    method: "POST",
    body: {
      ...request,
      email: request.email.trim().toLowerCase(),
    },
  });
}

export async function getUsers(): Promise<User[]> {
  return parseList(await apiFetch<unknown>("/users", { auth: true }), parseUser);
}

export async function getUser(id: number | string): Promise<User> {
  const user = parseUser(
    await apiFetch<unknown>(`/users/${encodeURIComponent(String(id))}`, { auth: true }),
  );
  if (!user) throw new ApiError("This user could not be found.", 404);
  return user;
}
