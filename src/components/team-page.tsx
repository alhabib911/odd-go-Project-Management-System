"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import WorkspaceSidebar, { Icon } from "@/components/workspace-sidebar";
import ProfileMenu from "@/components/profile-menu";

export type MemberStatus = "Active" | "In a meeting" | "On leave" | "Offline";

export type ActivityEvent = {
  id: string;
  action: string;
  detail: string;
  profile: string;
  timestamp: string;
};

export type TeamGroup = {
  id: string;
  name: string;
  logo: string;
};

export type RegisteredUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  role: string;
  skills: string[];
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  role: string;
  teamName: string;
  status: MemberStatus;
  skills: string[];
};

export type MemberForm = Omit<TeamMember, "id">;

const registeredUsers: RegisteredUser[] = [
  {
    id: "reg-1",
    name: "Jordan Davis",
    email: "jordan@focura.dev",
    phone: "+880 1711-000111",
    role: "Backend Developer",
    skills: ["Node JS", "Mongo DB", "REST API", "Express"],
  },
  {
    id: "reg-2",
    name: "Ava Morgan",
    email: "ava@focura.dev",
    phone: "+880 1722-000222",
    role: "UI/UX Designer",
    skills: ["Figma", "UI Design", "User Research", "Prototyping"],
  },
  {
    id: "reg-3",
    name: "Riley Khan",
    email: "riley@focura.dev",
    phone: "+880 1733-000333",
    role: "Frontend Developer",
    skills: ["Next JS", "TypeScript", "Tailwind CSS", "React JS"],
  },
  {
    id: "reg-4",
    name: "Maya Chen",
    email: "maya@focura.dev",
    phone: "+880 1744-000444",
    role: "UI/UX Designer",
    skills: ["Figma", "Design Systems", "Wireframing"],
  },
  {
    id: "reg-5",
    name: "Mina Park",
    email: "mina@focura.dev",
    phone: "+880 1755-000555",
    role: "Database Engineer",
    skills: ["Mongo DB", "Supabase", "PostgreSQL", "Redis"],
  },
  {
    id: "reg-6",
    name: "Noah Wilson",
    email: "noah@focura.dev",
    phone: "+880 1766-000666",
    role: "Full Stack Developer",
    skills: ["React JS", "Node JS", "TypeScript", "GraphQL"],
  },
  {
    id: "reg-7",
    name: "Sam Lee",
    email: "sam@focura.dev",
    phone: "+880 1777-000777",
    role: "Sales Representative",
    skills: ["Client Relations", "Negotiation", "CRM", "Lead Gen"],
  },
  {
    id: "reg-8",
    name: "Alex Rivera",
    email: "alex@focura.dev",
    phone: "+880 1788-000888",
    role: "Frontend Developer",
    skills: ["React JS", "Vue JS", "CSS3", "Redux"],
  },
  {
    id: "reg-9",
    name: "Sara Connor",
    email: "sara@focura.dev",
    phone: "+880 1799-000999",
    role: "Backend Developer",
    skills: ["Python", "Django", "PostgreSQL", "Docker"],
  },
];

const initialTeams: TeamGroup[] = [
  { id: "team-1", name: "Engineering", logo: "⚡" },
  { id: "team-2", name: "Design", logo: "🎨" },
  { id: "team-3", name: "Sales & Growth", logo: "🚀" },
  { id: "team-4", name: "Infra & Security", logo: "🛡️" },
];

