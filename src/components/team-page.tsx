"use client";

import { FormEvent, useEffect, useState } from "react";
import WorkspaceSidebar, { Icon } from "@/components/workspace-sidebar";
import ProfileMenu from "@/components/profile-menu";
import { loadWorkspaceData, saveWorkspaceData, type WorkspaceDataKey } from "@/lib/workspace-data";

export type MemberStatus = "Active" | "Inactive";

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
  role?: string;
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
type TeamMemberEditDraft = Pick<TeamMember, "role" | "teamName">;

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
    email: "jordan@dev-cluster.dev",
    phone: "+880 1711-000111",
    role: "Backend Developer",
    teamName: "Engineering",
    status: "Active",
    skills: ["Node JS", "Mongo DB", "REST API"],
  },
  {
    id: "2",
    name: "Ava Morgan",
    email: "ava@dev-cluster.dev",
    phone: "+880 1722-000222",
    role: "UI/UX Designer",
    teamName: "Design",
    status: "Active",
    skills: ["Figma", "UI Design", "User Research"],
  },
  {
    id: "3",
    name: "Riley Khan",
    email: "riley@dev-cluster.dev",
    phone: "+880 1733-000333",
    role: "Frontend Developer",
    teamName: "Engineering",
    status: "Active",
    skills: ["Next JS", "TypeScript", "Tailwind CSS"],
  },
  {
    id: "4",
    name: "Maya Chen",
    email: "maya@dev-cluster.dev",
    phone: "+880 1744-000444",
    role: "UI/UX Designer",
    teamName: "Design",
    status: "Active",
    skills: ["Figma", "Design Systems"],
  },
  {
    id: "5",
    name: "Mina Park",
    email: "mina@dev-cluster.dev",
    phone: "+880 1755-000555",
    role: "Database Engineer",
    teamName: "Infra & Security",
    status: "Active",
    skills: ["Mongo DB", "Supabase", "PostgreSQL"],
  },
  {
    id: "6",
    name: "Noah Wilson",
    email: "noah@dev-cluster.dev",
    phone: "+880 1766-000666",
    role: "Full Stack Developer",
    teamName: "Engineering",
    status: "Inactive",
    skills: ["React JS", "Node JS", "TypeScript"],
  },
  {
    id: "7",
    name: "Sam Lee",
    email: "sam@dev-cluster.dev",
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
const suggestedTeamRoles = [
  "Project Manager",
  "Product Manager",
  "Team Lead",
  "Developer",
  "Designer",
  "QA Engineer",
  "Business Analyst",
  "Sales Representative",
];

type StoredProfile = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  role?: string;
  teamName?: string;
  skills?: unknown;
  technology?: string;
};

type StoredRoleRequest = {
  email: string;
  role?: string;
  teamName?: string;
};

function readRegisteredUsersFromProfiles(): RegisteredUser[] {
  let roleRequests: StoredRoleRequest[] = [];
  try {
    roleRequests = JSON.parse(
      window.localStorage.getItem("dev-cluster-role-requests") ?? "[]",
    ) as StoredRoleRequest[];
  } catch {
    roleRequests = [];
  }

  const registeredUsers: RegisteredUser[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith("dev-cluster-profile:")) continue;

    try {
      const profile = JSON.parse(
        window.localStorage.getItem(key) ?? "null",
      ) as StoredProfile | null;
      if (!profile) continue;
      const name = profile?.name?.trim() ?? "";
      const email = profile?.email?.trim() ?? "";
      const phone = profile?.phone?.trim() ?? "";
      if (!name || !email.includes("@") || !phone) continue;

      const request = roleRequests.find(
        (item) => item.email.toLowerCase() === email.toLowerCase(),
      );
      const skills = Array.isArray(profile.skills)
        ? profile.skills.filter(
            (skill): skill is string =>
              typeof skill === "string" && Boolean(skill.trim()),
          )
        : (profile.technology ?? "")
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean);

      registeredUsers.push({
        id: profile.id ?? key,
        name,
        email,
        phone,
        avatarUrl: profile.avatarUrl,
        role:
          profile.role?.trim() ||
          request?.role?.trim() ||
          request?.teamName?.trim() ||
          profile.teamName?.trim() ||
          "Member",
        skills,
      });
    } catch {
      continue;
    }
  }
  return registeredUsers;
}

