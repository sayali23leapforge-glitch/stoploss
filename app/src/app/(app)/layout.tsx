import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { decodeToken, getAuthCookieName } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value;
  const user = decodeToken(token);

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex min-h-screen flex-col px-6 py-8 lg:px-10">
        <Topbar user={user} />
        <main className="mt-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
