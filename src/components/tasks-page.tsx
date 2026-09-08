"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import WorkspaceSidebar, { Icon } from "@/components/workspace-sidebar";
import ProfileMenu from "@/components/profile-menu";

type Task = {
  id: string;
  projectId?: string;
  title: string;
  project: string;
  assignee: string;
  due: string;
  priority: "High" | "Medium" | "Low";
  status: "To do" | "In progress" | "Done";
  team?: string[];
  guideCards?: GuideCard[];
  createdBy?: string;
  createdAt?: string;
  activity?: TaskActivity[];
};

type GuideCard = { id: string; title: string; description: string };
type TaskActivity = {
  id: string;
  action: string;
  detail: string;
  actor: string;
  timestamp: string;
};
type ProjectOption = {
  id: string;
  name: string;
  clientName: string;
  invoiceNumber: string;
};

const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "Finalize homepage copy",
    project: "Website redesign",
    assignee: "Jordan Davis",
    due: "2026-09-04",
    priority: "High",
    status: "In progress",
  },
  {
    id: "task-2",
    title: "Review app wireframes",
    project: "Mobile app launch",
    assignee: "Ava Morgan",
    due: "2026-09-06",
    priority: "Medium",
    status: "To do",
  },
  {
    id: "task-3",
    title: "Prepare brand moodboard",
    project: "Brand identity",
    assignee: "Riley Khan",
    due: "2026-09-05",
    priority: "Medium",
    status: "To do",
  },
  {
    id: "task-4",
    title: "Create content brief",
    project: "Q4 content calendar",
    assignee: "Jordan Davis",
    due: "2026-09-03",
    priority: "Low",
    status: "Done",
  },
];

const emptyTask = (): Omit<Task, "id"> => ({
  title: "",
  project: "",
  assignee: "Jordan Davis",
  due: "",
  priority: "Medium",
  status: "To do",
  team: [],
  guideCards: [],
});

