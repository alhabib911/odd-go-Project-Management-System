"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import WorkspaceSidebar, { Icon } from "@/components/workspace-sidebar";
import ProfileMenu from "@/components/profile-menu";
import { loadWorkspaceData } from "@/lib/workspace-data";

type Member = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  teamName: string;
  status: string;
  avatarUrl?: string;
};

type Project = {
  id?: string;
  invoiceNumber?: string;
  name: string;
  contactPerson?: string;
  salesCommission?: string;
  secondSalesPerson?: string;
  secondSalesCommission?: string;
  price?: string;
  createdAt?: string;
  status?: string;
  payableAmount?: string;
  deliveryDate?: string;
};

type CommissionRow = Member & {
  products: number;
  totalCommission: number;
  sales: number;
};

const initialMembers: Member[] = [
  { id: "1", name: "Jordan Davis", email: "jordan@dev-cluster.dev", phone: "", role: "Backend Developer", teamName: "Engineering", status: "Active" },
  { id: "2", name: "Ava Morgan", email: "ava@dev-cluster.dev", phone: "", role: "UI/UX Designer", teamName: "Design", status: "Active" },
  { id: "3", name: "Riley Khan", email: "riley@dev-cluster.dev", phone: "", role: "Frontend Developer", teamName: "Engineering", status: "Active" },
];

