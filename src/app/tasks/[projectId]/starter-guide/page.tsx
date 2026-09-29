"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import {
  ChangeEvent,
  FormEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import WorkspaceSidebar, { Icon } from "@/components/workspace-sidebar";
import ProfileMenu from "@/components/profile-menu";
import { loadWorkspaceData, saveWorkspaceData } from "@/lib/workspace-data";

type TeamName =
  "UI/UX" | "Frontend" | "Backend" | "Database" | "Full Stack" | "Sales";
type TaskStatus = "Todo" | "Doing" | "Review" | "Done";
type Member = { name: string; email: string };
type Attachment = { name: string; data: string };
type GuideCard = {
  id: string;
  title: string;
  description: string;
  details?: string;
  team?: TeamName;
  priority?: string;
  priorityColor?: string;
  attachment?: string;
  attachmentData?: string;
  attachments?: Attachment[];
  deadline?: string;
  mentions?: string[];
  assignedAt?: string;
  assignedBy?: Member;
  comments?: Comment[];
  status?: TaskStatus;
  activity?: Activity[];
};
type Comment = {
  id: string;
  author: string;
  text: string;
  parentId?: string;
  timestamp: string;
};
type Activity = {
  id: string;
  action: string;
  detail: string;
  timestamp: string;
};
type Task = {
  id: string;
  projectId?: string;
  title?: string;
  project: string;
  guideCards?: GuideCard[];
  taskDetails?: string;
  taskName?: string;
  teamName?: TeamName;
  mentions?: string[];
  deadline?: string;
  priority?: string;
  priorityColor?: string;
  attachment?: string;
  attachmentData?: string;
  attachments?: Attachment[];
  status?: TaskStatus;
  comments?: Comment[];
  activity?: Activity[];
};
type Project = {
  id: string;
  name: string;
  clientName: string;
  invoiceNumber: string;
  description?: string;
};
type TaskForm = {
  taskName: string;
  teamName: TeamName;
  mentions: string[];
  details: string;
  deadline: string;
  priority: string;
  priorityColor: string;
  attachment: string;
  attachmentData: string;
  attachments: Attachment[];
  status: TaskStatus;
};

const teamMembers: Record<TeamName, Member[]> = {
  "UI/UX": [
    { name: "Ava Morgan", email: "ava@dev-cluster.dev" },
    { name: "Maya Chen", email: "maya@dev-cluster.dev" },
  ],
  Frontend: [
    { name: "Riley Khan", email: "riley@dev-cluster.dev" },
    { name: "Theo Grant", email: "theo@dev-cluster.dev" },
  ],
  Backend: [{ name: "Jordan Davis", email: "jordan@dev-cluster.dev" }],
  Database: [{ name: "Mina Park", email: "mina@dev-cluster.dev" }],
  "Full Stack": [{ name: "Noah Wilson", email: "noah@dev-cluster.dev" }],
  Sales: [{ name: "Sam Lee", email: "sam@dev-cluster.dev" }],
};
const teams = Object.keys(teamMembers) as TeamName[];
const priorityColors = ["#d8665d", "#d58b35", "#2e6ff2", "#45b990", "#875b67"];
const statusOptions: TaskStatus[] = ["Todo", "Doing", "Review", "Done"];
const statusColors: Record<TaskStatus, string> = {
  Todo: "#89939f",
  Doing: "#2e6ff2",
  Review: "#d58b35",
  Done: "#2caf82",
};
const initialForm: TaskForm = {
  taskName: "",
  teamName: "UI/UX",
  mentions: [],
  details: "",
  deadline: "",
  priority: "Medium",
  priorityColor: "#d58b35",
  attachment: "",
  attachmentData: "",
  attachments: [],
  status: "Todo",
};