function updateSavedProfileRole(email: string, role: string) {
  const normalizedEmail = email.toLowerCase();
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith("dev-cluster-profile:")) continue;
    try {
      const profile = JSON.parse(
        window.localStorage.getItem(key) ?? "null",
      ) as StoredProfile | null;
      if (profile?.email?.toLowerCase() === normalizedEmail) {
        const updated = { ...profile, role };
        window.localStorage.setItem(key, JSON.stringify(updated));
        void saveWorkspaceData(key as WorkspaceDataKey, updated);
      }
    } catch {
      continue;
    }
  }
}

function updateSavedProfileTeamName(email: string, teamName: string) {
  const normalizedEmail = email.toLowerCase();
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith("dev-cluster-profile:")) continue;
    try {
      const profile = JSON.parse(
        window.localStorage.getItem(key) ?? "null",
      ) as StoredProfile | null;
      if (profile?.email?.toLowerCase() === normalizedEmail) {
        const updated = { ...profile, teamName };
        window.localStorage.setItem(
          key,
          JSON.stringify(updated),
        );
        void saveWorkspaceData(key as WorkspaceDataKey, updated);
      }
    } catch {
      continue;
    }
  }
}

export default function TeamPage() {
  const [teams, setTeams] = useState<TeamGroup[]>(initialTeams);
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [activeTeamFilter, setActiveTeamFilter] = useState<string>("All");
  const [hydrated, setHydrated] = useState(false);
  const [form, setForm] = useState<MemberForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Modals state
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [teamPage, setTeamPage] = useState(1);
  const [isTeamListOpen, setIsTeamListOpen] = useState(false);
  const [teamListError, setTeamListError] = useState("");
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [teamMemberDrafts, setTeamMemberDrafts] = useState<
    Record<string, TeamMemberEditDraft>
  >({});
  const [activityMember, setActivityMember] = useState<TeamMember | null>(null);
  const [activityLogs, setActivityLogs] = useState<
    Record<string, ActivityEvent[]>
  >({});

  // Form inputs
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamRole, setNewTeamRole] = useState("");
  const [roleOptionsOpen, setRoleOptionsOpen] = useState(false);
  const [activeRoleOption, setActiveRoleOption] = useState(-1);
  const [newTeamLogo, setNewTeamLogo] = useState("⚡");
  const [teamFormError, setTeamFormError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void Promise.all([
        loadWorkspaceData<TeamGroup[]>("dev-cluster-teams", initialTeams),
        loadWorkspaceData<TeamMember[]>("dev-cluster-team", initialMembers),
        loadWorkspaceData<Record<string, ActivityEvent[]> | null>("dev-cluster-team-activity", null),
        loadWorkspaceData<StoredRoleRequest[]>("dev-cluster-role-requests", []),
      ]).then(async ([savedTeams, savedMembers, savedActivity, roleRequests]) => {
        const emails = new Set([
          ...roleRequests.map((request) => request.email),
          ...savedMembers.map((member) => member.email),
        ]);
        await Promise.all(
          Array.from(emails, (email) =>
            loadWorkspaceData<StoredProfile | null>(`dev-cluster-profile:${email}`, null),
          ),
        );
        setRegisteredUsers(readRegisteredUsersFromProfiles());
        if (savedTeams.length) setTeams(savedTeams);
        setMembers(
          savedMembers.map((item) => ({
            ...item,
            phone: item.phone ?? "",
            teamName: item.teamName ?? "Engineering",
            status: item.status === "Active" ? "Active" : "Inactive",
            skills: Array.isArray(item.skills) ? item.skills : [],
          })),
        );
        if (savedActivity) setActivityLogs(savedActivity);
        else {
          setActivityLogs(
            Object.fromEntries(
              savedMembers.map((member) => [
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
      });
    }, 0);
    function refreshRegisteredUsers(event: StorageEvent) {
      if (
        event.key === null ||
        event.key.startsWith("dev-cluster-profile:") ||
        event.key === "dev-cluster-role-requests"
      ) {
        setRegisteredUsers(readRegisteredUsersFromProfiles());
      }
    }
    window.addEventListener("storage", refreshRegisteredUsers);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", refreshRegisteredUsers);
    };
  }, []);

  useEffect(() => {
    if (hydrated) {
      void saveWorkspaceData("dev-cluster-teams", teams);
    }
  }, [hydrated, teams]);

  useEffect(() => {
    if (hydrated) {
      void saveWorkspaceData("dev-cluster-team", members);
    }
  }, [hydrated, members]);

  useEffect(() => {
    if (hydrated) {
      void saveWorkspaceData("dev-cluster-team-activity", activityLogs);
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
    const duplicate = teams.some(
      (team) =>
        team.id !== editingTeamId &&
        team.name.toLowerCase() === name.toLowerCase(),
    );
    if (duplicate) {
      setTeamFormError("A team with this name already exists.");
      return;
    }

    if (editingTeamId) {
      const existingTeam = teams.find((team) => team.id === editingTeamId);
      if (!existingTeam) return;
      const nextMembers = members.map((member) => {
        const draft = teamMemberDrafts[member.id];
        if (!draft) return member;
        const role = draft.role.trim() || member.role;
        const teamName =
          draft.teamName === existingTeam.name ? name : draft.teamName;
        if (role !== member.role) updateSavedProfileRole(member.email, role);
        return { ...member, role, teamName };
      });
      setTeams((current) =>
        current.map((team) =>
          team.id === editingTeamId
            ? { ...team, name, role: newTeamRole.trim(), logo: newTeamLogo || "⚡" }
            : team,
        ),
      );
      setMembers(nextMembers);
      setRegisteredUsers(readRegisteredUsersFromProfiles());
      setEditingTeamId(null);
      setTeamMemberDrafts({});
      setNewTeamName("");
      setNewTeamRole("");
      setRoleOptionsOpen(false);
      setNewTeamLogo("⚡");
      setTeamFormError("");
      setIsTeamModalOpen(false);
      return;
    }

    const newTeam: TeamGroup = {
      id: crypto.randomUUID(),
      name,
      role: newTeamRole.trim(),
      logo: newTeamLogo || "⚡",
    };
    setTeams((current) => [...current, newTeam]);
    setNewTeamName("");
    setNewTeamRole("");
    setRoleOptionsOpen(false);
    setNewTeamLogo("⚡");
    setTeamFormError("");
    setIsTeamModalOpen(false);
  }

  function openTeamEditor(team: TeamGroup) {
    setIsTeamListOpen(false);
    setEditingTeamId(team.id);
    setNewTeamName(team.name);
    setNewTeamRole(team.role ?? "");
    setRoleOptionsOpen(false);
    setNewTeamLogo(team.logo);
    setTeamMemberDrafts(
      Object.fromEntries(
        members
          .filter((member) => member.teamName === team.name)
          .map((member) => [
            member.id,
            { role: member.role, teamName: member.teamName },
          ]),
      ),
    );
    setTeamFormError("");
    setIsTeamModalOpen(true);
  }

  function openTeamList() {
    setTeamListError("");
    setIsTeamListOpen(true);
  }

  function deleteTeam(team: TeamGroup) {
    if (teams.length <= 1) {
      setTeamListError("At least one team must remain in the workspace.");
      return;
    }

    const fallbackTeam = teams.find((item) => item.id !== team.id);
    if (!fallbackTeam) return;
    const affectedMembers = members.filter(
      (member) => member.teamName === team.name,
    );
    const reassignmentMessage = affectedMembers.length
      ? ` ${affectedMembers.length} member(s) will be moved to ${fallbackTeam.name}.`
      : "";
    if (
      !window.confirm(
        `Delete ${team.name}?${reassignmentMessage}`,
      )
    )
      return;

    affectedMembers.forEach((member) =>
      updateSavedProfileTeamName(member.email, fallbackTeam.name),
    );
    setTeams((current) => current.filter((item) => item.id !== team.id));
    setMembers((current) =>
      current.map((member) => {
        if (member.teamName !== team.name) return member;
        return { ...member, teamName: fallbackTeam.name };
      }),
    );
    if (activeTeamFilter === team.name) setActiveTeamFilter("All");
    setTeamPage(1);
    setTeamListError("");
  }

  function openTeamCreator() {
    setEditingTeamId(null);
    setTeamMemberDrafts({});
    setNewTeamName("");
    setNewTeamRole("");
    setRoleOptionsOpen(false);
    setNewTeamLogo("⚡");
    setTeamFormError("");
    setIsTeamModalOpen(true);
  }

  function updateTeamMemberDraft(
    memberId: string,
    field: keyof TeamMemberEditDraft,
    value: string,
  ) {
    setTeamMemberDrafts((current) => ({
      ...current,
      [memberId]: {
        ...(current[memberId] ?? { role: "", teamName: "" }),
        [field]: value,
      },
    }));
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

  function openNewMember(teamName?: string) {
    const selectedTeam = teams.find((team) => team.name === teamName);
    setEditingId(null);
    setForm({
      ...emptyForm(),
      teamName: teamName ?? teams[0]?.name ?? "Engineering",
      role: selectedTeam?.role || emptyForm().role,
    });
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
  const teamPageCount = Math.ceil(visibleTeams.length / 5);
  const currentTeamPage = Math.min(teamPage, Math.max(teamPageCount, 1));
  const paginatedTeams = visibleTeams.slice((currentTeamPage - 1) * 5, currentTeamPage * 5);
  const filteredSuggestedRoles = suggestedTeamRoles.filter((role) =>
    role.toLowerCase().includes(newTeamRole.trim().toLowerCase()),
  );
  const editingTeam = teams.find((team) => team.id === editingTeamId);
  const editingTeamMembers = editingTeam
    ? members.filter((member) => member.teamName === editingTeam.name)
    : [];

  return (
    <div className="flex min-h-screen bg-[#f8fafb]">
      <WorkspaceSidebar active="Team" />
      <main className="min-w-0 flex-1">
        <header className="flex h-[72px] items-center justify-between border-b border-[#e9edf2] bg-white px-[47px] max-lg:px-7 max-md:h-[62px] max-md:px-[18px]">
          <div className="hidden items-center gap-[9px] font-sans text-lg font-bold max-md:flex">
            <span className="grid size-[27px] place-items-center rounded-lg bg-[#2e6ff2] text-white">
              <Icon name="spark" size={16} />
            </span>
            Dev Cluster
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
              <button
                onClick={openTeamCreator}
                className="inline-flex shrink-0 items-center gap-2 rounded-[7px] border border-[#2e6ff2] bg-white px-4 py-[11px] text-[13px] font-semibold text-[#2e6ff2] hover:bg-[#edf3ff]"
              >
                <span className="text-base leading-none">+</span>Add New Team
              </button>
              <button
                type="button"
                onClick={openTeamList}
                className="inline-flex shrink-0 items-center gap-2 rounded-[7px] border border-[#e1e6ec] bg-white px-4 py-[11px] text-[13px] font-semibold text-[#687582] hover:bg-[#f3f5f7]"
              >
                Team List
              </button>
              <button
                onClick={() => openNewMember()}
                className="inline-flex shrink-0 items-center gap-2 rounded-[7px] bg-[#2e6ff2] px-4 py-[11px] text-[13px] font-semibold text-white shadow-[0_5px_12px_rgba(46,111,242,0.15)] hover:bg-[#1f5edd]"
              >
                <span className="text-base leading-none">+</span>Add New Member
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
              <table className="w-full min-w-[980px] table-fixed">
                <colgroup>
                  <col style={{ width: "1%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "1%" }} />
                  <col style={{ width: "25%" }} />
                  <col style={{ width: "1%" }} />
                  <col style={{ width: "25%" }} />
                  <col style={{ width: "1%" }} />
                  <col style={{ width: "15%" }} />
                  <col style={{ width: "1%" }} />
                  <col style={{ width: "10%" }} />
                </colgroup>
                <thead>
                  <tr className="text-left">
                    <th aria-hidden="true" className="p-0" />
                    <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">
                      Team Name
                    </th>
                    <th aria-hidden="true" className="p-0" />
                    <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">
                      Role
                    </th>
                    <th aria-hidden="true" className="p-0" />
                    <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">
                      Team member
                    </th>
                    <th aria-hidden="true" className="p-0" />
                    <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">
                      Action
                    </th>
                    <th aria-hidden="true" className="p-0" />
                    <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">
                      Activity log
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTeams.map((team) => {
                    const roles = Array.from(
                      new Set([
                        ...(team.role ? [team.role] : []),
                        ...team.members.map((member) => member.role),
                      ]),
                    );
                    const firstMember = team.members[0];
                    return (
                      <tr className="border-t border-[#f0f2f4]" key={team.id}>
                        <td aria-hidden="true" className="p-0" />
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
                        <td aria-hidden="true" className="p-0" />
                        <td className="py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {roles.map((role) => (
                              <span key={role} className="rounded-full bg-[#edf3ff] px-2 py-1 text-[10px] font-semibold text-[#2e6ff2]">
                                {role}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td aria-hidden="true" className="p-0" />
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
                        <td aria-hidden="true" className="p-0" />
                        <td>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openTeamEditor(team)}
                              className="rounded-md bg-[#edf3ff] px-2 py-1 text-[10px] font-semibold text-[#2e6ff2]"
                            >
                              Edit team
                            </button>
                            <button
                              type="button"
                              onClick={() => openNewMember(team.name)}
                              className="rounded-md bg-[#f3f5f7] px-2 py-1 text-[10px] font-semibold text-[#687582]"
                            >
                              Add member
                            </button>
                          </div>
                        </td>
                        <td aria-hidden="true" className="p-0" />
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

      {isTeamListOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#18232f]/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="team-list-title"
        >
          <section className="flex max-h-[85vh] w-full max-w-[620px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-[#e6ebf1] px-6 py-5">
              <div>
                <h2
                  id="team-list-title"
                  className="font-sans text-xl font-bold text-[#18232f]"
                >
                  Team List
                </h2>
                <p className="mt-1 text-xs text-[#96a0ac]">
                  Edit or remove workspace teams.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsTeamListOpen(false);
                  setTeamListError("");
                }}
                className="grid size-8 place-items-center rounded-lg bg-[#f3f5f7] text-lg text-[#687582]"
                aria-label="Close team list"
              >
                ×
              </button>
            </header>
            {teamListError && (
              <p role="alert" className="px-6 pt-4 text-xs text-[#d8665d]">
                {teamListError}
              </p>
            )}
            <div className="space-y-2 overflow-y-auto p-4">
              {teams.map((team) => {
                const memberCount = members.filter(
                  (member) => member.teamName === team.name,
                ).length;
                return (
                  <div
                    key={team.id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-[#e6ebf1] bg-white p-4"
                  >
                    <div className="min-w-0">
                      <strong className="block truncate text-sm text-[#26333d]">
                        {team.logo} {team.name}
                      </strong>
                      <span className="mt-1 block text-[10px] text-[#89939f]">
                        {team.role || "No role"} · {memberCount} {memberCount === 1 ? "member" : "members"}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openTeamEditor(team)}
                        className="rounded-md bg-[#edf3ff] px-3 py-2 text-[10px] font-semibold text-[#2e6ff2]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTeam(team)}
                        disabled={teams.length <= 1}
                        title={teams.length <= 1 ? "At least one team must remain" : undefined}
                        className="rounded-md bg-[#fff0ef] px-3 py-2 text-[10px] font-semibold text-[#d8665d] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* Add New Team Modal */}
      {isTeamModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#18232f]/45 p-4"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleAddTeam}
            className="w-full max-w-[760px] max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e6ebf1] bg-white px-6 py-5">
              <div>
                <h2 className="font-sans text-xl font-bold text-[#18232f]">
                  {editingTeamId ? "Edit team" : "Add New Team"}
                </h2>
                <p className="mt-1 text-xs text-[#96a0ac]">
                  {editingTeamId
                    ? "Update team details, member roles, or assignments."
                    : "Create a new team group and choose a logo."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsTeamModalOpen(false);
                  setEditingTeamId(null);
                  setTeamMemberDrafts({});
                  setNewTeamRole("");
                  setRoleOptionsOpen(false);
                  setTeamFormError("");
                }}
                className="grid size-8 place-items-center rounded-lg bg-[#f3f5f7] text-lg text-[#687582]"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="grid gap-4 p-6 bg-[#f8fafb]">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#7e8995]">
                  Team Name
                  <input
                    required
                    className="mt-1 w-full rounded-md border border-[#e4e9ef] bg-white px-2.5 py-2 text-xs text-[#26333d] outline-none focus:border-[#2e6ff2]"
                    value={newTeamName}
                    onChange={(event) => setNewTeamName(event.target.value)}
                    placeholder="e.g. Frontend Guild"
                  />
                </label>
                <label className="relative text-[10px] font-semibold uppercase tracking-[0.05em] text-[#7e8995]">
                  Role
                  <input
                    required
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={roleOptionsOpen}
                    aria-controls="team-role-options"
                    aria-activedescendant={
                      activeRoleOption >= 0
                        ? `team-role-option-${activeRoleOption}`
                        : undefined
                    }
                    autoComplete="off"
                    value={newTeamRole}
                    onFocus={() => setRoleOptionsOpen(true)}
                    onBlur={() => {
                      window.setTimeout(() => setRoleOptionsOpen(false), 120);
                    }}
                    onChange={(event) => {
                      setNewTeamRole(event.target.value);
                      setActiveRoleOption(-1);
                      setRoleOptionsOpen(true);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowDown" && filteredSuggestedRoles.length) {
                        event.preventDefault();
                        setRoleOptionsOpen(true);
                        setActiveRoleOption((current) =>
                          Math.min(current + 1, filteredSuggestedRoles.length - 1),
                        );
                      } else if (event.key === "ArrowUp" && filteredSuggestedRoles.length) {
                        event.preventDefault();
                        setActiveRoleOption((current) => Math.max(current - 1, 0));
                      } else if (
                        event.key === "Enter" &&
                        roleOptionsOpen &&
                        activeRoleOption >= 0
                      ) {
                        event.preventDefault();
                        setNewTeamRole(filteredSuggestedRoles[activeRoleOption]);
                        setRoleOptionsOpen(false);
                        setActiveRoleOption(-1);
                      } else if (event.key === "Escape") {
                        setRoleOptionsOpen(false);
                        setActiveRoleOption(-1);
                      }
                    }}
                    placeholder="Choose or type a role"
                    className="mt-1 w-full rounded-md border border-[#e4e9ef] bg-white px-2.5 py-2 text-xs font-normal normal-case text-[#26333d] outline-none focus:border-[#2e6ff2]"
                  />
                  {roleOptionsOpen && filteredSuggestedRoles.length > 0 && (
                    <ul
                      id="team-role-options"
                      role="listbox"
                      className="absolute left-0 right-0 top-full z-30 mt-1 max-h-52 w-full overflow-y-auto rounded-md border border-[#e1e6ec] bg-white p-1 shadow-lg"
                    >
                      {filteredSuggestedRoles.map((role, index) => (
                        <li
                          id={`team-role-option-${index}`}
                          key={role}
                          role="option"
                          aria-selected={activeRoleOption === index}
                        >
                          <button
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onMouseEnter={() => setActiveRoleOption(index)}
                            onClick={() => {
                              setNewTeamRole(role);
                              setRoleOptionsOpen(false);
                              setActiveRoleOption(-1);
                            }}
                            className={`block w-full rounded px-3 py-2 text-left text-xs font-normal normal-case transition ${
                              activeRoleOption === index
                                ? "bg-[#edf3ff] text-[#2e6ff2]"
                                : "bg-white text-[#26333d] hover:bg-[#f3f6f9]"
                            }`}
                          >
                            {role}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </label>
              </div>
              {teamFormError && (
                <p role="alert" className="text-xs text-[#d8665d]">
                  {teamFormError}
                </p>
              )}

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
              {editingTeamId && (
                <div className="border-t border-[#e6ebf1] pt-4">
                  <h3 className="text-xs font-bold text-[#26333d]">
                    Team members
                  </h3>
                  <p className="mt-1 text-[10px] text-[#89939f]">
                    Update each member&apos;s role or assigned team.
                  </p>
                  <div className="mt-3 max-h-56 space-y-2 overflow-y-auto">
                    {editingTeamMembers.map((member) => {
                      const draft = teamMemberDrafts[member.id] ?? {
                        role: member.role,
                        teamName: member.teamName,
                      };
                      return (
                        <div
                          key={member.id}
                          className="grid gap-2 rounded-lg border border-[#e6ebf1] bg-white p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] sm:items-end"
                        >
                          <strong className="truncate text-xs text-[#26333d]">
                            {member.name}
                          </strong>
                          <label className="text-[9px] font-semibold uppercase text-[#89939f]">
                            Role
                            <input
                              value={draft.role}
                              onChange={(event) =>
                                updateTeamMemberDraft(
                                  member.id,
                                  "role",
                                  event.target.value,
                                )
                              }
                              aria-label={`Role for ${member.name}`}
                              className="mt-1 w-full rounded-md border border-[#e1e6ec] px-2 py-1.5 text-xs font-normal normal-case text-[#26333d] outline-none focus:border-[#2e6ff2]"
                            />
                          </label>
                          <label className="text-[9px] font-semibold uppercase text-[#89939f]">
                            Assigned team
                            <select
                              value={draft.teamName}
                              onChange={(event) =>
                                updateTeamMemberDraft(
                                  member.id,
                                  "teamName",
                                  event.target.value,
                                )
                              }
                              aria-label={`Team for ${member.name}`}
                              className="mt-1 w-full rounded-md border border-[#e1e6ec] bg-white px-2 py-1.5 text-xs font-normal normal-case text-[#26333d] outline-none focus:border-[#2e6ff2]"
                            >
                              {teams.map((team) => (
                                <option key={team.id} value={team.name}>
                                  {team.logo} {team.id === editingTeamId && newTeamName.trim()
                                    ? newTeamName.trim()
                                    : team.name}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-[#e6ebf1] bg-white px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setIsTeamModalOpen(false);
                  setEditingTeamId(null);
                  setTeamMemberDrafts({});
                  setNewTeamRole("");
                  setRoleOptionsOpen(false);
                  setTeamFormError("");
                }}
                className="rounded-lg border border-[#e1e6ec] bg-white px-4 py-2.5 text-xs font-semibold text-[#687582]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#2e6ff2] px-5 py-2.5 text-xs font-semibold text-white"
              >
                {editingTeamId ? "Save changes" : "Create team"}
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
          registeredUsers={registeredUsers}
          editing={Boolean(editingId)}
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
  registeredUsers,
  editing,
  updateField,
  onSelectRegisteredUser,
  onSubmit,
  onClose,
}: {
  form: MemberForm;
  teams: TeamGroup[];
  registeredUsers: RegisteredUser[];
  editing: boolean;
  updateField: (field: keyof MemberForm, value: unknown) => void;
  onSelectRegisteredUser: (userId: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}) {
  const inputClass =
    "mt-1 w-full rounded-md border border-[#e4e9ef] bg-white px-2.5 py-2 text-xs text-[#26333d] outline-none transition focus:border-[#2e6ff2] focus:ring-2 focus:ring-[#edf3ff]";
  const labelClass =
    "text-[10px] font-semibold uppercase tracking-[0.05em] text-[#7e8995]";

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
              {editing ? "Edit team member" : "Add Team Member"}
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
                    {registeredUsers.length
                      ? "-- Select User by Email or Phone --"
                      : "No profiles with complete contact information"}
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
                <option value="Inactive">Inactive</option>
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
                placeholder="e.g. jordan@dev-cluster.dev"
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
                readOnly
                className={inputClass}
                value={form.role}
                placeholder="Set your role in My Profile"
              />
            </label>
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
