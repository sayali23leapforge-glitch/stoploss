export type AuthProvider = "google" | "email";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  provider: AuthProvider;
};

const TEST_USERS: AuthUser[] = [
  {
    id: "user-neo-001",
    name: "Rhea Kapoor",
    email: "rhea@demo.stopsafe",
    provider: "email",
  },
  {
    id: "user-neo-002",
    name: "Arjun Mehta",
    email: "arjun@demo.stopsafe",
    provider: "email",
  },
  {
    id: "user-neo-003",
    name: "Google Test",
    email: "google.test@demo.stopsafe",
    provider: "google",
  },
];

const TEST_PASSWORD = "test123";
const AUTH_COOKIE = "sl_token";

export function getAuthCookieName() {
  return AUTH_COOKIE;
}

export function verifyEmailLogin(email: string, password: string): AuthUser | null {
  const user = TEST_USERS.find(
    (candidate) => candidate.email.toLowerCase() === email.toLowerCase()
  );
  if (!user) return null;
  if (password !== TEST_PASSWORD) return null;
  return { ...user, provider: "email" };
}

export function getGoogleTestUser(): AuthUser {
  return TEST_USERS.find((user) => user.provider === "google") as AuthUser;
}

export function encodeToken(user: AuthUser) {
  const payload = JSON.stringify({ id: user.id, email: user.email });
  return Buffer.from(payload).toString("base64");
}

export function decodeToken(token: string | undefined | null): AuthUser | null {
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const payload = JSON.parse(decoded) as { id: string; email: string };
    const user = TEST_USERS.find((candidate) => candidate.id === payload.id);
    return user ?? null;
  } catch {
    return null;
  }
}

export const AUTH_TEST_USERS = TEST_USERS;
