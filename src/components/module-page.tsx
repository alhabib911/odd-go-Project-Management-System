"use client";

import Link from "next/link";

// Shared module shell keeps each route consistent while leaving a Supabase-ready data boundary.
export default function ModulePage({
  title,
  description,
  actionLabel,
}: {
  title: string;
  description: string;
  actionLabel?: string;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_85%_8%,#edf3ff_0,transparent_25%),#f8fafb] px-6 py-[54px] sm:px-[6vw]">
      <div className="mx-auto mt-[60px] mb-8 max-w-[720px]">
        <Link href="/" className="text-xs font-semibold text-[#2e6ff2] no-underline">
          ← Back to overview
        </Link>
        <div className="mt-6 flex items-end justify-between gap-4 max-sm:items-start max-sm:flex-col">
          <div>
            <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9ba5b0]">WORKSPACE MODULE</span>
            <h1>{title}</h1>
          </div>
          {actionLabel ? (
            <button className="inline-flex shrink-0 items-center gap-2 rounded-[7px] bg-[#2e6ff2] px-4 py-[11px] text-[13px] font-semibold text-white shadow-[0_5px_12px_rgba(46,111,242,0.15)] hover:bg-[#1f5edd]">
              <span className="text-base leading-none">+</span>
              {actionLabel}
            </button>
          ) : null}
        </div>
        <p>{description}</p>
      </div>
      <div className="mx-auto flex min-h-[270px] max-w-[720px] flex-col items-center justify-center rounded-xl border border-[#e9edf2] bg-white text-center">
        <div className="grid size-[45px] place-items-center rounded-xl bg-[#edf3ff] text-[22px] text-[#2e6ff2]">✦</div>
        <h2>Your {title.toLowerCase()} live here.</h2>
        <p>
          This module is connected to the same Supabase-ready workspace architecture.
        </p>
        <button className="flex items-center justify-center gap-2 rounded-[7px] bg-[#2e6ff2] px-4 py-[11px] text-[13px] font-semibold text-white shadow-[0_5px_12px_rgba(46,111,242,0.15)] hover:bg-[#1f5edd]">
          Create new <span>→</span>
        </button>
      </div>
    </div>
  );
}
