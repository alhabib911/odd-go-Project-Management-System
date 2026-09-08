import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F8FAFC] text-[#1F2937]">
      <nav className="mx-auto flex h-[84px] max-w-[1220px] items-center justify-between px-[22px] max-md:h-[72px]">
        <Link href="/" className="flex items-center gap-[9px] font-sans text-[20px] font-bold tracking-[-0.5px] text-[#1F2937] no-underline">
          <span className="grid size-[27px] place-items-center rounded-lg bg-[#2563EB] text-white">✦</span>Odd-Go
        </Link>
        <div className="ml-20 flex gap-[34px] max-md:hidden">
          <Link href="/" className="text-sm font-medium text-[#64748B] no-underline hover:text-[#2563EB]">
            Home
          </Link>
          <a href="#features" className="text-sm font-medium text-[#64748B] no-underline hover:text-[#2563EB]">
            Features
          </a>
          <a href="#about" className="text-sm font-medium text-[#64748B] no-underline hover:text-[#2563EB]">
            About
          </a>
        </div>
        <div className="flex items-center gap-6 max-md:gap-3">
          <Link href="/login" className="text-sm font-medium text-[#64748B] no-underline hover:text-[#2563EB]">
            Sign in
          </Link>
          <Link href="/register" className="inline-flex items-center gap-[18px] rounded-lg bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white no-underline hover:bg-[#1D4ED8]">
            Get Started <span>→</span>
          </Link>
        </div>
      </nav>
      <section className="mx-auto grid min-h-[598px] max-w-[1220px] grid-cols-[45%_55%] items-center px-[22px] py-[78px] max-md:block max-md:pt-[50px]">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-[999px] border border-[#E2E8F0] bg-white px-3 py-[6px] text-[11px] font-semibold tracking-[0.05em] text-[#64748B]">
            WORK SMARTER. ACHIEVE MORE. <b>↗</b>
          </div>
          <h1 className="mb-6 mt-7 font-sans text-[clamp(40px,5.3vw,64px)] font-bold leading-[1.05] tracking-[-0.03em] text-[#1F2937] max-md:text-[40px]">
            Plan better.
            <br />
            <em>Work smarter.</em>
            <br />
            Achieve more.
          </h1>
          <p className="mb-7 max-w-[390px] text-base leading-[1.7] text-[#64748B]">
            Odd-Go brings your projects, tasks, and workflow into one organized place—helping you stay focused, work efficiently, and get more done.
          </p>
          <div className="flex items-center gap-[22px]">
            <Link href="/register" className="inline-flex items-center gap-[18px] rounded-lg bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white no-underline shadow-[0_7px_18px_rgba(37,99,235,0.18)] hover:bg-[#1D4ED8]">
              Get Started <span>→</span>
            </Link>
            <a href="#features" className="text-sm font-medium text-[#475569] no-underline">
              Organize your work
            </a>
          </div>
          <div className="mt-[37px] flex items-center gap-3">
            <p className="text-[15px] leading-[1.7] text-[#64748B]">
              <strong className="text-base font-bold text-[#1F2937]">Built for productive teams</strong>
              <br />
              Plan clearly. Stay organized. Move forward.
            </p>
          </div>
        </div>
        <div className="relative h-[500px] max-md:mt-[38px] max-md:h-[420px] max-md:w-[120%] max-md:scale-[.83] max-md:origin-top-left">
          <div className="absolute left-[20%] top-[16%] size-[330px] rounded-full bg-[#EFF6FF] blur-3xl" />
          <div className="absolute rounded-full border border-[#DBEAFE] left-[11%] top-[15%] h-[280px] w-[500px] rotate-[-25deg]" />
          <div className="absolute rounded-full border border-[#DBEAFE] left-[24%] top-[28%] h-[360px] w-[190px] rotate-[35deg]" />
          <div className="absolute left-[52%] top-[43%] text-4xl text-[#f2ad66]">✦</div>
          <div className="absolute rounded-lg border border-[#e7edf6] bg-white p-4 shadow-[0_15px_40px_rgba(53,78,110,0.1)] right-[7%] top-[13%]">
            <span className="window-dot" />
            <span className="window-line short" />
            <span className="window-line" />
            <span className="window-pill" />
          </div>
          <div className="absolute left-[17%] top-[23%] w-[390px] rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-[0_25px_60px_rgba(53,78,110,0.14)]">
            <div className="flex items-center justify-between text-xs text-[#596a7b]">
              <span>Welcome back</span>
              <span className="grid size-7 place-items-center rounded-full bg-[#f1d9dc] text-[10px] font-bold text-[#875b67]">JD</span>
            </div>
            <div className="mt-7 flex justify-between text-[10px] font-semibold tracking-[0.1em] text-[#94A3B8]">
              YOUR PROJECTS <span>ACTIVE NOW</span>
            </div>
            <div className="mt-2 font-sans text-4xl font-semibold text-[#18232f]">
              12 <small className="text-sm text-[#64748B]">Projects</small>
            </div>
            <div className="mt-7 flex h-[110px] items-end justify-between gap-3 border-b border-[#eef1f3]">
              <i style={{ height: "44%" }} />
              <i style={{ height: "62%" }} />
              <i style={{ height: "53%" }} />
              <i className="bg-[#4f85f3]" style={{ height: "82%" }} />
              <i style={{ height: "68%" }} />
              <i style={{ height: "91%" }} />
            </div>
            <div className="mt-4 flex justify-between text-[10px] text-[#a2abb5]">
              <span>Team momentum</span>
              <b>+18.4%</b>
            </div>
          </div>
          <div className="absolute rounded-lg border border-[#e7edf6] bg-white p-4 shadow-[0_15px_40px_rgba(53,78,110,0.1)] bottom-[11%] left-[1%] flex items-center gap-3">
            <div className="grid size-8 place-items-center rounded-full bg-[#EFF6FF] text-[#2563EB]">✓</div>
            <div>
              <strong className="block text-base font-bold text-[#1F2937]">Mobile App Development</strong>
              <span className="block text-sm font-medium text-[#64748B]">65% complete</span>
            </div>
            <b className="text-sm font-semibold text-[#2563EB]">In Progress</b>
          </div>
        </div>
      </section>
      <section id="features" className="mx-auto max-w-[1176px] border-y border-[#E2E8F0] px-0 py-[25px] max-md:mx-[22px]">
        <span className="text-[10px] font-semibold tracking-[0.08em] text-[#94A3B8]">DESIGNED FOR BETTER WORK. BUILT FOR REAL PROGRESS.</span>
        <div className="mt-5 flex items-center justify-between text-[#8d9899] max-md:flex-wrap max-md:gap-5">
          <b className="font-sans text-lg tracking-[-1px]">northstar</b>
          <b className="font-serif text-lg italic tracking-[-1px]">lumina</b>
          <b>
            arc<span>°</span>
          </b>
          <b className="font-sans text-lg tracking-[-1px]">vertex</b>
          <b className="font-sans text-lg tracking-[-1px]">acme</b>
        </div>
      </section>
      <footer id="about" className="mx-auto flex max-w-[1220px] items-center gap-[34px] border-t border-[#E2E8F0] px-[22px] py-[25px] text-xs text-[#94A3B8] max-md:flex-wrap">
        <Link href="/" className="flex items-center gap-[9px] font-sans text-lg font-bold tracking-[-0.5px] text-[#1F2937] no-underline">
          <span className="grid size-[27px] place-items-center rounded-lg bg-[#2563EB] text-white">✦</span>Odd-Go
        </Link>
        <span>Plan. Organize. Progress.</span>
        <span>© 2026 Odd-Go. All rights reserved.</span>
      </footer>
    </main>
  );
}