function money(value: number) {
  return `USD ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function memberCommission(project: Project, memberName: string) {
  const primary =
    project.contactPerson === memberName
      ? Number(project.salesCommission) || 0
      : 0;
  const secondary =
    project.secondSalesPerson === memberName
      ? Number(project.secondSalesCommission) || 0
      : 0;
  return primary + secondary;
}

export default function TeamCommissionsPage() {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<{ project: string; status: string; due?: string }[]>([]);
  const [selectedMember, setSelectedMember] = useState<CommissionRow | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void Promise.all([
        loadWorkspaceData<Member[]>("dev-cluster-team", initialMembers),
        loadWorkspaceData<Project[]>("dev-cluster-projects", []),
        loadWorkspaceData<{ project: string; status: string; due?: string }[]>("dev-cluster-tasks", []),
      ]).then(([storedMembers, storedProjects, storedTasks]) => {
        setMembers(storedMembers);
        setProjects(storedProjects);
        setTasks(storedTasks);
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const rows = useMemo<CommissionRow[]>(
    () =>
      members.map((member) => {
        const memberProjects = projects.filter(
          (project) =>
            project.contactPerson === member.name ||
            project.secondSalesPerson === member.name,
        );
        const completedProjects = memberProjects.filter(
          (project) => project.status?.toLowerCase() === "done",
        );
        const commission = completedProjects.reduce((total, project) => {
          return total + memberCommission(project, member.name);
        }, 0);
        return {
          ...member,
          products: memberProjects.length,
          totalCommission: commission,
          sales: completedProjects.reduce(
            (total, project) => total + (Number(project.price) || 0),
            0,
          ),
        };
      }),
    [members, projects],
  );
  const totalCommission = rows.reduce((sum, row) => sum + row.totalCommission, 0);
  const memberProjects = selectedMember
    ? projects.filter(
        (project) =>
          project.contactPerson === selectedMember.name ||
          project.secondSalesPerson === selectedMember.name,
      )
    : [];

  return (
    <div className="flex min-h-screen bg-[#f8fafb]">
      <WorkspaceSidebar active="Team" />
      <main className="min-w-0 flex-1">
        <header className="flex h-[72px] items-center justify-between border-b border-[#e9edf2] bg-white px-[47px] max-lg:px-7 max-md:h-[62px] max-md:px-[18px]">
          <div className="hidden items-center gap-[9px] font-sans text-lg font-bold max-md:flex">
            <span className="grid size-[27px] place-items-center rounded-lg bg-[#2e6ff2] text-white"><Icon name="spark" size={16} /></span>
            Dev Cluster
          </div>
          <div className="flex items-center gap-3 text-[#a5adb7] max-md:hidden"><span>Workspace</span><b>/</b><strong>Team member commission</strong></div>
          <div className="flex items-center gap-[17px]"><ProfileMenu /></div>
        </header>
        <div className="mx-auto max-w-[1440px] px-[47px] pb-[50px] pt-[42px] max-lg:px-7 max-md:px-4 max-md:pt-7">
          <div className="mb-8 flex items-end justify-between gap-4 max-sm:items-start max-sm:flex-col">
            <div>
              <Link href="/team" className="text-xs font-semibold text-[#2e6ff2] no-underline">← Back to Team</Link>
              <span className="mb-3 mt-6 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9ba5b0]">TEAM REPORT</span>
              <h1 className="font-sans text-3xl font-bold tracking-[-1px] text-[#18232f]">Team member commission</h1>
              <p className="mt-2 text-sm text-[#89939f]">Product sales and commission totals for every team member.</p>
            </div>
            <div className="rounded-xl border border-[#e9edf2] bg-white px-5 py-3 text-right"><span className="block text-[10px] text-[#89939f]">Total commission</span><strong className="text-xl text-[#2caf82]">{money(totalCommission)}</strong></div>
          </div>
          <section className="overflow-hidden rounded-xl border border-[#e6ebf1] bg-white p-6 shadow-[0_12px_32px_rgba(30,55,80,0.04)] max-md:p-4">
            <div className="mb-6"><h2 className="font-sans text-base font-bold text-[#18232f]">All team members</h2><p className="mt-1 text-xs text-[#96a0ac]">Sales commission earned from assigned products</p></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[900px]"><thead><tr className="text-left">{["Team member","Team","Role","Products sold","Product sales","Total commission","Status"].map((heading) => <th key={heading} className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">{heading}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-t border-[#f0f2f4]"><td className="py-4"><div className="flex items-center gap-2.5">{row.avatarUrl ? <img src={row.avatarUrl} alt={row.name} className="size-8 rounded-full object-cover" /> : <span className="grid size-8 place-items-center rounded-full bg-[#edf3ff] text-[9px] font-bold text-[#2e6ff2]">{row.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>}<div><button type="button" onClick={() => setSelectedMember(row)} className="block text-left text-xs font-semibold text-[#2e6ff2] hover:underline">{row.name}</button><span className="text-[10px] text-[#89939f]">{row.email}</span></div></div></td><td className="py-4 text-xs text-[#89939f]">{row.teamName}</td><td className="py-4 text-xs text-[#89939f]">{row.role}</td><td className="py-4 text-xs font-semibold text-[#26333d]">{row.products}</td><td className="py-4 text-xs text-[#26333d]">{money(row.sales)}</td><td className="py-4 text-xs font-bold text-[#2caf82]">{money(row.totalCommission)}</td><td className="py-4"><span className="rounded-full bg-[#e9f8f2] px-2 py-1 text-[10px] text-[#2caf82]">{row.status}</span></td></tr>)}</tbody><tfoot><tr className="border-t-2 border-[#e6ebf1] bg-[#fafcff]"><td colSpan={5} className="py-4 text-xs font-bold text-[#18232f]">Total commission</td><td className="py-4 text-xs font-bold text-[#2caf82]">{money(totalCommission)}</td><td /></tr></tfoot></table></div>
          </section>
        </div>
      </main>
      {selectedMember && (
        <MemberProjectsModal
          member={selectedMember}
          projects={memberProjects}
          tasks={tasks}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
}

function MemberProjectsModal({
  member,
  projects,
  tasks,
  onClose,
}: {
  member: CommissionRow;
  projects: Project[];
  tasks: { project: string; status: string; due?: string }[];
  onClose: () => void;
}) {
  const doneProjects = projects.filter((project) => {
    const projectTasks = tasks.filter((task) => task.project === project.name);
    return project.status?.toLowerCase() === "done" ||
      (projectTasks.length > 0 && projectTasks.every((task) => task.status === "Done"));
  });
  const accountsTotal = doneProjects.reduce(
    (sum, project) =>
      sum + (Number(project.payableAmount) || Number(project.price) || 0),
    0,
  );
  const dueCommission = projects
    .filter((project) => !doneProjects.includes(project))
    .reduce((sum, project) => sum + memberCommission(project, member.name), 0);
  const totalCommission = projects.reduce(
    (sum, project) => sum + memberCommission(project, member.name),
    0,
  );
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18232f]/45 p-4" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-[980px] overflow-y-auto rounded-xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e6ebf1] bg-white px-6 py-5">
          <div><h2 className="text-xl font-bold text-[#18232f]">{member.name}&apos;s projects</h2><p className="mt-1 text-xs text-[#96a0ac]">Assigned project, delivery and payment details</p></div>
          <button type="button" onClick={onClose} className="grid size-8 place-items-center rounded-lg bg-[#f3f5f7] text-lg text-[#687582]" aria-label="Close">×</button>
        </div>
        <div className="grid gap-4 bg-[#f8fafb] p-6">
          <div className="overflow-x-auto rounded-xl border border-[#e6ebf1] bg-white p-4">
            <table className="w-full min-w-[800px]">
              <thead><tr className="text-left">{["Project","Amount","Project date","Assign date","Delivery status","Due date"].map((heading) => <th key={heading} className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">{heading}</th>)}</tr></thead>
              <tbody>{projects.length ? projects.map((project) => {
                const projectTasks = tasks.filter((task) => task.project === project.name);
                const done = project.status?.toLowerCase() === "done" || (projectTasks.length > 0 && projectTasks.every((task) => task.status === "Done"));
                const deliveryStatus = project.status ?? (done ? "Done" : projectTasks.some((task) => task.status === "In progress") ? "In progress" : "Assigned");
                const commission = memberCommission(project, member.name);
                return <tr key={project.id ?? project.name} className="border-t border-[#f0f2f4]"><td className="py-4 text-xs font-semibold text-[#26333d]">{project.name}<span className="mt-1 block text-[10px] text-[#89939f]">{project.invoiceNumber || "No invoice number"}</span><span className="mt-1 block text-[10px] text-[#89939f]">Commission: {money(commission)}</span></td><td className="py-4 text-xs font-semibold text-[#26333d]">{money(Number(project.price) || 0)}</td><td className="py-4 text-[10px] text-[#89939f]">{formatDate(project.createdAt)}</td><td className="py-4 text-[10px] text-[#89939f]">{formatDate(project.createdAt)}</td><td className="py-4"><span className={`rounded-full px-2 py-1 text-[10px] ${done ? "bg-[#e9f8f2] text-[#2caf82]" : "bg-[#fff6e9] text-[#d58b35]"}`}>{deliveryStatus}</span></td><td className="py-4 text-[10px] text-[#89939f]">{formatDate(project.deliveryDate)}</td></tr>;
              }) : <tr><td colSpan={6} className="py-8 text-center text-xs text-[#89939f]">No assigned projects found.</td></tr>}</tbody>
            </table>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-[#bdebd8] bg-[#e9f8f2] p-5"><span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#238d68]">Accounts</span><div className="mt-2"><strong className="block text-2xl font-bold text-[#18232f]">{money(accountsTotal)}</strong><span className="text-xs text-[#687582]">Total project Amount</span></div></div>
            <div className="rounded-xl border border-[#f3d6a8] bg-[#fff6e9] p-5"><span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#b67522]">Accounts</span><div className="mt-2"><strong className="block text-2xl font-bold text-[#18232f]">{money(dueCommission)}</strong><span className="text-xs text-[#687582]">Due Commission</span></div></div>
            <div className="rounded-xl border border-[#cdd9fb] bg-[#edf3ff] p-5"><span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#2e6ff2]">Commission</span><div className="mt-2"><strong className="block text-2xl font-bold text-[#18232f]">{money(totalCommission)}</strong><span className="text-xs text-[#687582]">Total Commission</span></div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
