"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type IconName =
  | "grid"
  | "folder"
  | "check"
  | "users"
  | "chart"
  | "search"
  | "bell"
  | "settings"
  | "more"
  | "spark";

const navigation: { label: string; icon: IconName; href: string }[] = [
  { label: "Role Management", icon: "settings", href: "/role-management" },
  { label: "Projects", icon: "folder", href: "/projects" },
  { label: "Tasks", icon: "check", href: "/tasks" },
  { label: "Team", icon: "users", href: "/team" },
  { label: "Reports", icon: "chart", href: "/reports" },
];
const superadminEmail = "abdullahalhabib100@gmail.com";

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    folder: <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H10l2 2h6.5A2.5 2.5 0 0 1 21 8.5v8A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z" />,
    check: (
      <>
        <path d="M5 4h14v16H5z" />
        <path d="m8 12 2.5 2.5L16 9" />
      </>
    ),
    users: (
      <>
        <path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20" />
        <circle cx="10" cy="8" r="3" />
        <path d="M16 5.2a3 3 0 0 1 0 5.6M20 20v-1.5a3.5 3.5 0 0 0-2.5-3.35" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V5M4 19h17" />
        <path d="m7 15 3-4 3 2 5-7" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    bell: <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 22h4" />,
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.8 1.8-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2.55v-.1a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.8-1.8.06-.06A1.7 1.7 0 0 0 8.1 15a1.7 1.7 0 0 0-1.56-1.03h-.1v-2.55h.1A1.7 1.7 0 0 0 8.1 10a1.7 1.7 0 0 0-.34-1.88L7.7 8.06l1.8-1.8.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.03-1.56V5h2.55v.1a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.8 1.8-.06.06A1.7 1.7 0 0 0 19.4 10a1.7 1.7 0 0 0 1.56 1.03h.1v2.55h-.1A1.7 1.7 0 0 0 19.4 15z" />
      </>
    ),
    more: (
      <>
        <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4z" />
        <path d="m19 16 .6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6z" />
      </>
    ),
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export default function WorkspaceSidebar({ active }: { active: string }) {
  const allowedNavigation = navigation;

  return (
    <aside className="flex w-[252px] shrink-0 flex-col border-r border-[#e9edf2] bg-white px-[14px] pb-[18px] pt-[25px] max-lg:w-[215px] max-md:w-[62px] max-md:px-2 max-md:py-[22px]">
      <Link href="/projects" className="flex items-center gap-[9px] px-[14px] font-sans text-[21px] font-bold tracking-[-0.7px] no-underline text-[#18232f]">
        <span className="grid size-[27px] place-items-center rounded-lg bg-[#2e6ff2] text-white"><Icon name="spark" size={17} /></span>
        <span>focura</span>
      </Link>
      <nav className="mt-8">
        {allowedNavigation?.map((item) => (
          <Link key={item.label} href={item.href} className={active === item.label ? "flex w-full items-center gap-[13px] rounded-lg bg-[#edf3ff] px-[13px] py-2 text-left font-semibold text-[#2e6ff2] no-underline max-md:justify-center max-md:px-0 max-md:py-2" : "flex w-full items-center gap-[13px] rounded-lg bg-transparent px-[13px] py-2 text-left text-[#8b96a3] no-underline hover:bg-[#f5f7f9] hover:text-[#18232f] max-md:justify-center max-md:px-0 max-md:py-2"}>
            <Icon name={item.icon} />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