export default function StarterGuidePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const [projectId, setProjectId] = useState("");
  const [project, setProject] = useState<Project | null>(null);
  const [cards, setCards] = useState<GuideCard[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<GuideCard | null>(null);
  const [viewingCard, setViewingCard] = useState<GuideCard | null>(null);
  const [activityCard, setActivityCard] = useState<GuideCard | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [formError, setFormError] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "All">("All");
  const [guidePage, setGuidePage] = useState(1);
  const [, refreshCountdown] = useState(0);

  useEffect(() => {
    params.then(async ({ projectId: routeId }) => {
      const decodedId = decodeURIComponent(routeId);
      const [savedProjects, savedTasks] = await Promise.all([
        loadWorkspaceData<Project[]>("dev-cluster-projects", []),
        loadWorkspaceData<Task[]>("dev-cluster-tasks", []),
      ]);
      const match = savedProjects.find(
        (item) => item.id === decodedId || item.name === decodedId,
      );
      const ownerId = match?.id ?? decodedId;
      const matchingTasks = savedTasks.filter(
        (item) =>
          item.projectId === ownerId ||
          item.projectId === decodedId ||
          item.project === decodedId ||
          item.project === match?.name,
      );
      const task = matchingTasks[0];
      const uniqueCards = Array.from(
        new Map(
          matchingTasks
            .flatMap((item) => item.guideCards ?? [])
            .map((card) => [card.id, card]),
        ).values(),
      );
      setProjectId(ownerId);
      setProject(
        match ??
          (task
            ? {
                id: decodedId,
                name: task.project,
                clientName: "",
                invoiceNumber: "",
              }
            : null),
      );
      setCards(uniqueCards);
      setNotFound(!match && !task);
    });
  }, [params]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      refreshCountdown((value) => value + 1);
    }, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const filteredCards =
    statusFilter === "All"
      ? cards
      : cards.filter((card) => (card.status ?? "Todo") === statusFilter);
  const guidePageCount = Math.ceil(filteredCards.length / 8);
  const currentGuidePage = Math.min(guidePage, Math.max(guidePageCount, 1));
  const paginatedCards = filteredCards.slice((currentGuidePage - 1) * 8, currentGuidePage * 8);

  function persistGuideCards(
    tasks: Task[],
    nextCards: GuideCard[],
    taskData?: Partial<Omit<Task, "id">>,
  ) {
    const ownerId = projectId || project?.id || project?.name || "";
    const belongsToProject = (task: Task) =>
      task.projectId === ownerId || task.project === project?.name;
    const ownerIndex = tasks.findIndex(belongsToProject);
    if (ownerIndex === -1) {
      if (!taskData) return tasks;
      return [
        { ...taskData, id: crypto.randomUUID(), guideCards: nextCards },
        ...tasks,
      ];
    }
    return tasks.map((task, index) => {
      if (!belongsToProject(task)) return task;
      if (index === ownerIndex)
        return { ...task, ...taskData, guideCards: nextCards };
      const remainingTask = { ...task };
      delete remainingTask.guideCards;
      return remainingTask;
    });
  }

  function addTask(
    event: FormEvent<HTMLFormElement>,
    form: TaskForm,
    comments: Comment[],
  ) {
    event.preventDefault();
    const ownerId = projectId || project?.id || project?.name || "";
    if (!form.taskName.trim()) {
      setFormError("Task name is required.");
      return;
    }
    if (!ownerId) {
      setFormError("This guide is not connected to a project yet.");
      return;
    }
    setFormError("");
    const timestamp = new Date().toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const card: GuideCard = {
      id: editingCard?.id ?? crypto.randomUUID(),
      title: form.taskName.trim(),
      description:
        form.details.replace(/<[^>]+>/g, " ").trim() || "No details added",
      details: form.details,
      team: form.teamName,
      priority: form.priority,
      priorityColor: form.priorityColor,
      attachment: form.attachment,
      attachmentData: form.attachmentData,
      attachments: form.attachments,
      deadline: form.deadline,
      mentions: form.mentions,
      assignedAt: editingCard?.assignedAt ?? timestamp,
      assignedBy: editingCard?.assignedBy ?? {
        name: "Jordan Davis",
        email: "jordan@dev-cluster.dev",
      },
      comments,
      status: form.status,
      activity: editingCard?.activity ?? [
        {
          id: crypto.randomUUID(),
          action: "Task assigned",
          detail: `${form.taskName} to ${form.teamName}`,
          timestamp,
        },
      ],
    };
    const activity: Activity = {
      id: crypto.randomUUID(),
      action: "Task assigned",
      detail: `${form.taskName} to ${form.teamName}`,
      timestamp,
    };
    const taskData: Omit<Task, "id"> = {
      projectId: ownerId,
      project: project?.name ?? "",
      taskName: form.taskName.trim(),
      title: form.taskName.trim(),
      taskDetails: form.details,
      teamName: form.teamName,
      mentions: form.mentions,
      deadline: form.deadline,
      priority: form.priority,
      priorityColor: form.priorityColor,
      attachment: form.attachment,
      status: form.status,
      comments,
      activity: [activity],
    };
    const tasks = JSON.parse(
      window.localStorage.getItem("dev-cluster-tasks") ?? "[]",
    ) as Task[];
    if (editingCard) {
      const nextCards = cards.map((item) =>
        item.id === editingCard.id ? card : item,
      );
      const nextTasks = persistGuideCards(tasks, nextCards, taskData);
      try {
        window.localStorage.setItem(
          "dev-cluster-tasks",
          JSON.stringify(nextTasks),
        );
      } catch (error) {
        setFormError(
          error instanceof DOMException && error.name === "QuotaExceededError"
            ? "Browser storage is full. Remove large attachments or old tasks, then try again."
            : "Unable to save this guide card. Please try again.",
        );
        return;
      }
      void saveWorkspaceData("dev-cluster-tasks", nextTasks);
      setCards(nextCards);
      setEditingCard(null);
      setIsOpen(false);
      return;
    }
    const nextCards = [...cards, card];
    const nextTasks = persistGuideCards(tasks, nextCards, taskData);
    try {
      window.localStorage.setItem(
        "dev-cluster-tasks",
        JSON.stringify(nextTasks),
      );
    } catch (error) {
      setFormError(
        error instanceof DOMException && error.name === "QuotaExceededError"
          ? "Browser storage is full. Remove large attachments or old tasks, then try again."
          : "Unable to save this guide card. Please try again.",
      );
      return;
    }
    void saveWorkspaceData("dev-cluster-tasks", nextTasks);
    setCards(nextCards);
    setIsOpen(false);
  }

  function deleteCard(cardId: string) {
    const nextCards = cards.filter((card) => card.id !== cardId);
    const tasks = JSON.parse(
      window.localStorage.getItem("dev-cluster-tasks") ?? "[]",
    ) as Task[];
    const nextTasks = persistGuideCards(tasks, nextCards);
    window.localStorage.setItem("dev-cluster-tasks", JSON.stringify(nextTasks));
    void saveWorkspaceData("dev-cluster-tasks", nextTasks);
    setCards(nextCards);
  }

  function updateCardStatus(cardId: string, status: TaskStatus) {
    const timestamp = new Date().toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const nextCards = cards.map((card) =>
      card.id === cardId
        ? {
            ...card,
            status,
            activity: [
              ...(card.activity ?? []),
              {
                id: crypto.randomUUID(),
                action: "Status changed",
                detail: `${card.status ?? "Todo"} to ${status}`,
                timestamp,
              },
            ],
          }
        : card,
    );
    const tasks = JSON.parse(
      window.localStorage.getItem("dev-cluster-tasks") ?? "[]",
    ) as Task[];
    const nextTasks = persistGuideCards(tasks, nextCards, { status });
    window.localStorage.setItem("dev-cluster-tasks", JSON.stringify(nextTasks));
    void saveWorkspaceData("dev-cluster-tasks", nextTasks);
    setCards(nextCards);
    setViewingCard((current) => {
      const updated = nextCards.find((card) => card.id === cardId);
      return current?.id === cardId && updated ? updated : current;
    });
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafb]">
      <WorkspaceSidebar active="Tasks" />
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
            <strong>Project Starter Guide</strong>
          </div>
          <ProfileMenu />
        </header>
        <div className="mx-auto max-w-[1100px] px-0 pb-[50px] pt-[42px] max-md:pt-7">
          {notFound ? (
            <section className="rounded-xl border border-[#e6ebf1] bg-white p-10 text-center">
              <h1 className="font-sans text-2xl font-bold text-[#18232f]">
                Project not found
              </h1>
              <Link
                href="/tasks"
                className="mt-4 inline-block text-xs font-semibold text-[#2e6ff2]"
              >
                Back to tasks
              </Link>
            </section>
          ) : (
            <>
              <Link
                href="/tasks"
                className="text-xs font-semibold text-[#2e6ff2] no-underline"
              >
                ← Back to tasks
              </Link>
              <div className="mb-8 mt-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#2e6ff2]">
                  Project Starter Guide
                </span>
                <h1 className="mt-2 font-sans text-3xl font-bold tracking-[-1px] text-[#18232f]">
                  {project?.name}
                </h1>
                <p className="mt-2 text-sm text-[#89939f]">
                  {project?.description || "A focused guide for this project."}
                </p>
              </div>
              <section className="rounded-xl border border-[#e6ebf1] bg-white px-8 py-6 shadow-[0_12px_32px_rgba(30,55,80,0.04)]">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-sans text-base font-bold text-[#18232f]">
                      Guide cards
                    </h2>
                    <p className="mt-1 text-xs text-[#96a0ac]">
                      Project-specific notes and starting points
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-1 rounded-lg bg-[#f3f5f7] p-1">
                    <button
                      type="button"
                      onClick={() => setStatusFilter("All")}
                      className={`rounded-md px-3 py-2 text-[10px] font-bold ${statusFilter === "All" ? "bg-white text-[#2e6ff2] shadow-sm" : "text-[#89939f] hover:bg-white/70"}`}
                    >
                      All
                    </button>
                    {statusOptions.map((status) => (
                      <button
                        type="button"
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`rounded-md px-3 py-2 text-[10px] font-bold ${statusFilter === status ? "bg-white shadow-sm" : "hover:bg-white/70"}`}
                        style={{ color: statusColors[status] }}
                      >
                        {status}
                      </button>
                    ))}
                    <span className="rounded-full bg-[#edf3ff] px-2.5 py-1 text-[10px] font-semibold text-[#2e6ff2]">
                      {filteredCards.length} cards
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormError("");
                        setEditingCard(null);
                        setIsOpen(true);
                      }}
                      className="inline-flex items-center gap-2 rounded-md bg-[#2e6ff2] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1f5edd]"
                    >
                      <span className="text-base leading-none">+</span>Add guide
                      card
                    </button>
                  </div>
                </div>
                {filteredCards.length ? (
                  <div className="overflow-x-auto rounded-lg border border-[#e6ebf1]">
                    <table className="w-full min-w-[980px] border-collapse text-left">
                      <thead className="bg-[#f8fafb]">
                        <tr className="border-b border-[#e6ebf1] text-[10px] uppercase tracking-[0.05em] text-[#89939f]">
                          <th className="px-4 py-3 font-semibold">Assign by</th>
                          <th className="px-4 py-3 font-semibold">
                            Assign date
                          </th>
                          <th className="px-4 py-3 font-semibold">Task name</th>
                          <th className="px-4 py-3 font-semibold">Team</th>
                          <th className="px-4 py-3 font-semibold">Tag</th>
                          <th className="px-4 py-3 font-semibold">Priority</th>
                          <th className="px-4 py-3 font-semibold">Deadline</th>
                          <th className="px-4 py-3 font-semibold">Files</th>
                          <th className="px-4 py-3 font-semibold">Task view</th>
                          <th className="px-4 py-3 font-semibold">Status</th>
                          <th className="px-4 py-3 text-right font-semibold">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedCards.map((card) => (
                          <tr
                            key={card.id}
                            className="border-b border-[#f0f2f4] last:border-0"
                          >
                            <td className="px-4 py-4 align-top">
                              {card.assignedBy ? (
                                <div className="flex items-center gap-2">
                                  <Avatar member={card.assignedBy} />
                                  <span>
                                    <strong className="block text-[10px] text-[#26333d]">
                                      {card.assignedBy.name}
                                    </strong>
                                    <span className="block text-[9px] text-[#89939f]">
                                      {card.assignedBy.email}
                                    </span>
                                  </span>
                                </div>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="px-4 py-4 align-top text-[10px] text-[#687582]">
                              {card.assignedAt || "-"}
                            </td>
                            <td className="px-4 py-4 align-top text-xs text-[#26333d]">
                              {card.title}
                            </td>
                            <td className="px-4 py-4 align-top text-xs text-[#687582]">
                              {card.team || "-"}
                            </td>
                            <td className="px-4 py-4 align-top text-[10px] text-[#687582]">
                              {card.mentions?.length || 0} member
                              {card.mentions?.length === 1 ? "" : "s"}
                            </td>
                            <td className="px-4 py-4 align-top">
                              {card.priority && (
                                <span
                                  className="rounded-full px-2 py-1 text-[10px] font-semibold text-white"
                                  style={{
                                    backgroundColor: card.priorityColor,
                                  }}
                                >
                                  {card.priority}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 align-top text-[10px] font-semibold text-[#d8665d]">
                              {card.deadline ? (
                                <>
                                  <span className="block">{card.deadline}</span>
                                  <span className="mt-1 block font-bold text-[#d8665d]">
                                    {getDaysRemaining(card.deadline)} days left
                                  </span>
                                </>
                              ) : (
                                "No deadline"
                              )}
                            </td>
                            <td className="px-4 py-4 align-top text-[10px] text-[#687582]">
                              {getAttachments(card).length} file
                              {getAttachments(card).length === 1 ? "" : "s"}
                            </td>
                            <td className="px-4 py-4 align-top">
                              <button
                                type="button"
                                onClick={() => setViewingCard(card)}
                                className="rounded-md bg-[#edf3ff] px-3 py-2 text-[10px] font-semibold text-[#2e6ff2]"
                              >
                                View task
                              </button>
                            </td>
                            <td className="px-4 py-4 align-top">
                              <StatusDropdown
                                card={card}
                                onChange={(status) =>
                                  updateCardStatus(card.id, status)
                                }
                              />
                            </td>
                            <td className="px-4 py-4 align-top text-right whitespace-nowrap">
                              <section>
                                <section>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingCard(card);
                                      setIsOpen(true);
                                    }}
                                    className="mr-3 text-[10px] font-semibold text-[#2e6ff2]"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteCard(card.id)}
                                    className="mr-3 text-[10px] font-semibold text-[#d8665d]"
                                  >
                                    Delete
                                  </button>
                                </section>
                                <section>
                                  <button
                                    type="button"
                                    onClick={() => setActivityCard(card)}
                                    aria-label={`Open activity log for ${card.title}`}
                                    title="Open activity log"
                                    className="inline-grid size-7 place-items-center rounded-md border border-[#e4e9ef] bg-white text-sm font-bold text-[#687582] hover:border-[#2e6ff2] hover:text-[#2e6ff2]"
                                  >
                                    →
                                  </button>
                                </section>
                              </section>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {guidePageCount > 1 && (
                      <GuidePagination
                        page={currentGuidePage}
                        pageCount={guidePageCount}
                        onChange={setGuidePage}
                      />
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-[#dfe5eb] px-4 py-12 text-center text-xs text-[#89939f]">
                    {statusFilter === "All"
                      ? "No starter guide cards yet."
                      : `No ${statusFilter} cards yet.`}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
      {isOpen && (
        <TaskModal
          projectName={project?.name ?? ""}
          initialCard={editingCard}
          formError={formError}
          onClose={() => {
            setIsOpen(false);
            setEditingCard(null);
            setFormError("");
          }}
          onSubmit={addTask}
        />
      )}
      {viewingCard && (
        <TaskViewModal
          card={viewingCard}
          onClose={() => setViewingCard(null)}
        />
      )}
      {activityCard && (
        <ActivityLogModal
          card={activityCard}
          onClose={() => setActivityCard(null)}
        />
      )}
    </div>
  );
}

function GuidePagination({
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

function getDaysRemaining(deadline: string) {
  const [year, month, day] = deadline.split("-").map(Number);
  const dueDate = new Date(year, month - 1, day);
  const today = new Date();
  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  return Math.max(
    0,
    Math.ceil((dueDate.getTime() - todayDate.getTime()) / 86400000),
  );
}

function getAttachments(card: GuideCard): Attachment[] {
  if (card.attachments?.length) return card.attachments;
  return card.attachment
    ? [{ name: card.attachment, data: card.attachmentData ?? "" }]
    : [];
}

function ActivityLogModal({
  card,
  onClose,
}: {
  card: GuideCard;
  onClose: () => void;
}) {
  const activity = (card.activity ?? []).filter(
    (item) => item.action === "Status changed",
  );
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#18232f]/45 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="mx-auto my-8 w-full max-w-[560px] overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e6ebf1] px-6 py-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#2e6ff2]">
              Activity log
            </span>
            <h2 className="mt-1 font-sans text-xl font-bold text-[#18232f]">
              {card.title}
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
                  By Jordan Davis · {item.timestamp}
                </span>
              </div>
            ))
          ) : (
            <p className="py-8 text-center text-xs text-[#89939f]">
              No status activity yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusDropdown({
  card,
  onChange,
}: {
  card: GuideCard;
  onChange: (status: TaskStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const menuHeight = 190;
      const top =
        rect.bottom + 4 + menuHeight > window.innerHeight
          ? Math.max(8, rect.top - menuHeight - 4)
          : rect.bottom + 4;
      const left = Math.min(
        Math.max(8, rect.right - 112),
        window.innerWidth - 120,
      );
      setPosition({ top, left });
    };
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  const menu = open
    ? createPortal(
        <div
          className="fixed z-[100] min-w-28 rounded-lg border border-[#e6ebf1] bg-white p-1 shadow-xl"
          style={{ top: position.top, left: position.left }}
        >
          {statusOptions.map((status) => (
            <button
              type="button"
              key={status}
              onClick={() => {
                onChange(status);
                setOpen(false);
              }}
              className="block w-full rounded-md px-3 py-2 text-left text-[10px] font-bold hover:bg-[#f8fafb]"
              style={{ color: statusColors[status] }}
            >
              {status}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-1 block w-full rounded-md border-t border-[#edf0f3] px-3 py-2 text-left text-[10px] font-semibold text-[#89939f] hover:bg-[#f8fafb]"
          >
            Cancel
          </button>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Change ${card.title} status`}
        onClick={() => setOpen((current) => !current)}
        className="rounded-md border border-[#e4e9ef] bg-white px-3 py-1.5 text-left text-[10px] font-bold outline-none focus:border-[#2e6ff2]"
        style={{ color: statusColors[card.status ?? "Todo"] }}
      >
        {card.status ?? "Todo"}
      </button>
      {menu}
    </>
  );
}

function TaskViewModal({
  card,
  onClose,
}: {
  card: GuideCard;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#18232f]/45 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="mx-auto my-8 w-full max-w-[680px] overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e6ebf1] px-6 py-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#2e6ff2]">
              Task view
            </span>
            <h2 className="mt-1 font-sans text-xl font-bold text-[#18232f]">
              {card.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg bg-[#f3f5f7] text-lg text-[#687582]"
            aria-label="Close task view"
          >
            ×
          </button>
        </div>
        <div className="grid gap-5 p-6">
          <section>
            <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-[#2e6ff2]">
              Assign Task
            </h3>
            <div
              className="prose prose-sm mt-3 max-w-none rounded-lg border border-[#e6ebf1] bg-[#f8fafb] p-4 text-sm text-[#26333d]"
              dangerouslySetInnerHTML={{
                __html: card.details || card.description,
              }}
            />
          </section>
          <section>
            <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-[#2e6ff2]">
              File
            </h3>
            {getAttachments(card).length ? (
              <div className="mt-3 grid gap-2">
                {getAttachments(card).map((file) =>
                  file.data ? (
                    <a
                      key={file.name}
                      href={file.data}
                      download={file.name}
                      className="inline-flex w-fit rounded-md bg-[#edf3ff] px-3 py-2 text-xs font-semibold text-[#2e6ff2] no-underline hover:bg-[#dce8ff]"
                    >
                      Download {file.name}
                    </a>
                  ) : (
                    <p key={file.name} className="text-xs text-[#89939f]">
                      {file.name}
                    </p>
                  ),
                )}
              </div>
            ) : (
              <p className="mt-3 text-xs text-[#89939f]">No file uploaded</p>
            )}
          </section>
          <section className="border-t border-[#e6ebf1] pt-5">
            <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-[#2e6ff2]">
              Activity log
            </h3>
            {card.activity?.length ? (
              <div className="mt-3 grid gap-3">
                {card.activity.map((item) => (
                  <div
                    key={item.id}
                    className="border-l-2 border-[#dce8ff] pl-3"
                  >
                    <strong className="block text-xs text-[#26333d]">
                      {item.action}
                    </strong>
                    <span className="block text-[10px] text-[#687582]">
                      {item.detail}
                    </span>
                    <span className="block text-[10px] text-[#89939f]">
                      By Jordan Davis · {item.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-[#89939f]">No activity yet.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function TaskModal({
  projectName,
  initialCard,
  formError,
  onClose,
  onSubmit,
}: {
  projectName: string;
  initialCard: GuideCard | null;
  formError: string;
  onClose: () => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
    form: TaskForm,
    comments: Comment[],
  ) => void;
}) {
  const [form, setForm] = useState<TaskForm>(() =>
    initialCard
      ? {
          ...initialForm,
          taskName: initialCard.title,
          teamName: initialCard.team ?? initialForm.teamName,
          mentions: initialCard.mentions ?? [],
          details: initialCard.details ?? initialCard.description,
          deadline: initialCard.deadline ?? "",
          priority: initialCard.priority ?? initialForm.priority,
          priorityColor: initialCard.priorityColor ?? initialForm.priorityColor,
          attachment: initialCard.attachment ?? "",
          attachmentData: initialCard.attachmentData ?? "",
          attachments: initialCard.attachments ?? [],
          status: initialCard.status ?? initialForm.status,
        }
      : initialForm,
  );
  const [comments, setComments] = useState<Comment[]>(
    initialCard?.comments ?? [],
  );
  const [comment, setComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [commentMentionOpen, setCommentMentionOpen] = useState(false);
  const [editorMentionOpen, setEditorMentionOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);
  const selectionRef = useRef<Range | null>(null);
  const inputClass =
    "mt-1 w-full rounded-md border border-[#e4e9ef] bg-white px-3 py-2 text-xs text-[#26333d] outline-none focus:border-[#2e6ff2] focus:ring-2 focus:ring-[#edf3ff]";
  const members = teamMembers[form.teamName];
  useEffect(() => {
    if (
      initialCard &&
      editorRef.current &&
      editorRef.current.innerHTML !== form.details
    ) {
      editorRef.current.innerHTML = form.details;
    }
  }, [initialCard, form.details]);
  const update = (field: keyof TaskForm, value: string | string[]) =>
    setForm((current) => ({ ...current, [field]: value }));
  function saveEditorSelection() {
    const selection = window.getSelection();
    if (
      !selection?.rangeCount ||
      !editorRef.current?.contains(selection.anchorNode)
    ) {
      return;
    }
    selectionRef.current = selection.getRangeAt(0).cloneRange();
  }
  function restoreEditorSelection() {
    if (!selectionRef.current) return false;
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(selectionRef.current.cloneRange());
    return true;
  }
  const insertMention = (member: Member, target: "editor" | "comment") => {
    const value = `@${member.name} `;
    if (target === "editor") {
      editorRef.current?.focus();
      document.execCommand("insertText", false, value);
      setEditorMentionOpen(false);
    } else {
      setComment((current) => `${current}${value}`);
      setCommentMentionOpen(false);
    }
  };
  function onEditorKeyUp() {
    const text = editorRef.current?.innerText ?? "";
    saveEditorSelection();
    setEditorMentionOpen(text.endsWith("@") || text.endsWith(" @"));
  }
  function addComment() {
    if (!comment.trim()) return;
    setComments((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        author: "Jordan Davis",
        text: comment.trim(),
        parentId: replyTo ?? undefined,
        timestamp: new Date().toLocaleString([], {
          dateStyle: "medium",
          timeStyle: "short",
        }),
      },
    ]);
    setComment("");
    setReplyTo(null);
    setCommentMentionOpen(false);
  }
  function beginReply(commentId: string) {
    setReplyTo(commentId);
    setComment("");
    setCommentMentionOpen(false);
    window.setTimeout(() => replyRef.current?.focus(), 0);
  }
  function attach(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    Promise.all(
      files.map(
        (file) =>
          new Promise<Attachment>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
              typeof reader.result === "string"
                ? resolve({ name: file.name, data: reader.result })
                : reject(new Error("Unable to read file"));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          }),
      ),
    ).then((attachments) => {
      setForm((current) => ({
        ...current,
        attachments: [...current.attachments, ...attachments],
        attachment: attachments[0]?.name ?? current.attachment,
        attachmentData: attachments[0]?.data ?? current.attachmentData,
      }));
    });
  }
  function format(command: string, value?: string) {
    editorRef.current?.focus();
    restoreEditorSelection();
    document.execCommand(command, false, value);
    saveEditorSelection();
    setForm((current) => ({
      ...current,
      details: editorRef.current?.innerHTML ?? current.details,
    }));
  }
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#18232f]/45 p-4"
      role="dialog"
      aria-modal="true"
    >
      <form
        noValidate
        onSubmit={(event) => onSubmit(event, form, comments)}
        className="mx-auto my-4 w-full max-w-[1040px] overflow-hidden rounded-xl bg-[#f8fafb] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#e6ebf1] bg-white px-6 py-5">
          <div>
            <h2 className="font-sans text-xl font-bold text-[#18232f]">
              {initialCard ? "Edit guide card" : "Add guide card"}
            </h2>
            <p className="mt-1 text-xs text-[#96a0ac]">
              Create a detailed task for this project.
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
        <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(280px,.8fr)] divide-x divide-[#e6ebf1] max-lg:grid-cols-1 max-lg:divide-x-0">
          <div className="grid gap-6 p-6">
            <section>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.08em] text-[#2e6ff2]">
                {projectName}
              </h3>
              <div className="grid grid-cols-[1fr_auto] items-end gap-4 max-sm:grid-cols-1">
                <Field label="Task name">
                  <input
                    className={inputClass}
                    value={form.taskName}
                    onChange={(event) => update("taskName", event.target.value)}
                    placeholder="e.g. Prepare homepage handoff"
                  />
                </Field>
                <Field label="Team name">
                  <select
                    className={inputClass}
                    value={form.teamName}
                    onChange={(event) => {
                      update("teamName", event.target.value as TeamName);
                      update("mentions", []);
                    }}
                  >
                    {teams.map((team) => (
                      <option key={team} value={team}>
                        {team}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </section>
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-[#2e6ff2]">
                  Assign Task
                </h3>
                <div className="flex flex-wrap justify-end gap-2">
                  <div className="relative">
                    <PopoverButton
                      label="Tag"
                      value={`${form.mentions.length} tagged`}
                      onClick={() => setTagOpen((value) => !value)}
                    />
                    {tagOpen && (
                      <ControlPopover>
                        <div className="grid gap-1">
                          {members.map((member) => (
                            <button
                              type="button"
                              key={member.email}
                              onClick={() =>
                                update(
                                  "mentions",
                                  form.mentions.includes(member.email)
                                    ? form.mentions.filter(
                                        (email) => email !== member.email,
                                      )
                                    : [...form.mentions, member.email],
                                )
                              }
                              className={`flex items-center gap-2 rounded-md p-2 text-left text-xs ${form.mentions.includes(member.email) ? "bg-[#edf3ff] text-[#2e6ff2]" : "hover:bg-[#f8fafb]"}`}
                            >
                              <Avatar member={member} />
                              {member.name}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setTagOpen(false)}
                            className="mt-1 rounded-md border border-[#e4e9ef] px-3 py-2 text-xs text-[#687582] hover:bg-[#f8fafb]"
                          >
                            Close
                          </button>
                        </div>
                      </ControlPopover>
                    )}
                  </div>
                  <div className="relative">
                    <PopoverButton
                      label="Deadline"
                      value={form.deadline || "Set date"}
                      onClick={() => setDateOpen((value) => !value)}
                    />
                    {dateOpen && (
                      <ControlPopover>
                        <input
                          autoFocus
                          type="date"
                          className="w-[180px] rounded-md border border-[#e4e9ef] px-2 py-2 text-xs"
                          value={form.deadline}
                          onChange={(event) => {
                            update("deadline", event.target.value);
                            setDateOpen(false);
                          }}
                        />
                      </ControlPopover>
                    )}
                  </div>
                  <div className="relative">
                    <PopoverButton
                      label="Priority"
                      value={form.priority}
                      onClick={() => setPriorityOpen((value) => !value)}
                    />
                    {priorityOpen && (
                      <ControlPopover>
                        <div className="grid gap-1">
                          {["Low", "Medium", "High", "Urgent"].map(
                            (priority) => (
                              <button
                                type="button"
                                key={priority}
                                onClick={() => {
                                  update("priority", priority);
                                  setPriorityOpen(false);
                                }}
                                className="rounded-md px-3 py-2 text-left text-xs hover:bg-[#edf3ff]"
                              >
                                {priority}
                              </button>
                            ),
                          )}
                        </div>
                      </ControlPopover>
                    )}
                  </div>
                  <div className="relative">
                    <PopoverButton
                      label="Color"
                      value="●"
                      onClick={() => setColorOpen((value) => !value)}
                    />
                    {colorOpen && (
                      <ControlPopover>
                        <div className="flex gap-2">
                          {priorityColors.map((color) => (
                            <button
                              type="button"
                              key={color}
                              aria-label={`Choose ${color}`}
                              onClick={() => {
                                update("priorityColor", color);
                                setColorOpen(false);
                              }}
                              className="size-6 rounded-full border-2 border-white ring-1 ring-[#dfe5eb]"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </ControlPopover>
                    )}
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-md border border-[#e4e9ef] bg-white">
                <div className="flex flex-wrap gap-1 border-b border-[#edf0f3] p-2">
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => format("bold")}
                    className="rounded px-2 py-1 text-xs font-bold"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => format("italic")}
                    className="rounded px-2 py-1 text-xs italic"
                  >
                    I
                  </button>
                </div>
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onMouseUp={() => {
                    saveEditorSelection();
                  }}
                  onSelect={saveEditorSelection}
                  onBlur={saveEditorSelection}
                  onInput={(event) =>
                    update("details", event.currentTarget.innerHTML)
                  }
                  onKeyUp={onEditorKeyUp}
                  className="min-h-36 p-3 text-sm text-[#26333d] outline-none"
                  data-placeholder="Write task details..."
                />
                {editorMentionOpen && (
                  <MentionMenu
                    members={members}
                    onChoose={(member) => insertMention(member, "editor")}
                  />
                )}
              </div>
              <label className="mt-4 block text-[10px] font-semibold uppercase tracking-[0.05em] text-[#7e8995]">
                File or image
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={attach}
                  className="mt-1 block w-full text-xs text-[#687582] file:mr-3 file:rounded-md file:border-0 file:bg-[#edf3ff] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#2e6ff2]"
                />
                {form.attachments.length > 0 && (
                  <span className="mt-2 block text-[10px] text-[#45b990]">
                    Attached:{" "}
                    {form.attachments.map((file) => file.name).join(", ")}
                  </span>
                )}
              </label>
            </section>
          </div>
          <aside className="grid content-start gap-6 bg-white p-6">
            <section>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-[#2e6ff2]">
                  Comments
                </h3>
                <span className="text-[10px] text-[#89939f]">
                  {comments.length}
                </span>
              </div>
              <div className="relative mt-3">
                <textarea
                  ref={commentRef}
                  className="min-h-24 w-full resize-y rounded-md border border-[#e4e9ef] p-3 text-xs text-[#26333d] outline-none focus:border-[#2e6ff2]"
                  value={comment}
                  onChange={(event) => {
                    setComment(event.target.value);
                    setCommentMentionOpen(
                      event.target.value.endsWith("@") ||
                        event.target.value.endsWith(" @"),
                    );
                  }}
                  onKeyUp={(event) => {
                    if (event.key === "@") setCommentMentionOpen(true);
                  }}
                  placeholder="Write a comment..."
                />
                {commentMentionOpen && (
                  <MentionMenu
                    members={members}
                    onChoose={(member) => insertMention(member, "comment")}
                  />
                )}
              </div>
              <div className="mt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCommentMentionOpen(true)}
                  className="text-[10px] font-semibold text-[#2e6ff2]"
                >
                  @ Mention
                </button>
                <button
                  type="button"
                  onClick={addComment}
                  className="rounded-md bg-[#edf3ff] px-3 py-2 text-xs font-semibold text-[#2e6ff2]"
                >
                  Post comment
                </button>
              </div>
              {comments.length > 0 && (
                <div className="mt-4 grid gap-2">
                  {comments.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-md border border-[#e6ebf1] p-3 ${item.parentId ? "ml-5 bg-[#f8fafb]" : "bg-white"}`}
                    >
                      <div className="flex justify-between text-[10px]">
                        <strong>{item.author}</strong>
                        <span className="text-[#89939f]">{item.timestamp}</span>
                      </div>
                      <p className="mt-1 text-xs text-[#687582]">{item.text}</p>
                      {!item.parentId && (
                        <>
                          <button
                            type="button"
                            onClick={() => beginReply(item.id)}
                            className="mt-2 text-[10px] font-semibold text-[#2e6ff2]"
                          >
                            {replyTo === item.id ? "Replying..." : "Reply"}
                          </button>
                          {replyTo === item.id && (
                            <div className="mt-3 border-t border-[#edf0f3] pt-3">
                              <textarea
                                ref={replyRef}
                                className="min-h-16 w-full resize-y rounded-md border border-[#e4e9ef] p-2 text-xs text-[#26333d] outline-none focus:border-[#2e6ff2]"
                                value={comment}
                                onChange={(event) => {
                                  setComment(event.target.value);
                                  setCommentMentionOpen(
                                    event.target.value.endsWith("@") ||
                                      event.target.value.endsWith(" @"),
                                  );
                                }}
                                placeholder="Write a reply..."
                              />
                              {commentMentionOpen && (
                                <MentionMenu
                                  members={members}
                                  onChoose={(member) =>
                                    insertMention(member, "comment")
                                  }
                                />
                              )}
                              <div className="mt-2 flex justify-between">
                                <button
                                  type="button"
                                  onClick={() => setCommentMentionOpen(true)}
                                  className="text-[10px] font-semibold text-[#2e6ff2]"
                                >
                                  @ Mention
                                </button>
                                <button
                                  type="button"
                                  onClick={addComment}
                                  className="rounded-md bg-[#edf3ff] px-3 py-1.5 text-[10px] font-semibold text-[#2e6ff2]"
                                >
                                  Post reply
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
            <section className="border-t border-[#e6ebf1] pt-5">
              <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-[#2e6ff2]">
                Activity
              </h3>
              <div className="mt-3 grid gap-3 text-xs text-[#687582]">
                <ActivityLine
                  title="Task will be assigned"
                  detail={`${form.taskName || "New task"} to ${form.teamName}`}
                />
                <ActivityLine
                  title="Created by Jordan Davis"
                  detail={new Date().toLocaleString([], {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                />
              </div>
            </section>
          </aside>
        </div>
        {formError && (
          <p className="border-t border-[#f5d1ce] bg-[#fff7f6] px-6 py-3 text-xs font-medium text-[#d8665d]">
            {formError}
          </p>
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
            Add card
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#7e8995]">
      {label}
      {children}
    </label>
  );
}
function PopoverButton({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-[#e4e9ef] bg-white px-3 py-2 text-left text-[10px] text-[#687582] shadow-sm"
    >
      <span className="block text-[9px] uppercase tracking-[0.05em] text-[#9aa4ae]">
        {label}
      </span>
      <strong className="block max-w-24 truncate text-[#26333d]">
        {value}
      </strong>
    </button>
  );
}
function ControlPopover({ children }: { children: ReactNode }) {
  return (
    <div className="absolute right-0 top-full z-40 mt-2 min-w-max rounded-lg border border-[#e6ebf1] bg-white p-3 shadow-xl">
      {children}
    </div>
  );
}
function Avatar({ member }: { member: Member }) {
  return (
    <span
      className="group relative grid size-7 place-items-center rounded-full border-2 border-white bg-[#dce8ff] text-[9px] font-bold text-[#2e6ff2]"
      title={`${member.name} · ${member.email}`}
    >
      {member.name
        .split(" ")
        .map((part) => part[0])
        .join("")}
      <span className="pointer-events-none absolute left-full top-1/2 z-20 ml-2 hidden w-max -translate-y-1/2 rounded-md bg-[#18232f] px-2 py-1 text-[10px] font-normal text-white group-hover:block">
        {member.name}
        <br />
        <span className="text-[#cbd5df]">{member.email}</span>
      </span>
    </span>
  );
}
function MentionMenu({
  members,
  onChoose,
}: {
  members: Member[];
  onChoose: (member: Member) => void;
}) {
  return (
    <div className="absolute left-0 top-full z-30 mt-1 w-full rounded-md border border-[#e6ebf1] bg-white p-2 shadow-xl">
      {members.map((member) => (
        <button
          type="button"
          key={member.email}
          onClick={() => onChoose(member)}
          className="flex w-full items-center gap-2 rounded-md p-2 text-left hover:bg-[#edf3ff]"
        >
          <Avatar member={member} />
          <span>
            <strong className="block text-xs text-[#26333d]">
              {member.name}
            </strong>
            <span className="text-[10px] text-[#89939f]">{member.email}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
function ActivityLine({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="border-l-2 border-[#dce8ff] pl-3">
      <strong className="block text-[#26333d]">{title}</strong>
      <span className="text-[10px] text-[#89939f]">{detail}</span>
    </div>
  );
}