const initialMembers: TeamMember[] = [
  {
    id: "1",
    name: "Jordan Davis",
    email: "jordan@focura.dev",
    phone: "+880 1711-000111",
    role: "Backend Developer",
    teamName: "Engineering",
    status: "Active",
    skills: ["Node JS", "Mongo DB", "REST API"],
  },
  {
    id: "2",
    name: "Ava Morgan",
    email: "ava@focura.dev",
    phone: "+880 1722-000222",
    role: "UI/UX Designer",
    teamName: "Design",
    status: "Active",
    skills: ["Figma", "UI Design", "User Research"],
  },
  {
    id: "3",
    name: "Riley Khan",
    email: "riley@focura.dev",
    phone: "+880 1733-000333",
    role: "Frontend Developer",
    teamName: "Engineering",
    status: "Active",
    skills: ["Next JS", "TypeScript", "Tailwind CSS"],
  },
  {
    id: "4",
    name: "Maya Chen",
    email: "maya@focura.dev",
    phone: "+880 1744-000444",
    role: "UI/UX Designer",
    teamName: "Design",
    status: "In a meeting",
    skills: ["Figma", "Design Systems"],
  },
  {
    id: "5",
    name: "Mina Park",
    email: "mina@focura.dev",
    phone: "+880 1755-000555",
    role: "Database Engineer",
    teamName: "Infra & Security",
    status: "Active",
    skills: ["Mongo DB", "Supabase", "PostgreSQL"],
  },
  {
    id: "6",
    name: "Noah Wilson",
    email: "noah@focura.dev",
    phone: "+880 1766-000666",
    role: "Full Stack Developer",
    teamName: "Engineering",
    status: "On leave",
    skills: ["React JS", "Node JS", "TypeScript"],
  },
  {
    id: "7",
    name: "Sam Lee",
    email: "sam@focura.dev",
    phone: "+880 1777-000777",
    role: "Sales Representative",
    teamName: "Sales & Growth",
    status: "Active",
    skills: ["Client Relations", "Negotiation"],
  },
];

const emptyForm = (): MemberForm => ({
  name: "",
  email: "",
  phone: "",
  avatarUrl: "",
  role: "Frontend Developer",
  teamName: "Engineering",
  status: "Active",
  skills: [],
});

const defaultLogoOptions = ["⚡", "🎨", "🚀", "🛡️", "💻", "📊", "🔮", "💡", "🌐"];

