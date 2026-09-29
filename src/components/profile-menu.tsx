"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export type ProfileData = {
  name: string;
  email: string;
  phone: string;
  role: string;
  password?: string;
  teamName: string;
  technology: string;
  avatarUrl?: string;
};

export const defaultProfile: ProfileData = {
  name: "Jordan Davis",
  email: "jordan@focura.dev",
  phone: "+880 1711-000111",
  role: "",
  teamName: "Engineering",
  technology: "Node JS, Mongo DB, REST API",
};

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = window.localStorage.getItem("focura-profile");
      const currentUser = JSON.parse(window.localStorage.getItem("focura-current-user") ?? "null") as { email?: string } | null;
      const profileKey = currentUser?.email ? `focura-profile:${currentUser.email}` : "focura-profile";
      const userProfile = window.localStorage.getItem(profileKey);
      const parsed = userProfile ?? stored;
      if (parsed) setProfile({ ...defaultProfile, ...(JSON.parse(parsed) as Partial<ProfileData>) });
    }, 0);
    function close(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mousedown", close);
    };
  }, []);

  async function logout() {
    const supabase = createSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    window.localStorage.removeItem("focura-authenticated");
    window.localStorage.removeItem("focura-current-user");
    router.push("/login");
  }

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-label="Open profile menu" className="grid size-8 overflow-hidden place-items-center rounded-full bg-[#f1d9dc] text-[11px] font-bold text-[#875b67]">
        {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.name} className="size-full object-cover" /> : profile.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-40 w-44 rounded-xl border border-[#e6ebf1] bg-white p-2 shadow-[0_12px_30px_rgba(30,55,80,0.14)]">
          <Link href="/profile" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-xs font-semibold text-[#26333d] no-underline hover:bg-[#f5f7f9]">My Profile</Link>
          <button type="button" onClick={logout} className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#d8665d] hover:bg-[#fff4f2]">Logout</button>
        </div>
      )}
    </div>
  );
}
