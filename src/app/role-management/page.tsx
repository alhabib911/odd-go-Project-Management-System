"use client";

import { useEffect, useState } from "react";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import ProfileMenu from "@/components/profile-menu";

type Request = { id: string; name: string; email: string; status: "Pending" | "Approved" | "Rejected"; requestedAt: string; teamName?: string; role?: string; access?: string[] };
type Team = { id: string; name: string; logo: string };
const accessOptions = ["Overview", "Projects", "Tasks", "Team", "Reports"];
const defaultTeams: Team[] = [
  { id: "team-1", name: "Engineering", logo: "⚡" },
  { id: "team-2", name: "Design", logo: "🎨" },
  { id: "team-3", name: "Sales & Growth", logo: "🚀" },
  { id: "team-4", name: "Infra & Security", logo: "🛡️" },
];

export default function RoleManagementPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [teamName, setTeamName] = useState("");
  const [access, setAccess] = useState<string[]>(["Overview"]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setRequests(JSON.parse(window.localStorage.getItem("focura-role-requests") ?? "[]") as Request[]);
      const storedTeams = JSON.parse(window.localStorage.getItem("focura-teams") ?? "[]") as Team[];
      setTeams(storedTeams.length ? storedTeams : defaultTeams);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function updateRequest(id: string, status: Request["status"]) {
    const request = requests.find((item) => item.id === id);
    if (!request) return;
    const next = requests.map((item) => item.id === id ? { ...item, status, teamName: status === "Approved" ? teamName : item.teamName, role: status === "Approved" ? teamName : item.role, access: status === "Approved" ? access : item.access } : item);
    setRequests(next);
    window.localStorage.setItem("focura-role-requests", JSON.stringify(next));
    if (status === "Approved") {
      const members = JSON.parse(window.localStorage.getItem("focura-team") ?? "[]") as Array<Record<string, unknown>>;
      const nextMember = { id: request.id, name: request.name, email: request.email, phone: "", avatarUrl: "", role: teamName, teamName, status: "Active", skills: [], dashboardAccess: access };
      window.localStorage.setItem("focura-team", JSON.stringify([...members, nextMember]));
      setSelected(null);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafb]">
      <WorkspaceSidebar active="Role Management" />
      <main className="min-w-0 flex-1">
        <header className="flex h-[72px] items-center justify-between border-b border-[#e9edf2] bg-white px-[47px] max-md:px-5">
          <div className="flex items-center gap-3 text-[#a5adb7]"><span>Workspace</span><b>/</b><strong>Role Management</strong></div>
          <ProfileMenu />
        </header>
        <div className="mx-auto max-w-[1200px] px-[47px] pb-12 pt-10 max-md:px-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#2e6ff2]">SUPERADMIN</span>
          <h1 className="mt-2 text-3xl font-bold text-[#18232f]">Role Management</h1>
          <p className="mt-2 text-sm text-[#89939f]">Approve registered users and assign their team role and dashboard access.</p>
          <section className="mt-8 overflow-hidden rounded-xl border border-[#e6ebf1] bg-white p-6">
            <h2 className="text-base font-bold text-[#18232f]">Registration requests</h2>
            <div className="mt-5 space-y-3">
              {requests.length === 0 && <p className="rounded-lg bg-[#f8fafb] px-4 py-6 text-center text-xs text-[#89939f]">No registration requests yet.</p>}
              {requests.map((request) => <div key={request.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#eef1f3] p-4"><div><strong className="block text-sm text-[#26333d]">{request.name}</strong><span className="text-xs text-[#89939f]">{request.email}</span></div><div className="flex items-center gap-3"><span className="rounded-full bg-[#fff7e8] px-2.5 py-1 text-[10px] text-[#d58b35]">{request.status}</span>{request.status === "Pending" && <button type="button" onClick={() => { setSelected(request.id); setTeamName(teams[0]?.name ?? ""); }} className="rounded-lg bg-[#2e6ff2] px-3 py-2 text-[10px] font-semibold text-white">Review</button>}</div></div>)}
            </div>
          </section>
          {selected && <section className="mt-5 rounded-xl border border-[#e6ebf1] bg-white p-6"><h2 className="text-base font-bold text-[#18232f]">Assign access</h2><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="text-xs font-semibold text-[#687582]">Role / Team<select value={teamName} onChange={(event) => setTeamName(event.target.value)} className="mt-2 w-full rounded-lg border border-[#e1e6ec] px-3 py-2.5 text-sm font-normal">{teams.map((team) => <option key={team.id} value={team.name}>{team.name}</option>)}</select></label><div><span className="text-xs font-semibold text-[#687582]">Dashboard access</span><div className="mt-2 flex flex-wrap gap-2">{accessOptions.map((item) => <label key={item} className="flex items-center gap-1.5 text-xs text-[#687582]"><input type="checkbox" checked={access.includes(item)} onChange={() => setAccess((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])} />{item}</label>)}</div></div></div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setSelected(null)} className="rounded-lg border border-[#e1e6ec] px-4 py-2 text-xs text-[#687582]">Cancel</button><button type="button" onClick={() => updateRequest(selected, "Rejected")} className="rounded-lg bg-[#fff0ef] px-4 py-2 text-xs font-semibold text-[#d8665d]">Reject</button><button type="button" onClick={() => updateRequest(selected, "Approved")} disabled={!teamName || access.length === 0} className="rounded-lg bg-[#2e6ff2] px-4 py-2 text-xs font-semibold text-white disabled:opacity-40">Approve</button></div></section>}
        </div>
      </main>
    </div>
  );
}
