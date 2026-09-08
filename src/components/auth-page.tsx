"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type AuthPageProps = {
  mode: "login" | "register";
};

const copy = {
  login: {
    eyebrow: "WELCOME BACK",
    title: "Good to see you.",
    description: "Sign in to continue to your focused workspace.",
    submit: "Sign in",
    footer: "Don’t have an account?",
    footerLink: "Create free account",
    footerHref: "/register",
  },
  register: {
    eyebrow: "START FOR FREE",
    title: "Build better, together.",
    description: "Create a workspace where important work can move forward.",
    submit: "Create workspace",
    footer: "Already have an account?",
    footerLink: "Sign in",
    footerHref: "/login",
  },
} as const;

export default function AuthPage({ mode }: AuthPageProps) {
  const content = copy[mode];
  const isLogin = mode === "login";
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Authentication is not configured.");
      setSubmitting(false);
      return;
    }
    if (isLogin) {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });
      if (signInError || !data.user) {
        setError(signInError?.message ?? "Unable to sign in.");
        setSubmitting(false);
        return;
      }
      window.localStorage.setItem("focura-current-user", JSON.stringify({ id: data.user.id, email: data.user.email }));
      window.localStorage.setItem("focura-authenticated", "true");
      const isSuperadmin = data.user.email?.toLowerCase() === "abdullahalhabib100@gmail.com";
      const requests = JSON.parse(window.localStorage.getItem("focura-role-requests") ?? "[]") as Array<{ email: string; status: string; access?: string[] }>;
      const approved = requests.find((request) => request.email.toLowerCase() === data.user.email?.toLowerCase() && request.status === "Approved");
      router.push(isSuperadmin || approved?.access?.includes("Overview") ? "/dashboard" : "/access-denied");
      return;
    }
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: { data: { full_name: form.name.trim() } },
    });
    if (signUpError || !data.user) {
      setError(signUpError?.message ?? "Unable to create your account.");
      setSubmitting(false);
      return;
    }
    const existing = JSON.parse(window.localStorage.getItem("focura-role-requests") ?? "[]") as Array<Record<string, string>>;
    const request = { id: data.user.id, name: form.name.trim(), email: form.email.trim(), status: "Pending", requestedAt: new Date().toISOString() };
    window.localStorage.setItem("focura-role-requests", JSON.stringify([...existing, request]));
    window.localStorage.setItem("focura-current-user", JSON.stringify({ id: data.user.id, name: request.name, email: request.email }));
    window.localStorage.setItem("focura-authenticated", "true");
    router.push("/access-denied");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f7fb] px-5 py-10 text-[#18232f]">
      {/* The background panel gives both auth flows a shared visual identity without extra CSS files. */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,#dfeaff_0,transparent_28%),radial-gradient(circle_at_90%_85%,#fff0df_0,transparent_24%)]" />
      <div className="relative z-10 grid w-full max-w-[1030px] overflow-hidden rounded-[22px] border border-white/80 bg-white shadow-[0_28px_80px_rgba(31,55,83,0.12)] lg:grid-cols-[0.92fr_1.08fr]">
        <section className="relative hidden overflow-hidden bg-[#26333d] p-12 text-white lg:block">
          <div className="absolute -right-24 -top-24 size-80 rounded-full border border-white/10" />
          <div className="absolute -bottom-40 -left-24 size-96 rounded-full border border-[#f2ad66]/25" />
          <div className="relative flex h-full min-h-[570px] flex-col">
            <Link href="/" className="flex items-center gap-2 font-sans text-xl font-bold tracking-[-0.7px] text-white no-underline">
              <span className="grid size-7 place-items-center rounded-lg bg-[#2e6ff2] text-sm text-white">✦</span>
              focura
            </Link>
            <div className="mt-auto">
              <span className="mb-4 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f2ad66]">A calmer way to work</span>
              <h2 className="max-w-[310px] font-sans text-4xl font-bold leading-[1.05] tracking-[-1.8px]">Make room for the work that matters.</h2>
              <p className="mt-5 max-w-[280px] text-sm leading-6 text-[#b4c0c8]">Plan clearly, collaborate naturally, and keep your team moving with intention.</p>
              <div className="mt-10 flex items-center gap-3 border-t border-white/10 pt-5 text-xs text-[#a8b4bc]">
                <span className="grid size-8 place-items-center rounded-full bg-[#7994a9] text-[9px] font-bold text-white">JD</span>
                <span>Trusted by focused teams</span>
              </div>
            </div>
          </div>
        </section>
        <section className="p-7 sm:p-10 lg:p-12">
          <Link href="/" className="flex items-center gap-2 font-sans text-xl font-bold tracking-[-0.7px] text-[#18232f] no-underline lg:hidden">
            <span className="grid size-7 place-items-center rounded-lg bg-[#2e6ff2] text-sm text-white">✦</span>
            focura
          </Link>
          <div className="mt-10 max-w-[390px] lg:mt-5">
            <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#e7954a]">{content.eyebrow}</span>
            <h1 className="font-sans text-3xl font-bold tracking-[-1.3px] text-[#18232f]">{content.title}</h1>
            <p className="mt-3 text-sm leading-6 text-[#89939f]">{content.description}</p>
          </div>
          <form onSubmit={submit} className="mt-8 grid max-w-[390px] gap-5">
            {!isLogin && <Field label="Your name" type="text" placeholder="Jordan Davis" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />}
            <Field label={isLogin ? "Email address" : "Work email"} type="email" placeholder="you@company.com" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} />
            <Field label="Password" type="password" placeholder={isLogin ? "Enter your password" : "At least 8 characters"} action={isLogin ? "Forgot password?" : undefined} value={form.password} onChange={(value) => setForm((current) => ({ ...current, password: value }))} />
            {isLogin && <label className="flex items-center gap-2 text-xs text-[#89939f]"><input type="checkbox" className="size-4 accent-[#2e6ff2]" /> Remember me</label>}
            {error && <p role="alert" className="rounded-lg bg-[#fff0ef] px-3 py-2 text-xs text-[#d8665d]">{error}</p>}
            <button disabled={submitting} className="mt-1 flex h-12 items-center justify-center gap-3 rounded-lg bg-[#2e6ff2] px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(46,111,242,0.2)] transition hover:bg-[#1f5edd] disabled:cursor-not-allowed disabled:opacity-60" type="submit">
              {submitting ? "Please wait..." : content.submit}<span className="text-lg text-[#f7c18d]">→</span>
            </button>
          </form>
          <p className="mt-7 max-w-[390px] text-center text-xs text-[#98a1ab] sm:text-left">
            {content.footer} <Link href={content.footerHref} className="font-semibold text-[#2e6ff2] no-underline hover:underline">{content.footerLink}</Link>
          </p>
        </section>
      </div>
    </main>
  );
}

function Field({ label, type, placeholder, action, value, onChange }: { label: string; type: "text" | "email" | "password"; placeholder: string; action?: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-xs font-semibold text-[#53606d]">
      <span className="flex items-center justify-between">{label}{action && <a href="#" className="font-medium text-[#2e6ff2] no-underline hover:underline">{action}</a>}</span>
      <input required value={value} onChange={(event) => onChange(event.target.value)} className="h-12 rounded-lg border border-[#dfe5eb] bg-white px-3.5 text-sm font-normal text-[#18232f] outline-none placeholder:text-[#b0b8c0] focus:border-[#2e6ff2] focus:ring-4 focus:ring-[#2e6ff2]/10" type={type} placeholder={placeholder} />
    </label>
  );
}