export default function TeamPage() {
  const [teams, setTeams] = useState<TeamGroup[]>(initialTeams);
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [activeTeamFilter, setActiveTeamFilter] = useState<string>("All");
  const [hydrated, setHydrated] = useState(false);
  const [form, setForm] = useState<MemberForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Modals state
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [teamPage, setTeamPage] = useState(1);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [activityMember, setActivityMember] = useState<TeamMember | null>(null);
  const [activityLogs, setActivityLogs] = useState<
    Record<string, ActivityEvent[]>
  >({});

  // Form inputs
  const [skillInput, setSkillInput] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamLogo, setNewTeamLogo] = useState("⚡");

  useEffect(() => {
    const savedTeams = window.localStorage.getItem("focura-teams");
    const savedMembers = window.localStorage.getItem("focura-team");
    const savedActivity = window.localStorage.getItem("focura-team-activity");

    const timer = window.setTimeout(() => {
      if (savedTeams) {
        try {
          const parsed = JSON.parse(savedTeams) as TeamGroup[];
          if (Array.isArray(parsed) && parsed.length) setTeams(parsed);
        } catch {
          // fallback
        }
      }
      if (savedMembers) {
        try {
          const parsed = JSON.parse(savedMembers) as TeamMember[];
          if (Array.isArray(parsed)) {
            setMembers(
              parsed.map((item) => ({
                ...item,
                phone: item.phone ?? "",
                teamName: item.teamName ?? "Engineering",
                skills: Array.isArray(item.skills) ? item.skills : [],
              })),
            );
          }
        } catch {
          // fallback
        }
      }
      if (savedActivity) {
        try {
          setActivityLogs(
            JSON.parse(savedActivity) as Record<string, ActivityEvent[]>,
          );
        } catch {
          // fallback
        }
      } else {
        const storedMembers = savedMembers
          ? (JSON.parse(savedMembers) as TeamMember[])
          : initialMembers;
        setActivityLogs(
          Object.fromEntries(
            storedMembers.map((member) => [
              member.id,
              [
                {
                  id: `created-${member.id}`,
                  action: "Member added",
                  detail: `${member.name} joined team ${member.teamName ?? "Engineering"} as ${member.role}`,
                  profile: "Jordan Davis (Admin)",
                  timestamp: new Date().toISOString(),
                },
              ],
            ]),
          ),
        );
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem("focura-teams", JSON.stringify(teams));
    }
  }, [hydrated, teams]);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem("focura-team", JSON.stringify(members));
    }
  }, [hydrated, members]);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(
        "focura-team-activity",
        JSON.stringify(activityLogs),
      );
    }
  }, [activityLogs, hydrated]);

  function logActivity(memberId: string, action: string, detail: string) {
    const event: ActivityEvent = {
      id: crypto.randomUUID(),
      action,
      detail,
      profile: "Jordan Davis (Admin)",
      timestamp: new Date().toISOString(),
    };
    setActivityLogs((current) => ({
      ...current,
      [memberId]: [event, ...(current[memberId] ?? [])],
    }));
  }

  function handleAddTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newTeamName.trim();
    if (!name) return;
    const newTeam: TeamGroup = {
      id: crypto.randomUUID(),
      name,
      logo: newTeamLogo || "⚡",
    };
    setTeams((current) => [...current, newTeam]);
    setNewTeamName("");
    setNewTeamLogo("⚡");
    setIsTeamModalOpen(false);
  }

  function handleSelectRegisteredUser(userId: string) {
    const selected = registeredUsers.find((u) => u.id === userId);
    if (!selected) return;
    setForm((current) => ({
      ...current,
      name: selected.name,
      email: selected.email,
      phone: selected.phone,
      avatarUrl: selected.avatarUrl ?? "",
      role: selected.role,
      skills: selected.skills,
    }));
  }

  function updateField(field: keyof MemberForm, value: unknown) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function addSkill() {
    const val = skillInput.trim();
    if (!val || (form.skills ?? []).includes(val)) return;
    setForm((current) => ({
      ...current,
      skills: [...(current.skills ?? []), val],
    }));
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setForm((current) => ({
      ...current,
      skills: (current.skills ?? []).filter((s) => s !== skill),
    }));
  }

  function openNewMember(teamName?: string) {
    setEditingId(null);
    setForm({
      ...emptyForm(),
      teamName: teamName ?? teams[0]?.name ?? "Engineering",
    });
    setSkillInput("");
    setIsMemberModalOpen(true);
  }

  function submitMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const member = {
      ...form,
      skills: form.skills ?? [],
      id: editingId ?? crypto.randomUUID(),
    };
    logActivity(
      member.id,
      editingId ? "Member updated" : "Member added",
      editingId
        ? `Updated profile for ${member.name}`
        : `Added ${member.name} to team ${member.teamName} as ${member.role}`,
    );
    setMembers((current) =>
      editingId
        ? current.map((item) => (item.id === editingId ? member : item))
        : [member, ...current],
    );
    setIsMemberModalOpen(false);
  }

  const visibleMembers =
    activeTeamFilter === "All"
      ? members
      : members.filter((m) => m.teamName === activeTeamFilter);
  const visibleTeams = teams
    .map((team) => ({
      ...team,
      members: visibleMembers.filter((member) => member.teamName === team.name),
    }))
    .filter((team) => team.members.length > 0);
  const teamPageCount = Math.ceil(visibleTeams.length / 8);
  const currentTeamPage = Math.min(teamPage, Math.max(teamPageCount, 1));
  const paginatedTeams = visibleTeams.slice((currentTeamPage - 1) * 8, currentTeamPage * 8);

  return (
    <div className="flex min-h-screen bg-[#f8fafb]">
      <WorkspaceSidebar active="Team" />
      <main className="min-w-0 flex-1">
        <header className="flex h-[72px] items-center justify-between border-b border-[#e9edf2] bg-white px-[47px] max-lg:px-7 max-md:h-[62px] max-md:px-[18px]">
          <div className="hidden items-center gap-[9px] font-sans text-lg font-bold max-md:flex">
            <span className="grid size-[27px] place-items-center rounded-lg bg-[#2e6ff2] text-white">
              <Icon name="spark" size={16} />
            </span>
            focura
          </div>
          <div className="flex items-center gap-[9px] text-[#a5adb7] max-md:hidden">
            <span>Workspace</span>
            <b>/</b>
            <strong>Team</strong>
          </div>
          <div className="flex items-center gap-[17px]">
            <button
              className="grid place-items-center bg-transparent text-[#89939f]"
              aria-label="Search"
            >
              <Icon name="search" />
            </button>
            <button
              className="grid place-items-center bg-transparent text-[#89939f]"
              aria-label="Notifications"
            >
              <Icon name="bell" />
            </button>
            <ProfileMenu />
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] px-[47px] pb-[50px] pt-[42px] max-lg:px-7 max-md:px-4 max-md:pb-[35px] max-md:pt-7">
          <div className="mb-8 flex items-end justify-between gap-4 max-sm:items-start max-sm:flex-col">
            <div>
              <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9ba5b0]">
                WORKSPACE MODULE
              </span>
              <h1 className="font-sans text-3xl font-bold tracking-[-1px] text-[#18232f]">
                Team
              </h1>
              <p className="mt-2 text-sm text-[#89939f]">
                Plan, manage, and collaborate with your project team members.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/team/commissions"
                className="inline-flex shrink-0 items-center gap-2 rounded-[7px] border border-[#2caf82] bg-white px-4 py-[11px] text-[13px] font-semibold text-[#238d68] no-underline hover:bg-[#e9f8f2]"
              >
                <span className="text-base leading-none">৳</span>See team member commission
              </Link>
              <button
                onClick={() => setIsTeamModalOpen(true)}
                className="inline-flex shrink-0 items-center gap-2 rounded-[7px] border border-[#2e6ff2] bg-white px-4 py-[11px] text-[13px] font-semibold text-[#2e6ff2] hover:bg-[#edf3ff]"
              >
                <span className="text-base leading-none">+</span>Add new team
              </button>
              <button
                onClick={() => openNewMember()}
                className="inline-flex shrink-0 items-center gap-2 rounded-[7px] bg-[#2e6ff2] px-4 py-[11px] text-[13px] font-semibold text-white shadow-[0_5px_12px_rgba(46,111,242,0.15)] hover:bg-[#1f5edd]"
              >
                <span className="text-base leading-none">+</span>Add new member
              </button>
            </div>
          </div>

          <section className="overflow-hidden rounded-xl border border-[#e6ebf1] bg-white p-6 shadow-[0_12px_32px_rgba(30,55,80,0.04)] max-md:p-4">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-sans text-base font-bold text-[#18232f]">
                  All team members
                </h2>
                <p className="mt-1 text-xs text-[#96a0ac]">
                  Your team&apos;s active members across groups
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 rounded-lg bg-[#f3f5f7] p-1">
                <button
                  type="button"
                  onClick={() => setActiveTeamFilter("All")}
                  className={
                    activeTeamFilter === "All"
                      ? "rounded-md bg-white px-3 py-1.5 text-[10px] font-bold text-[#2e6ff2] shadow-sm"
                      : "rounded-md bg-transparent px-3 py-1.5 text-[10px] font-medium text-[#89939f] hover:bg-white/60"
                  }
                >
                  All Teams ({members.length})
                </button>
                {teams.map((t) => {
                  const count = members.filter(
                    (m) => m.teamName === t.name,
                  ).length;
                  return (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setActiveTeamFilter(t.name)}
                      className={
                        activeTeamFilter === t.name
                          ? "flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-[10px] font-bold text-[#2e6ff2] shadow-sm"
                          : "flex items-center gap-1.5 rounded-md bg-transparent px-3 py-1.5 text-[10px] font-medium text-[#89939f] hover:bg-white/60"
                      }
                    >
                      <span>{t.logo}</span>
                      <span>{t.name}</span>
                      <span className="rounded-full bg-[#edf3ff] px-1.5 text-[9px] text-[#2e6ff2]">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead>
                  <tr className="text-left">
                    <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">
                      Team Name
                    </th>
                    <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">
                      Role
                    </th>
                    <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">
                      Technology / Skills
                    </th>
                    <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">
                      Team member
                    </th>
                    <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">
                      Action
                    </th>
                    <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">
                      Activity log
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTeams.map((team) => {
                    const roles = Array.from(
                      new Set(team.members.map((member) => member.role)),
                    );
                    const skills = Array.from(
                      new Set(team.members.flatMap((member) => member.skills ?? [])),
                    );
                    const firstMember = team.members[0];
                    return (
                      <tr className="border-t border-[#f0f2f4]" key={team.id}>
                        <td className="py-4">
                          <div className="flex items-center gap-2.5">
                            <div>
                              <strong className="block text-xs font-semibold text-[#26333d]">
                                {team.logo} {team.name}
                              </strong>
                              <span className="block text-[10px] text-[#89939f]">
                                {team.members.length} {team.members.length === 1 ? "member" : "members"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex max-w-[210px] flex-wrap gap-1.5">
                            {roles.map((role) => (
                              <span key={role} className="rounded-full bg-[#edf3ff] px-2 py-1 text-[10px] font-semibold text-[#2e6ff2]">
                                {role}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="max-w-[250px] py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {skills.length > 0 ? skills.map((skill) => (
                              <span key={skill} className="rounded-full bg-[#f4f6f8] px-2 py-1 text-[10px] text-[#687582]">
                                {skill}
                              </span>
                            )) : <span className="text-[10px] text-[#a2abb5]">-</span>}
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center">
                            {team.members.map((member, index) => {
                              const initials = member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase();
                              return member.avatarUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  key={member.id}
                                  src={member.avatarUrl}
                                  alt={member.name}
                                  title={member.name}
                                  className={`size-8 rounded-full border-2 border-white object-cover ${index > 0 ? "-ml-2" : ""}`}
                                />
                              ) : (
                                <span
                                  key={member.id}
                                  title={member.name}
                                  className={`grid size-8 place-items-center rounded-full border-2 border-white bg-[#edf3ff] text-[9px] font-bold text-[#2e6ff2] ${index > 0 ? "-ml-2" : ""}`}
                                >
                                  {initials}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openNewMember(team.name)}
                              className="rounded-md bg-[#f3f5f7] px-2 py-1 text-[10px] font-semibold text-[#687582]"
                            >
                              Add member
                            </button>
                          </div>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => setActivityMember(firstMember)}
                            className="rounded-md bg-[#f3f5f7] px-2 py-1 text-[10px] font-semibold text-[#687582] hover:bg-[#e9edf2]"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {teamPageCount > 1 && (
              <TeamPagination
                page={currentTeamPage}
                pageCount={teamPageCount}
                onChange={setTeamPage}
              />
            )}
          </section>
        </div>
      </main>

      {/* Add New Team Modal */}
      {isTeamModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#18232f]/45 p-4"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleAddTeam}
            className="w-full max-w-[480px] overflow-hidden rounded-xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#e6ebf1] bg-white px-6 py-5">
              <div>
                <h2 className="font-sans text-xl font-bold text-[#18232f]">
                  Add new team
                </h2>
                <p className="mt-1 text-xs text-[#96a0ac]">
                  Create a new team group and choose a logo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTeamModalOpen(false)}
                className="grid size-8 place-items-center rounded-lg bg-[#f3f5f7] text-lg text-[#687582]"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="grid gap-4 p-6 bg-[#f8fafb]">
              <label className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#7e8995]">
                Team Name
                <input
                  required
                  className="mt-1 w-full rounded-md border border-[#e4e9ef] bg-white px-2.5 py-2 text-xs text-[#26333d] outline-none focus:border-[#2e6ff2]"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. Frontend Guild"
                />
              </label>

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#7e8995]">
                  Select Team Logo / Icon
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {defaultLogoOptions.map((logo) => (
                    <button
                      key={logo}
                      type="button"
                      onClick={() => setNewTeamLogo(logo)}
                      className={`grid size-10 place-items-center rounded-lg border text-lg transition ${
                        newTeamLogo === logo
                          ? "border-[#2e6ff2] bg-[#edf3ff] shadow-sm"
                          : "border-[#e4e9ef] bg-white hover:border-[#2e6ff2]"
                      }`}
                    >
                      {logo}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#e6ebf1] bg-white px-6 py-4">
              <button
                type="button"
                onClick={() => setIsTeamModalOpen(false)}
                className="rounded-lg border border-[#e1e6ec] bg-white px-4 py-2.5 text-xs font-semibold text-[#687582]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#2e6ff2] px-5 py-2.5 text-xs font-semibold text-white"
              >
                Create team
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add / Edit Member Modal */}
      {isMemberModalOpen && (
        <MemberModal
          form={form}
          teams={teams}
          editing={Boolean(editingId)}
          skillInput={skillInput}
          setSkillInput={setSkillInput}
          addSkill={addSkill}
          removeSkill={removeSkill}
          updateField={updateField}
          onSelectRegisteredUser={handleSelectRegisteredUser}
          onSubmit={submitMember}
          onClose={() => setIsMemberModalOpen(false)}
        />
      )}

      {activityMember && (
        <ActivityModal
          member={activityMember}
          events={activityLogs[activityMember.id] ?? []}
          onClose={() => setActivityMember(null)}
        />
      )}
    </div>
  );
}

function TeamPagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="mt-4 flex items-center justify-end gap-2">
      <button type="button" disabled={page === 1} onClick={() => onChange(page - 1)} className="rounded-md border border-[#e4e9ef] px-3 py-1.5 text-[10px] text-[#687582] disabled:opacity-40">Previous</button>
      <span className="text-[10px] text-[#89939f]">Page {page} of {pageCount}</span>
      <button type="button" disabled={page === pageCount} onClick={() => onChange(page + 1)} className="rounded-md border border-[#e4e9ef] px-3 py-1.5 text-[10px] text-[#687582] disabled:opacity-40">Next</button>
    </div>
  );
}

function MemberModal({
  form,
  teams,
  editing,
  skillInput,
  setSkillInput,
  addSkill,
  removeSkill,
  updateField,
  onSelectRegisteredUser,
  onSubmit,
  onClose,
}: {
  form: MemberForm;
  teams: TeamGroup[];
  editing: boolean;
  skillInput: string;
  setSkillInput: (val: string) => void;
  addSkill: () => void;
  removeSkill: (val: string) => void;
  updateField: (field: keyof MemberForm, value: unknown) => void;
  onSelectRegisteredUser: (userId: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}) {
  const inputClass =
    "mt-1 w-full rounded-md border border-[#e4e9ef] bg-white px-2.5 py-2 text-xs text-[#26333d] outline-none transition focus:border-[#2e6ff2] focus:ring-2 focus:ring-[#edf3ff]";
  const labelClass =
    "text-[10px] font-semibold uppercase tracking-[0.05em] text-[#7e8995]";

  const skillsList = form.skills ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#18232f]/45 p-4"
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={onSubmit}
        className="w-full max-w-[620px] max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#e6ebf1] bg-white px-6 py-5 sticky top-0 z-10">
          <div>
            <h2 className="font-sans text-xl font-bold text-[#18232f]">
              {editing ? "Edit team member" : "Add team member"}
            </h2>
            <p className="mt-1 text-xs text-[#96a0ac]">
              Select registered user or enter details & assign to a team.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg bg-[#f3f5f7] text-lg text-[#687582]"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="grid gap-4 p-6 bg-[#f8fafb]">
          {!editing && (
            <div className="rounded-xl border border-[#2e6ff2]/20 bg-[#edf3ff]/50 p-4">
              <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#2e6ff2]">
                Select Registered User (Auto-fill Name, Email, Phone, Skills & Role)
                <select
                  className="mt-1.5 w-full rounded-md border border-[#2e6ff2]/30 bg-white px-3 py-2 text-xs font-semibold text-[#18232f] outline-none focus:border-[#2e6ff2]"
                  onChange={(e) => {
                    if (e.target.value) {
                      onSelectRegisteredUser(e.target.value);
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    -- Select User by Email or Phone --
                  </option>
                  {registeredUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email} · {u.phone})
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <label className={labelClass}>
              Assign Team (Select Team Dropdown)
              <select
                className={`${inputClass} font-semibold text-[#2e6ff2]`}
                value={form.teamName}
                onChange={(e) => updateField("teamName", e.target.value)}
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.logo} {t.name}
                  </option>
                ))}
              </select>
            </label>

            <label className={labelClass}>
              Status
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) =>
                  updateField("status", e.target.value as MemberStatus)
                }
              >
                <option value="Active">Active</option>
                <option value="In a meeting">In a meeting</option>
                <option value="On leave">On leave</option>
                <option value="Offline">Offline</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <label className={labelClass}>
              Full Name
              <input
                required
                className={inputClass}
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. Jordan Davis"
              />
            </label>
            <label className={labelClass}>
              Email Address
              <input
                required
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="e.g. jordan@focura.dev"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <label className={labelClass}>
              Phone Number
              <input
                className={inputClass}
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="e.g. +880 1711-000111"
              />
            </label>
            <label className={labelClass}>
              Role / Position (from user profile)
              <input
                required
                className={inputClass}
                value={form.role}
                onChange={(e) => updateField("role", e.target.value)}
                placeholder="e.g. Frontend Developer"
              />
            </label>
          </div>

          <div>
            <label className={labelClass}>Technology / Skills (from user profile)</label>
            <div className="mt-1 flex gap-2">
              <input
                className={inputClass.replace("mt-1 ", "")}
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Type technology/skill and press Add"
              />
              <button
                type="button"
                onClick={addSkill}
                className="rounded-lg bg-[#edf3ff] px-3 text-xs font-semibold text-[#2e6ff2]"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {skillsList.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full bg-[#f4f6f8] px-2.5 py-1 text-[10px] text-[#687582]"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-[#e6ebf1] bg-white px-6 py-4 sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#e1e6ec] bg-white px-4 py-2.5 text-xs font-semibold text-[#687582]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-[#2e6ff2] px-5 py-2.5 text-xs font-semibold text-white"
          >
            {editing ? "Save changes" : "Add to team"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ActivityModal({
  member,
  events,
  onClose,
}: {
  member: TeamMember;
  events: ActivityEvent[];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#18232f]/45 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-[560px] overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e6ebf1] px-6 py-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#2e6ff2]">
              Activity log
            </span>
            <h2 className="mt-1 font-sans text-xl font-bold text-[#18232f]">
              {member.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg bg-[#f3f5f7] text-lg text-[#687582]"
            aria-label="Close activity log"
          >
            ×
          </button>
        </div>
        <div className="grid max-h-[60vh] gap-3 overflow-y-auto p-6">
          {events.length ? (
            events.map((event) => (
              <div
                key={event.id}
                className="rounded-lg border border-[#e6ebf1] bg-[#f8fafb] p-3.5"
              >
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-[#26333d]">
                    {event.action}
                  </strong>
                  <span className="text-[9px] text-[#89939f]">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-[#687582] whitespace-pre-line">
                  {event.detail}
                </p>
                <span className="mt-2 block text-[9px] text-[#a2abb5]">
                  By {event.profile}
                </span>
              </div>
            ))
          ) : (
            <p className="py-8 text-center text-xs text-[#89939f]">
              No activity logged for this member yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
