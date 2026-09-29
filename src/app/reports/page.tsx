"use client";

import { useEffect, useMemo, useState } from "react";
import WorkspaceSidebar, { Icon } from "@/components/workspace-sidebar";
import ProfileMenu from "@/components/profile-menu";
import { loadWorkspaceData } from "@/lib/workspace-data";

type Project = {
  id: string;
  name: string;
  clientName: string;
  price: string;
  commissionAmount: string;
  payableAmount: string;
  currency: string;
  paymentMethod: string;
  collectionWay?: string;
  status?: string;
  createdAt?: string;
};

const fallbackProjects: Project[] = [
  {
    id: "1",
    name: "Website redesign",
    clientName: "Acme Corporation",
    price: "8500",
    commissionAmount: "500",
    payableAmount: "8000",
    currency: "USD",
    paymentMethod: "Upwork",
  },
  {
    id: "2",
    name: "Mobile app launch",
    clientName: "Northstar Labs",
    price: "6200",
    commissionAmount: "620",
    payableAmount: "5580",
    currency: "USD",
    paymentMethod: "Fiverr",
  },
  {
    id: "3",
    name: "Brand identity",
    clientName: "Lumina Studio",
    price: "3800",
    commissionAmount: "0",
    payableAmount: "3800",
    currency: "USD",
    paymentMethod: "Bank Payment",
  },
];

function amount(value: string | undefined) {
  return Number(value) || 0;
}

