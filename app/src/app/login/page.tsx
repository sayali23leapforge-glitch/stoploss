import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  AUTH_TEST_USERS,
  encodeToken,
  getGoogleTestUser,
  verifyEmailLogin,
} from "@/lib/auth";

async function loginWithEmail(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const user = verifyEmailLogin(email, password);
  if (!user) {
    // For now, just redirect back - in production you'd handle errors properly
    redirect("/login");
  }
  const token = encodeToken(user);
  const cookieStore = await cookies();
  cookieStore.set("sl_token", token, { httpOnly: true, sameSite: "lax" });
  redirect("/");
}

async function loginWithGoogle() {
  "use server";
  const user = getGoogleTestUser();
  const token = encodeToken(user);
  const cookieStore = await cookies();
  cookieStore.set("sl_token", token, { httpOnly: true, sameSite: "lax" });
  redirect("/");
}

export default function LoginPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="flex flex-col justify-between px-10 py-12">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
            StopLossSolution
          </p>
          <h1 className="font-display mt-6 text-4xl">
            Trade with a trailing safety net.
          </h1>
          <p className="mt-4 max-w-md text-sm text-slate-300">
            Sign in to preview adaptive stop-loss signals powered by EMA bands.
            This milestone uses hardcoded test users.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm font-semibold text-slate-100">Test accounts</p>
          <ul className="mt-3 space-y-2 text-xs text-slate-300">
            {AUTH_TEST_USERS.map((user) => (
              <li key={user.id}>
                {user.email} · password:{" "}
                <span className="text-amber-200">test123</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-center border-l border-white/10 bg-slate-950/60 px-8">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8">
          <h2 className="text-xl font-semibold">Sign in</h2>
          <form action={loginWithEmail} className="mt-6 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-300"
                placeholder="rhea@demo.stopsafe"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-300"
                placeholder="test123"
              />
            </div>
            <button className="w-full rounded-xl bg-amber-300 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:brightness-95">
              Continue with email
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-white/10" />
            OR
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <form action={loginWithGoogle}>
            <button className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10">
              Continue with Google (test)
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
