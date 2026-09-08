"use client";

import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f8fafb] px-5">
      <section className="w-full max-w-md rounded-2xl border border-[#e6ebf1] bg-white p-8 text-center shadow-[0_18px_50px_rgba(30,55,80,0.08)]">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#fff7e8] text-xl text-[#d58b35]">!</div>
        <h1 className="mt-5 text-xl font-bold text-[#18232f]">Access Denied</h1>
        <p className="mt-3 text-sm leading-6 text-[#89939f]">You don&apos;t have access to this dashboard. Please contact the Superadmin to request access.</p>
        <Link href="/" className="mt-6 inline-flex rounded-lg bg-[#2e6ff2] px-4 py-2.5 text-xs font-semibold text-white no-underline">Go home</Link>
      </section>
    </main>
  );
}