const taskTableColumns =
  "grid-cols-[minmax(140px,1.2fr)_minmax(120px,1fr)_110px_90px_100px_auto_auto] max-lg:grid-cols-[minmax(140px,1.2fr)_minmax(110px,1fr)_100px_85px_auto_auto] max-md:grid-cols-[1fr_auto_auto_auto] max-md:gap-2.5";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<"All" | Task["status"]>("All");
  const [form, setForm] = useState(emptyTask);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [projectSearch, setProjectSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState<ProjectOption | null>(
    null,
  );
  const [setupStep, setSetupStep] = useState<"project" | "team">("project");
  const [teamMember, setTeamMember] = useState("");
  const [activityTask, setActivityTask] = useState<Task | null>(null);
  const [taskPage, setTaskPage] = useState(1);

  useEffect(() => {
    const saved = window.localStorage.getItem("focura-tasks");
    const savedProjects = window.localStorage.getItem("focura-projects");
    const timer = window.setTimeout(() => {
      if (saved) setTasks(JSON.parse(saved) as Task[]);
      if (savedProjects)
        setProjects(JSON.parse(savedProjects) as ProjectOption[]);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydrated)
      window.localStorage.setItem("focura-tasks", JSON.stringify(tasks));
  }, [hydrated, tasks]);

  function updateForm(field: keyof Omit<Task, "id">, value: string) {
    setForm((current) => ({ ...current, [field]: value }) as Omit<Task, "id">);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const timestamp = new Date().toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const projectName = selectedProject?.name ?? form.project;
    setTasks((current) => [
      {
        ...form,
        project: projectName,
        projectId: selectedProject?.id,
        id: crypto.randomUUID(),
        guideCards: [],
        createdBy: "Jordan Davis",
        createdAt: timestamp,
        activity: [
          {
            id: crypto.randomUUID(),
            action: "Project added",
            detail: projectName,
            actor: "Jordan Davis",
            timestamp,
          },
        ],
      },
      ...current,
    ]);
    setForm(emptyTask());
    setIsOpen(false);
  }

  function chooseProject(project: ProjectOption) {
    setSelectedProject(project);
    setForm((current) => ({ ...current, project: project.name }));
    setSetupStep("team");
  }
  function addTeamMember() {
    const name = teamMember.trim();
    if (!name) return;
    setForm((current) => ({
      ...current,
      team: [...(current.team ?? []), name],
      assignee: current.assignee || name,
    }));
    setTeamMember("");
  }

  function removeTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  function updateStatus(task: Task, status: Task["status"]) {
    const timestamp = new Date().toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
    setTasks((current) =>
      current.map((item) =>
        item.id === task.id
          ? {
              ...item,
              status,
              activity: [
                ...(item.activity ?? []),
                {
                  id: crypto.randomUUID(),
                  action: "Status changed",
                  detail: `${item.status} to ${status}`,
                  actor: "Jordan Davis",
                  timestamp,
                },
              ],
            }
          : item,
      ),
    );
    setActivityTask((current) =>
      current?.id === task.id
        ? {
            ...current,
            status,
            activity: [
              ...(current.activity ?? []),
              {
                id: crypto.randomUUID(),
                action: "Status changed",
                detail: `${task.status} to ${status}`,
                actor: "Jordan Davis",
                timestamp,
              },
            ],
          }
        : current,
    );
  }

  const visibleTasks =
    filter === "All" ? tasks : tasks.filter((task) => task.status === filter);
  const taskPageCount = Math.ceil(visibleTasks.length / 8);
  const currentTaskPage = Math.min(taskPage, Math.max(taskPageCount, 1));
  const paginatedTasks = visibleTasks.slice((currentTaskPage - 1) * 8, currentTaskPage * 8);
  const todoCount = tasks.filter((task) => task.status === "To do").length;
  const inProgressCount = tasks.filter(
    (task) => task.status === "In progress",
  ).length;
  const doneCount = tasks.filter((task) => task.status === "Done").length;

  return (
    <div className="flex min-h-screen bg-[#f8fafb]">
      <WorkspaceSidebar active="Tasks" />
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
            <strong>Tasks</strong>
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
                Tasks
              </h1>
              <p className="mt-2 text-sm text-[#89939f]">
                Keep priorities clear and every next step moving forward.
              </p>
            </div>
            <button
              onClick={() => setIsOpen(true)}
              className="inline-flex shrink-0 items-center gap-2 rounded-[7px] bg-[#2e6ff2] px-4 py-[11px] text-[13px] font-semibold text-white shadow-[0_5px_12px_rgba(46,111,242,0.15)] hover:bg-[#1f5edd]"
            >
              <span className="text-base leading-none">+</span>Add new task
            </button>
          </div>
          <div className="mb-5 grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-md:grid-cols-1">
            <Summary
              label="All tasks"
              value={String(tasks.length)}
              tone="blue"
            />
            <Summary
              label="To do"
              value={String(todoCount)}
              tone="gray"
            />
            <Summary
              label="In progress"
              value={String(inProgressCount)}
              tone="orange"
            />
            <Summary
              label="Done"
              value={String(doneCount)}
              tone="green"
            />
          </div>
          <section className="overflow-hidden rounded-xl border border-[#e6ebf1] bg-white p-6 shadow-[0_12px_32px_rgba(30,55,80,0.04)] max-md:p-4">
            <div className="mb-5 flex items-center justify-between gap-3 max-sm:items-start max-sm:flex-col">
              <div>
                <h2 className="font-sans text-base font-bold text-[#18232f]">
                  All tasks
                </h2>
                <p className="mt-1 text-xs text-[#96a0ac]">
                  Tasks assigned across your projects
                </p>
              </div>
              <div className="flex gap-1 rounded-lg bg-[#f3f5f7] p-1">
                {(["All", "To do", "In progress", "Done"] as const).map(
                  (option) => (
                    <button
                      type="button"
                      key={option}
                      onClick={() => setFilter(option)}
                      className={
                        filter === option
                          ? "rounded-md bg-white px-2.5 py-1.5 text-[10px] font-semibold text-[#2e6ff2] shadow-sm"
                          : "rounded-md bg-transparent px-2.5 py-1.5 text-[10px] text-[#89939f]"
                      }
                    >
                      {option}
                    </button>
                  ),
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="text-left">
                    <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">
                      Project
                    </th>
                    <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">
                      Assign By
                    </th>
                    <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">
                      Deadline
                    </th>
                    <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">
                      Priority
                    </th>
                    <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">
                      Status
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
                  {paginatedTasks.map((task) => {
                    const initials = task.project.slice(0, 2).toUpperCase();
                    return (
                      <tr
                        className="border-t border-[#f0f2f4]"
                        key={task.id}
                      >
                        <td className="py-4">
                          <div className="flex items-center gap-2.5">
                            <span className="grid size-[29px] place-items-center rounded-lg bg-[#edf3ff] text-[9px] font-bold text-[#2e6ff2]">
                              {initials}
                            </span>
                            <div>
                              <Link
                                href={`/tasks/${task.projectId ?? encodeURIComponent(task.project)}/starter-guide`}
                                className="block text-xs font-semibold text-[#26333d] hover:text-[#2e6ff2] hover:underline"
                              >
                                {task.project}
                              </Link>
                              <span className="block text-[10px] text-[#89939f]">
                                {task.title}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-xs text-[#89939f]">
                          {task.createdBy ?? task.assignee}
                        </td>
                        <td className="py-4 text-[10px] text-[#89939f]">
                          {task.due || "No due date"}
                        </td>
                        <td>
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] ${
                              task.priority === "High"
                                ? "bg-[#fff0ef] text-[#d8665d]"
                                : task.priority === "Medium"
                                  ? "bg-[#fff6e9] text-[#d58b35]"
                                  : "bg-[#edf3ff] text-[#2e6ff2]"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td>
                          <select
                            aria-label={`Change ${task.project} status`}
                            value={task.status}
                            onChange={(event) =>
                              updateStatus(
                                task,
                                event.target.value as Task["status"],
                              )
                            }
                            className="rounded-md border border-[#e4e9ef] bg-white px-2 py-1 text-[10px] font-semibold text-[#26333d] outline-none focus:border-[#2e6ff2]"
                          >
                            <option>To do</option>
                            <option value="In progress">In Progress</option>
                            <option>Done</option>
                          </select>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => removeTask(task.id)}
                            className="rounded-md bg-[#fff0ef] px-2 py-1 text-[10px] font-semibold text-[#d8665d]"
                          >
                            Delete
                          </button>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => setActivityTask(task)}
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
            {taskPageCount > 1 && (
              <TaskPagination
                page={currentTaskPage}
                pageCount={taskPageCount}
                onChange={setTaskPage}
              />
            )}
          </section>
        </div>
      </main>
      {isOpen && (
        <TaskModal
          form={form}
          projects={projects}
          projectSearch={projectSearch}
          selectedProject={selectedProject}
          setupStep={setupStep}
          teamMember={teamMember}
          setProjectSearch={setProjectSearch}
          chooseProject={chooseProject}
          setSetupStep={setSetupStep}
          setTeamMember={setTeamMember}
          addTeamMember={addTeamMember}
          updateForm={updateForm}
          onSubmit={submit}
          onClose={() => setIsOpen(false)}
        />
      )}
      {activityTask && (
        <TaskActivityModal
          task={activityTask}
          onClose={() => setActivityTask(null)}
        />
      )}
    </div>
  );
}

function TaskPagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="mt-4 flex items-center justify-end gap-2 border-t border-[#f0f2f4] pt-4">
      <button type="button" disabled={page === 1} onClick={() => onChange(page - 1)} className="rounded-md border border-[#e4e9ef] px-3 py-1.5 text-[10px] text-[#687582] disabled:opacity-40">Previous</button>
      <span className="text-[10px] text-[#89939f]">Page {page} of {pageCount}</span>
      <button type="button" disabled={page === pageCount} onClick={() => onChange(page + 1)} className="rounded-md border border-[#e4e9ef] px-3 py-1.5 text-[10px] text-[#687582] disabled:opacity-40">Next</button>
    </div>
  );
}

function Summary({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-[#e9edf2] bg-white p-4">
      <span
        className={`inline-block rounded-md px-2 py-1 text-[10px] font-semibold ${
          tone === "green"
            ? "bg-[#e9f8f2] text-[#2caf82]"
            : tone === "orange"
              ? "bg-[#fff6e9] text-[#d58b35]"
              : tone === "gray"
                ? "bg-[#f3f5f7] text-[#687582]"
                : "bg-[#edf3ff] text-[#2e6ff2]"
        }`}
      >
        {label}
      </span>
      <strong className="mt-2 block font-sans text-2xl font-bold text-[#18232f]">
        {value}
      </strong>
    </div>
  );
}

function TaskActivityModal({
  task,
  onClose,
}: {
  task: Task;
  onClose: () => void;
}) {
  const activity = task.activity ?? [];
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
              {task.project}
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
        <div className="grid max-h-[60vh] gap-2 overflow-y-auto p-4">
          {activity.length ? (
            activity.map((item) => (
              <div
                key={item.id}
                className="rounded-md border border-[#e6ebf1] bg-[#f8fafb] px-3 py-2"
              >
                <strong className="block text-[11px] text-[#26333d]">
                  {item.action}
                </strong>
                <span className="block text-[10px] text-[#687582]">
                  {item.detail}
                </span>
                <span className="block text-[9px] text-[#89939f]">
                  By {item.actor} · {item.timestamp}
                </span>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-[#89939f]">
              No activity history yet.
              {task.createdAt && (
                <span className="mt-1 block text-[10px]">
                  Added by {task.createdBy ?? task.assignee} · {task.createdAt}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskModal({
  form,
  projects,
  projectSearch,
  selectedProject,
  setupStep,
  teamMember,
  setProjectSearch,
  chooseProject,
  setSetupStep,
  setTeamMember,
  addTeamMember,
  updateForm,
  onSubmit,
  onClose,
}: {
  form: Omit<Task, "id">;
  projects: ProjectOption[];
  projectSearch: string;
  selectedProject: ProjectOption | null;
  setupStep: "project" | "team";
  teamMember: string;
  setProjectSearch: (value: string) => void;
  chooseProject: (project: ProjectOption) => void;
  setSetupStep: (step: "project" | "team") => void;
  setTeamMember: (value: string) => void;
  addTeamMember: () => void;
  updateForm: (field: keyof Omit<Task, "id">, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}) {
  const inputClass =
    "mt-1 w-full rounded-md border border-[#e4e9ef] bg-white px-2.5 py-2 text-xs text-[#26333d] outline-none focus:border-[#2e6ff2] focus:ring-2 focus:ring-[#edf3ff]";
  const labelClass =
    "text-[10px] font-semibold uppercase tracking-[0.05em] text-[#7e8995]";
  const matchingProjects = projects.filter((project) =>
    `${project.name} ${project.clientName} ${project.invoiceNumber}`
      .toLowerCase()
      .includes(projectSearch.toLowerCase()),
  );
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#18232f]/45 p-4"
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={onSubmit}
        className="w-full max-w-[600px] rounded-xl bg-[#f8fafb] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#e6ebf1] bg-white px-6 py-5">
          <div>
            <h2 className="font-sans text-xl font-bold text-[#18232f]">
              Add new task
            </h2>
            <p className="mt-1 text-xs text-[#96a0ac]">
              Assign a clear next step to your team.
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
        {setupStep === "project" ? (
          <div className="grid gap-4 p-6">
            <label className={labelClass}>
              Search All Projects
              <input
                className={inputClass}
                value={projectSearch}
                onChange={(event) => setProjectSearch(event.target.value)}
                placeholder="Search by project, client or invoice"
              />
            </label>
            <div className="grid max-h-64 gap-2 overflow-y-auto">
              {matchingProjects.length ? (
                matchingProjects.map((project) => (
                  <button
                    type="button"
                    key={project.id}
                    onClick={() => chooseProject(project)}
                    className="flex items-center justify-between rounded-lg border border-[#e6ebf1] bg-white p-3 text-left hover:border-[#2e6ff2]"
                  >
                    <span>
                      <strong className="block text-xs text-[#26333d]">
                        {project.name}
                      </strong>
                      <span className="mt-1 block text-[10px] text-[#89939f]">
                        {project.clientName} · {project.invoiceNumber}
                      </span>
                    </span>
                    <span className="text-xs font-semibold text-[#2e6ff2]">
                      Select
                    </span>
                  </button>
                ))
              ) : (
                <p className="rounded-lg bg-white p-5 text-center text-xs text-[#89939f]">
                  No projects found in All Projects.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 p-6">
            <div className="rounded-lg bg-[#edf3ff] p-3">
              <span className="text-[10px] uppercase text-[#2e6ff2]">
                Selected project
              </span>
              <strong className="mt-1 block text-sm text-[#26333d]">
                {selectedProject?.name}
              </strong>
            </div>
            <label className={`${labelClass} flex gap-2`}>
              Add team member
              <input
                className={inputClass}
                value={teamMember}
                onChange={(event) => setTeamMember(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addTeamMember();
                  }
                }}
                placeholder="Member name"
              />
              <button
                type="button"
                onClick={addTeamMember}
                className="mt-1 rounded-md bg-[#edf3ff] px-3 text-xs font-semibold text-[#2e6ff2]"
              >
                Add
              </button>
            </label>
            <div className="flex flex-wrap gap-2">
              {(form.team ?? []).map((member) => (
                <span
                  className="rounded-full bg-[#e9f8f2] px-2.5 py-1 text-[10px] font-semibold text-[#2caf82]"
                  key={member}
                >
                  {member}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSetupStep("project")}
              className="justify-self-start bg-transparent text-xs font-semibold text-[#2e6ff2]"
            >
              ← Change project
            </button>
            <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
              <label className={`${labelClass} col-span-2 max-md:col-span-1`}>
                Task title
                <input
                  required
                  className={inputClass}
                  value={form.title}
                  onChange={(event) => updateForm("title", event.target.value)}
                  placeholder="e.g. Review landing page"
                />
              </label>
              <label className={labelClass}>
                Due date
                <input
                  className={inputClass}
                  type="date"
                  value={form.due}
                  onChange={(event) => updateForm("due", event.target.value)}
                />
              </label>
              <label className={labelClass}>
                Priority
                <select
                  className={inputClass}
                  value={form.priority}
                  onChange={(event) =>
                    updateForm("priority", event.target.value)
                  }
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </label>
              <label className={labelClass}>
                Status
                <select
                  className={inputClass}
                  value={form.status}
                  onChange={(event) => updateForm("status", event.target.value)}
                >
                  <option>To do</option>
                  <option>In progress</option>
                  <option>Done</option>
                </select>
              </label>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-3 border-t border-[#e6ebf1] bg-white px-6 py-4">
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
            Create task
          </button>
        </div>
      </form>
    </div>
  );
}
