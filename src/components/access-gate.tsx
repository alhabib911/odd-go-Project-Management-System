"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const protectedPages: Record<string, string> = {
  "/dashboard": "Overview",
  "/projects": "Projects",
  "/tasks": "Tasks",
  "/team": "Team",
  "/reports": "Reports",
  "/role-management": "Role Management",
};
const superadminEmail = "abdullahalhabib100@gmail.com";

export default function AccessGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const page = protectedPages[pathname];
      if (!page) {
        setChecking(false);
        return;
      }

      const currentUser = JSON.parse(
        window.localStorage.getItem("focura-current-user") ?? "null",
      ) as { email?: string } | null;
      const email = currentUser?.email?.toLowerCase();
      if (!email) {
        router.replace("/login");
        return;
      }
      if (email === superadminEmail) {
        setChecking(false);
        return;
      }
      if (page === "Role Management") {
        setAllowed(false);
        setMessage("Role Management শুধু Superadmin-এর জন্য নির্ধারিত।");
        setChecking(false);
        return;
      }

      const requests = JSON.parse(
        window.localStorage.getItem("focura-role-requests") ?? "[]",
      ) as Array<{ email: string; status: string; access?: string[] }>;
      const request = requests.find(
        (item) => item.email.toLowerCase() === email,
      );
      const access = request?.access ?? [];
      if (request?.status !== "Approved") {
        setAllowed(false);
        setMessage("You don't have access to this dashboard. Please contact the Superadmin to request access.");
      } else if (!access.includes(page)) {
        setAllowed(false);
        setMessage(`You don't have access to ${page}. Please contact the Superadmin to request access.`);
      }
      setChecking(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname, router]);

  if (checking) {
    return <div className="grid min-h-screen place-items-center bg-[#f8fafb] text-sm text-[#89939f]">Checking access...</div>;
  }
  if (!allowed) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8fafb] px-5">
        <section className="w-full max-w-md rounded-2xl border border-[#e6ebf1] bg-white p-8 text-center shadow-[0_18px_50px_rgba(30,55,80,0.08)]">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#fff7e8] text-xl text-[#d58b35]">!</div>
          <h1 className="mt-5 text-xl font-bold text-[#18232f]">Access Denied</h1>
          <p className="mt-3 text-sm leading-6 text-[#89939f]">{message}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/login" className="rounded-lg border border-[#e1e6ec] px-4 py-2.5 text-xs font-semibold text-[#687582] no-underline">Back to login</Link>
            <Link href="/" className="rounded-lg bg-[#2e6ff2] px-4 py-2.5 text-xs font-semibold text-white no-underline">Go home</Link>
          </div>
        </section>
      </main>
    );
  }
  return children;
}
