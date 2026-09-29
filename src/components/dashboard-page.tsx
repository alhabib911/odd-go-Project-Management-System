"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProfileMenu from "@/components/profile-menu";

type IconName =
  | "grid"
  | "folder"
  | "check"
  | "users"
  | "chart"
  | "settings"
  | "search"
  | "bell"
  | "plus"
  | "arrow"
  | "more"
  | "spark";

const navigation: { label: string; icon: IconName }[] = [
  { label: "Role Management", icon: "settings" },
  { label: "Projects", icon: "folder" },
  { label: "Tasks", icon: "check" },
  { label: "Team", icon: "users" },
  { label: "Reports", icon: "chart" },
];
const superadminEmail = "abdullahalhabib100@gmail.com";

// Keep mock data local until the Supabase data layer is connected.
const initialProjects = [
  {
    name: "Website redesign",
    client: "Acme Corporation",
    due: "Sep 14, 2026",
    progress: 82,
    status: "On track",
    tone: "green",
    initials: "AC",
  },
  {
    name: "Mobile app launch",
    client: "Northstar Labs",
    due: "Sep 20, 2026",
    progress: 64,
    status: "On track",
    tone: "green",
    initials: "NL",
  },
  {
    name: "Brand identity",
    client: "Lumina Studio",
    due: "Sep 08, 2026",
    progress: 38,
    status: "At risk",
    tone: "orange",
    initials: "LS",
  },
  {
    name: "Q4 content calendar",
    client: "Internal project",
    due: "Sep 30, 2026",
    progress: 21,
    status: "Planning",
    tone: "blue",
    initials: "IP",
  },
];

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  // One small icon renderer keeps navigation and dashboard controls visually consistent.
  const paths: Record<IconName, React.ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    folder: (
      <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H10l2 2h6.5A2.5 2.5 0 0 1 21 8.5v8A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z" />
    ),
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
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.8 1.8-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2.55v-.1a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.8-1.8.06-.06A1.7 1.7 0 0 0 8.1 15a1.7 1.7 0 0 0-1.56-1.03h-.1v-2.55h.1A1.7 1.7 0 0 0 8.1 10a1.7 1.7 0 0 0-.34-1.88L7.7 8.06l1.8-1.8.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.03-1.56V5h2.55v.1a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.8 1.8-.06.06A1.7 1.7 0 0 0 19.4 10a1.7 1.7 0 0 0 1.56 1.03h.1v2.55h-.1A1.7 1.7 0 0 0 19.4 15z" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    bell: <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 22h4" />,
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
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
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export default function DashboardPage() {
  // This local state makes the sidebar feel navigable before server-side routing is connected.
  const [active, setActive] = useState("Projects");
  const [projects, setProjects] = useState(initialProjects);
  const [tasks, setTasks] = useState<
    { title: string; project: string; due: string; status: string }[]
  >([]);
  const [teamCount, setTeamCount] = useState(0);
  const [allowedNavigation, setAllowedNavigation] = useState<typeof navigation | null>(null);

  useEffect(() => {
    const accessTimer = window.setTimeout(() => {
      const currentUser = JSON.parse(
        window.localStorage.getItem("focura-current-user") ?? "null",
      ) as { email?: string } | null;
      const email = currentUser?.email?.toLowerCase();
      if (!email || email === superadminEmail || email === "jordan@focura.dev") {
        setAllowedNavigation(navigation);
      } else {
        const requests = JSON.parse(
          window.localStorage.getItem("focura-role-requests") ?? "[]",
        ) as Array<{ email: string; status: string; access?: string[] }>;
        const approved = requests.find(
          (request) => request.email.toLowerCase() === email && request.status === "Approved",
        );
        const access = new Set(approved?.access ?? []);
        setAllowedNavigation(navigation.filter((item) => access.has(item.label)));
      }
    }, 0);
    const timer = window.setTimeout(() => {
      const savedProjects = window.localStorage.getItem("focura-projects");
      const savedTasks = window.localStorage.getItem("focura-tasks");
      const savedMembers = window.localStorage.getItem("focura-team");

      if (savedProjects) {
        const storedProjects = JSON.parse(savedProjects) as {
          name: string;
          clientName: string;
        }[];
        const storedTasks = savedTasks
          ? (JSON.parse(savedTasks) as { project: string; status: string }[])
          : [];
        setProjects(
          storedProjects.map((project) => {
            const projectTasks = storedTasks.filter(
              (task) => task.project === project.name,
            );
            const completed = projectTasks.filter(
              (task) => task.status === "Done",
            ).length;
            const progress = projectTasks.length
              ? Math.round((completed / projectTasks.length) * 100)
              : 0;
            return {
              name: project.name,
              client: project.clientName,
              due: "No due date",
              progress,
              status: progress === 100 ? "Complete" : "In progress",
              tone: progress === 100 ? "green" : "blue",
              initials: project.name.slice(0, 2).toUpperCase(),
            };
          }),
        );
      }
      if (savedTasks) {
        setTasks(
          JSON.parse(savedTasks) as {
            title: string;
            project: string;
            due: string;
            status: string;
          }[],
        );
      }
      if (savedMembers) {
        setTeamCount((JSON.parse(savedMembers) as unknown[]).length);
      }
    }, 0);
    return () => {
      window.clearTimeout(accessTimer);
      window.clearTimeout(timer);
    };
  }, []);

  const completedTasks = tasks.filter((task) => task.status === "Done").length;

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-[252px] shrink-0 flex-col border-r border-[#e9edf2] bg-white px-[14px] pb-[18px] pt-[25px] max-lg:w-[215px] max-md:w-[62px] max-md:px-2 max-md:py-[22px]">
        <div className="flex items-center gap-[9px] px-[14px] font-sans text-[21px] font-bold tracking-[-0.7px]">
          <span className="grid size-[27px] place-items-center rounded-lg bg-[#2e6ff2] text-white">
            <Icon name="spark" size={17} />
          </span>
          <span>focura</span>
        </div>
        <nav className="mt-8">
          {allowedNavigation?.map((item) => (
            <Link
              key={item.label}
              href={item.label === "Role Management" ? "/role-management" : item.label === "Projects" ? "/projects" : `/${item.label.toLowerCase()}`}
              className={active === item.label ? "flex w-full items-center gap-[13px] rounded-lg bg-[#edf3ff] px-[13px] py-[11px] text-left font-semibold text-[#2e6ff2] max-md:justify-center max-md:px-0 max-md:py-3" : "flex w-full items-center gap-[13px] rounded-lg bg-transparent px-[13px] py-[11px] text-left text-[#8b96a3] hover:bg-[#f5f7f9] hover:text-[#18232f] max-md:justify-center max-md:px-0 max-md:py-3"}
              onClick={() => setActive(item.label)}
            >
              <Icon name={item.icon} />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1">
        <header className="flex h-[72px] items-center justify-between border-b border-[#e9edf2] bg-white px-[47px] max-lg:px-7 max-md:h-[62px] max-md:px-[18px]">
          <div className="hidden items-center gap-[9px] font-sans text-lg font-bold max-md:flex">
            <span className="grid size-[27px] place-items-center rounded-lg bg-[#2e6ff2] text-white">
              <Icon name="spark" size={16} />
            </span>
            focura
          </div>
          <div className="flex items-center gap-3 text-[#a5adb7] max-md:hidden">
            <span>Workspace</span>
            <b>/</b>
            <strong>{active}</strong>
          </div>
          <div className="flex items-center gap-[17px]">
            <button className="relative grid place-items-center bg-transparent text-[#89939f]">
              <Icon name="search" />
            </button>
            <button className="relative grid place-items-center bg-transparent text-[#89939f]">
              <Icon name="bell" />
              <i />
            </button>
            <ProfileMenu />
          </div>
        </header>
        <div className="mx-auto max-w-[1440px] px-[47px] pb-[50px] pt-[42px] max-lg:px-7 max-md:px-4 max-md:pb-[35px] max-md:pt-7">
          <section className="mb-[31px] grid grid-cols-4 gap-[14px] max-md:grid-cols-2 max-md:gap-2.5">
            <Stat
              label="Active projects"
              value={String(projects.length)}
              change="Live"
              caption="from workspace"
              icon="folder"
              tone="blue"
            />
            <Stat
              label="Tasks completed"
              value={String(completedTasks)}
              change="Live"
              caption="completed tasks"
              icon="check"
              tone="green"
            />
            <Stat
              label="Team members"
              value={String(teamCount)}
              change="Live"
              caption="active members"
              icon="users"
              tone="orange"
            />
            <Stat
              label="Hours tracked"
              value="248.5"
              change="+8.2%"
              caption="vs. last month"
              icon="chart"
              tone="purple"
            />
          </section>
          <div className="mb-4 grid grid-cols-[minmax(0,1.62fr)_minmax(290px,.88fr)] gap-4 max-lg:grid-cols-1">
            <section className="rounded-xl border border-[#e6ebf1] bg-white p-6 shadow-[0_12px_32px_rgba(30,55,80,0.04)] transition-shadow hover:shadow-[0_16px_36px_rgba(30,55,80,0.07)] max-md:p-4">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="font-sans text-base font-bold tracking-[-0.3px] text-[#18232f]">Recent projects</h2>
                  <p className="mt-1 text-xs text-[#96a0ac]">Your most recently updated projects</p>
                </div>
                <Link href="/projects" className="flex items-center gap-1.5 bg-transparent text-xs font-semibold text-[#2e6ff2] no-underline">
                  View all <Icon name="arrow" size={15} />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr className="text-left">
                      <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">Project</th>
                      <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">Due date</th>
                      <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">Progress</th>
                      <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">Status</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project, index) => (
                      <tr className="group border-t border-[#f0f2f4] transition-colors hover:bg-[#fafcff]" key={`${project.name}-${project.client}-${index}`}>
                        <td className="py-4">
                          <div className="flex items-center gap-2.5">
                            <span className={`grid size-[29px] place-items-center rounded-lg text-[9px] font-bold ${project.tone}`}>
                              {project.initials}
                            </span>
                            <div>
                              <strong className="block text-xs font-semibold text-[#26333d]">{project.name}</strong>
                              <span className="mt-1 block text-[10px] text-[#a2abb5]">{project.client}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-xs text-[#89939f]">{project.due}</td>
                        <td>
                          <div className="mb-[5px] flex justify-between text-[10px] text-[#7e8995]">
                            <span>{project.progress}%</span>
                            <span>of 100%</span>
                          </div>
                          <div className="h-[5px] w-[105px] overflow-hidden rounded-lg bg-[#eef1f4]">
                            <i
                              className={`block h-full rounded-full ${project.tone === "green" ? "bg-[#43bd95]" : project.tone === "orange" ? "bg-[#f3a354]" : "bg-[#5f8df1]"}`}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </td>
                        <td>
                          <span className={`inline-block rounded-full px-2 py-1 text-[10px] ${project.tone}`}>
                            {project.status}
                          </span>
                        </td>
                        <td>
                          <button className="bg-transparent text-[#89939f]">
                            <Icon name="more" size={17} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <section className="rounded-xl border border-[#e6ebf1] bg-white p-6 shadow-[0_12px_32px_rgba(30,55,80,0.04)] max-md:p-4">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h2 className="font-sans text-base font-bold tracking-[-0.3px] text-[#18232f]">Weekly activity</h2>
                  <p className="mt-1 text-xs text-[#96a0ac]">Hours tracked this week</p>
                </div>
                <button className="rounded-md border border-[#e9edf2] bg-white px-[9px] py-[7px] text-[10px] text-[#77828e]">
                  This week <span>?</span>
                </button>
              </div>
              <div className="flex items-end gap-2">
                <strong className="font-sans text-3xl font-bold tracking-[-1px] text-[#18232f]">32.5h</strong>
                <span className="rounded-full bg-[#e9f8f2] px-1.5 py-1 text-[10px] font-semibold text-[#2caf82]">+14.5%</span>
              </div>
              <div className="flex h-[170px] gap-2.5 pt-[19px]">
                <div className="flex flex-col justify-between pb-5 text-[9px] text-[#b0b8c0]">
                  <span>10h</span>
                  <span>5h</span>
                  <span>0h</span>
                </div>
                <div className="flex flex-1 items-stretch justify-around gap-[9px] border-b border-[#eef1f3] bg-[linear-gradient(to_bottom,transparent_0,transparent_39px,#f3f5f7_40px)]">
                  {[38, 54, 44, 74, 61, 88, 29].map((height, index) => (
                    <div className="flex flex-1 flex-col items-center justify-end gap-[9px]" key={index}>
                      <div
                        className={index === 5 ? "w-full max-w-[21px] rounded-t bg-[#4f85f3]" : "w-full max-w-[21px] rounded-t bg-[#dfe8fb]"}
                        style={{ height: `${height}%` }}
                      />
                      <span>{["M", "T", "W", "T", "F", "S", "S"][index]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <section className="rounded-xl border border-[#e6ebf1] bg-white p-6 shadow-[0_12px_32px_rgba(30,55,80,0.04)] max-md:p-4">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h2 className="font-sans text-base font-bold tracking-[-0.3px] text-[#18232f]">My tasks</h2>
                  <p className="mt-1 text-xs text-[#96a0ac]">Tasks assigned to you</p>
                </div>
                <Link href="/tasks" className="flex items-center gap-1.5 bg-transparent text-xs font-semibold text-[#2e6ff2] no-underline">
                  View all <Icon name="arrow" size={15} />
              </Link>
              </div>
              <div className="grid">
              {(tasks.length ? tasks.slice(0, 4) : initialProjects.map((project, index) => ({
                title: project.name,
                project: project.client,
                due: project.due,
                status: index === 0 ? "Done" : "To do",
              }))).map((task) => (
                <Task
                  key={`${task.project}-${task.title}`}
                  title={task.title}
                  project={task.project}
                  due={task.due || "No due date"}
                  checked={task.status === "Done"}
                />
              ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  change,
  caption,
  icon,
  tone,
}: {
  label: string;
  value: string;
  change: string;
  caption: string;
  icon: IconName;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-[14px] rounded-[10px] border border-[#e9edf2] bg-white p-[19px] max-md:gap-[9px] max-md:px-[11px] max-md:py-[13px]">
      <div className={`grid size-[41px] place-items-center rounded-[10px] max-md:size-[35px] ${tone}`}>
        <Icon name={icon} />
      </div>
      <div className="grid gap-[3px]">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>
          <b>{change}</b> {caption}
        </small>
      </div>
    </div>
  );
}

function Task({
  title,
  project,
  due,
  checked = false,
}: {
  title: string;
  project: string;
  due: string;
  checked?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 border-t border-[#f0f2f4] py-[13px]">
      <button className={checked ? "grid size-[17px] shrink-0 place-items-center rounded-[5px] border border-[#45b990] bg-[#45b990] text-white" : "grid size-[17px] shrink-0 place-items-center rounded-[5px] border border-[#d7dde4] bg-white text-white"}>
        {checked && <Icon name="check" size={13} />}
      </button>
      <div className="flex-1">
        <strong className={checked ? "text-[#aeb5bc] line-through" : ""}>{title}</strong>
        <span>{project}</span>
      </div>
      <span className={due === "Today" ? "text-[10px] font-semibold text-[#e56f62]" : "text-[10px] text-[#89939f]"}>
        {due}
      </span>
    </div>
  );
}