function money(value: number) {
  return `USD ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function ReportsPage() {
  const [projects, setProjects] = useState<Project[]>(fallbackProjects);
  const [tasks, setTasks] = useState<{ project: string; status: string }[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void Promise.all([
        loadWorkspaceData("dev-cluster-projects", fallbackProjects),
        loadWorkspaceData<{ project: string; status: string }[]>("dev-cluster-tasks", []),
      ]).then(([storedProjects, storedTasks]) => {
        setProjects(storedProjects as Project[]);
        setTasks(storedTasks);
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const reportCards = useMemo(() => {
    const earnings = (platform: string) =>
      projects
        .filter(
          (project) =>
            (project.collectionWay ?? project.paymentMethod ?? "").toLowerCase() ===
            platform.toLowerCase(),
        )
        .reduce((total, project) => total + amount(project.price), 0);
    const statusCount = (status: string) =>
      projects.filter((project) => {
        if (project.status) return project.status.toLowerCase() === status;
        const projectTasks = tasks.filter((task) => task.project === project.name);
        if (status === "done") return projectTasks.length > 0 && projectTasks.every((task) => task.status === "Done");
        if (status === "ongoing") return projectTasks.some((task) => task.status !== "Done");
        return false;
      }).length;
    const totalRevenue = projects.reduce(
      (total, project) => total + amount(project.price),
      0,
    );
    const totalPayable = projects.reduce(
      (total, project) =>
        total +
        (project.payableAmount
          ? amount(project.payableAmount)
          : amount(project.price) - amount(project.commissionAmount)),
      0,
    );
    const totalDue = projects.reduce(
      (total, project) =>
        total +
        (project.status?.toLowerCase() === "due" ? amount(project.price) : 0),
      0,
    );
    return [
      ["Fiverr earnings", earnings("fiverr"), "blue"],
      ["Upwork earnings", earnings("upwork"), "green"],
      ["Facebook earnings", earnings("facebook"), "orange"],
      ["LinkedIn earnings", earnings("linkedin"), "purple"],
      ["Local client earnings", earnings("local connection"), "blue"],
      ["Total Revenue", totalRevenue, "blue"],
      ["Total Payable", totalPayable, "green"],
      ["Total Due", totalDue, "orange"],
      ["Total commission", projects.reduce((total, project) => total + amount(project.commissionAmount), 0), "orange"],
      ["Total projects", projects.length, "purple"],
      ["Ongoing projects", statusCount("ongoing"), "blue"],
      ["Done projects", statusCount("done"), "green"],
      ["Cancelled projects", statusCount("cancelled"), "orange"],
    ] as const;
  }, [projects, tasks]);
  const monthlyReports = useMemo(() => {
    const current = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(current.getFullYear(), current.getMonth() - (5 - index), 1);
      const month = date.toLocaleString("en-US", { month: "short" });
      const monthProjects = projects.filter((project) => {
        if (!project.createdAt) return index === 5;
        const created = new Date(project.createdAt);
        return created.getFullYear() === date.getFullYear() && created.getMonth() === date.getMonth();
      });
      const income = monthProjects.reduce((sum, project) => sum + amount(project.price), 0);
      const commission = monthProjects.reduce((sum, project) => sum + amount(project.commissionAmount), 0);
      return {
        month,
        income,
        commission,
        net: income - commission,
        payable: monthProjects.reduce((sum, project) => sum + (project.payableAmount ? amount(project.payableAmount) : amount(project.price) - amount(project.commissionAmount)), 0),
        due: monthProjects.filter((project) => project.status?.toLowerCase() === "due").length,
        count: monthProjects.length,
      };
    });
  }, [projects]);
  const maxMonthlyValue = Math.max(...monthlyReports.flatMap((item) => [item.income, item.commission, item.net, item.payable]), 1);
  const maxMonthlyPrice = Math.max(...monthlyReports.map((item) => item.income), 1);
  const totalDue = projects.reduce(
    (sum, project) =>
      sum + (project.status?.toLowerCase() === "due" ? amount(project.price) : 0),
    0,
  );
  const totalPayable = projects.reduce(
    (sum, project) =>
      sum +
      (project.payableAmount
        ? amount(project.payableAmount)
        : amount(project.price) - amount(project.commissionAmount)),
    0,
  );

  return (
    <div className="flex min-h-screen bg-[#f8fafb]">
      <WorkspaceSidebar active="Reports" />
      <main className="min-w-0 flex-1">
        <header className="flex h-[72px] items-center justify-between border-b border-[#e9edf2] bg-white px-[47px] max-lg:px-7 max-md:h-[62px] max-md:px-[18px]">
          <div className="hidden items-center gap-[9px] font-sans text-lg font-bold max-md:flex">
            <span className="grid size-[27px] place-items-center rounded-lg bg-[#2e6ff2] text-white"><Icon name="spark" size={16} /></span>
            Dev Cluster
          </div>
          <div className="flex items-center gap-3 text-[#a5adb7] max-md:hidden"><span>Workspace</span><b>/</b><strong>Reports</strong></div>
          <div className="flex items-center gap-[17px]">
            <button className="grid place-items-center bg-transparent text-[#89939f]" aria-label="Search"><Icon name="search" /></button>
            <button className="grid place-items-center bg-transparent text-[#89939f]" aria-label="Notifications"><Icon name="bell" /></button>
            <ProfileMenu />
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] px-[47px] pb-[50px] pt-[42px] max-lg:px-7 max-md:px-4 max-md:pb-[35px] max-md:pt-7">
          <div className="mb-8">
            <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9ba5b0]">WORKSPACE MODULE</span>
            <h1 className="font-sans text-3xl font-bold tracking-[-1px] text-[#18232f]">Reports</h1>
            <p className="mt-2 text-sm text-[#89939f]">Track revenue, commissions, and account performance at a glance.</p>
          </div>

          <section className="mb-4 grid grid-cols-5 gap-3 max-lg:grid-cols-4 max-md:grid-cols-2 max-md:gap-2.5">
            {reportCards.map(([label, value, tone]) => (
              <ReportCard
                key={label}
                label={label}
                value={label.includes("earnings") || label.startsWith("Total ") ? money(value) : String(value)}
                tone={tone}
              />
            ))}
          </section>

          <section className="mb-4 grid grid-cols-2 gap-4 max-lg:grid-cols-1">
            <MonthlyAccountsChart data={monthlyReports} maxValue={maxMonthlyValue} />
            <MonthlyProjectsChart data={monthlyReports} maxPrice={maxMonthlyPrice} />
          </section>

          <section className="overflow-hidden rounded-xl border border-[#e6ebf1] bg-white p-6 shadow-[0_12px_32px_rgba(30,55,80,0.04)] max-md:p-4">
            <div className="mb-6"><h2 className="font-sans text-base font-bold text-[#18232f]">Accounts summary</h2><p className="mt-1 text-xs text-[#96a0ac]">Income and payable breakdown by project</p></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[900px]"><thead><tr className="text-left">{["Project","Client","Revenue","Commission","Payable","Due","Payment method"].map((heading) => <th key={heading} className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">{heading}</th>)}</tr></thead><tbody>{projects.map((project) => { const due = project.status?.toLowerCase() === "due" ? amount(project.price) : 0; return <tr key={project.id} className="border-t border-[#f0f2f4]"><td className="py-4 text-xs font-semibold text-[#26333d]">{project.name}</td><td className="py-4 text-xs text-[#89939f]">{project.clientName}</td><td className="py-4 text-xs font-semibold text-[#26333d]">{money(amount(project.price))}</td><td className="py-4 text-xs text-[#d58b35]">{money(amount(project.commissionAmount))}</td><td className="py-4 text-xs font-semibold text-[#2caf82]">{money(project.payableAmount ? amount(project.payableAmount) : amount(project.price) - amount(project.commissionAmount))}</td><td className="py-4 text-xs font-semibold text-[#d8665d]">{due ? money(due) : "-"}</td><td className="py-4 text-[10px] text-[#89939f]">{project.paymentMethod || "-"}</td></tr>; })}</tbody><tfoot><tr className="border-t-2 border-[#e6ebf1] bg-[#fafcff]"><td colSpan={2} className="py-4 text-xs font-bold text-[#18232f]">Total</td><td className="py-4 text-xs font-bold text-[#26333d]">{money(projects.reduce((sum, project) => sum + amount(project.price), 0))}</td><td className="py-4 text-xs font-bold text-[#d58b35]">{money(projects.reduce((sum, project) => sum + amount(project.commissionAmount), 0))}</td><td className="py-4 text-xs font-bold text-[#2caf82]">{money(totalPayable)}</td><td className="py-4 text-xs font-bold text-[#d8665d]">{totalDue ? money(totalDue) : "-"}</td><td /></tr></tfoot></table></div>
          </section>
        </div>
      </main>
    </div>
  );
}

function ReportCard({ label, value, tone }: { label: string; value: string; tone: string }) {
  return <div className="rounded-[10px] border border-[#e9edf2] bg-white p-3.5 max-md:px-[11px] max-md:py-[13px]"><span className={`mb-2 grid size-7 place-items-center rounded-lg text-[10px] font-bold ${tone === "green" ? "bg-[#e9f8f2] text-[#2caf82]" : tone === "orange" ? "bg-[#fff6e9] text-[#d58b35]" : tone === "purple" ? "bg-[#f1edff] text-[#8064d8]" : "bg-[#edf3ff] text-[#2e6ff2]"}`}>▦</span><span className="block truncate text-[10px] text-[#89939f]">{label}</span><strong className="mt-1 block truncate text-base font-bold tracking-[-.4px] text-[#18232f]">{value}</strong></div>;
}

type MonthlyReport = {
  month: string;
  income: number;
  commission: number;
  net: number;
  payable: number;
  due: number;
  count: number;
};

function MonthlyAccountsChart({ data, maxValue }: { data: MonthlyReport[]; maxValue: number }) {
  const lines = [
    ["Income", "income", "#4f85f3"],
    ["Commission", "commission", "#f3a354"],
    ["Net income", "net", "#43bd95"],
    ["Payable", "payable", "#8064d8"],
  ] as const;
  return (
    <section className="rounded-xl border border-[#e6ebf1] bg-white p-6 shadow-[0_12px_32px_rgba(30,55,80,0.04)] max-md:p-4">
      <div className="mb-5">
        <h2 className="font-sans text-base font-bold text-[#18232f]">Monthly accounts</h2>
        <p className="mt-1 text-xs text-[#96a0ac]">Income, commission, net income, payable and due</p>
      </div>
      <div className="mb-4 flex flex-wrap gap-3">
        {lines.map(([label, , color]) => <span key={label} className="flex items-center gap-1.5 text-[10px] text-[#89939f]"><i className="size-2 rounded-full" style={{ backgroundColor: color }} />{label}</span>)}
      </div>
      <div className="flex h-[230px] items-end gap-2 border-b border-l border-[#eef1f3] bg-[linear-gradient(to_bottom,transparent_0,transparent_49px,#f3f5f7_50px)] px-2 pt-3">
        {data.map((item) => (
          <div key={item.month} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <div className="flex h-full w-full items-end justify-center gap-0.5">
              {lines.map(([, key, color]) => <div key={key} className="w-1/5 max-w-[14px] rounded-t" style={{ height: `${Math.max((item[key] / maxValue) * 100, item[key] ? 3 : 0)}%`, backgroundColor: color }} />)}
            </div>
            <span className="text-[10px] text-[#89939f]">{item.month}</span>
            <span className="text-[9px] text-[#b0b8c0]">{item.due} due</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function MonthlyProjectsChart({ data, maxPrice }: { data: MonthlyReport[]; maxPrice: number }) {
  return (
    <section className="rounded-xl border border-[#e6ebf1] bg-white p-6 shadow-[0_12px_32px_rgba(30,55,80,0.04)] max-md:p-4">
      <div className="mb-5">
        <h2 className="font-sans text-base font-bold text-[#18232f]">Monthly projects</h2>
        <p className="mt-1 text-xs text-[#96a0ac]">Project count and total project price</p>
      </div>
      <div className="mb-4 flex gap-3 text-[10px] text-[#89939f]"><span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-[#2e6ff2]" />Projects</span><span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-[#a9c5ff]" />Price</span></div>
      <div className="flex h-[230px] items-end gap-3 border-b border-l border-[#eef1f3] bg-[linear-gradient(to_bottom,transparent_0,transparent_49px,#f3f5f7_50px)] px-3 pt-3">
        {data.map((item) => (
          <div key={item.month} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <div className="flex h-full w-full items-end justify-center gap-1">
              <div className="w-1/3 max-w-[24px] rounded-t bg-[#2e6ff2]" style={{ height: `${Math.max(item.count * 18, item.count ? 8 : 0)}%` }} />
              <div className="w-1/3 max-w-[24px] rounded-t bg-[#a9c5ff]" style={{ height: `${Math.max((item.income / maxPrice) * 100, item.income ? 8 : 0)}%` }} />
            </div>
            <span className="text-[10px] text-[#89939f]">{item.month}</span>
            <span className="text-[9px] text-[#b0b8c0]">{item.count} project{item.count === 1 ? "" : "s"}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
