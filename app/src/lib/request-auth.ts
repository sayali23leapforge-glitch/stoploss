import { cookies } from "next/headers";
import { decodeToken, getAuthCookieName } from "./auth";

export async function requireUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value;
  const user = decodeToken(token);
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user.id;
}
