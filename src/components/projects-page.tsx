"use client";

import { FormEvent, useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import WorkspaceSidebar, { Icon } from "@/components/workspace-sidebar";
import ProfileMenu from "@/components/profile-menu";

type TechnologyCategory = "Frontend" | "CSS" | "Backend" | "Database";
type Project = {
  id: string;
  invoiceNumber: string;
  name: string;
  clientName: string;
  description: string;
  projectType: string;
  technologyType: string;
  technologies: Record<TechnologyCategory, string[]>;
  collectionWay: string;
  contactPerson: string;
  price: string;
  commissionAmount: string;
  commissionMode: "amount" | "percent";
  commissionPercent: string;
  salesCommissionMode: "amount" | "percent";
  commissionPlatform: string;
  salesCommission: string;
  secondSalesCommission: string;
  secondSalesPerson: string;
  discount: string;
  accountItems: AccountItem[];
  currency: string;
  bdtValue: string;
  paymentMethod: string;
  payableAmount: string;
  status: "Ongoing" | "Review" | "Done" | "Cancel";
  deliveryDate: string;
};

type ProjectForm = Omit<Project, "id">;
type AccountItem = { id: string; work: string; amount: string };
type ActivityEvent = {
  id: string;
  action: string;
  detail: string;
  profile: string;
  timestamp: string;
};

const categories: TechnologyCategory[] = [
  "Frontend",
  "CSS",
  "Backend",
  "Database",
];
const projectTypes = ["MERN", "Laravel", "Raw PHP", "WordPress", "Shopify"];
const technologyTypes = ["Frontend", "Backend", "Full Stack"];
const collectionWays = [
  "Fiverr",
  "Upwork",
  "LinkedIn",
  "Facebook",
  "Local Connection",
];
const commissionPlatforms = [
  "Fiverr",
  "Upwork",
  "LinkedIn",
  "Facebook",
  "Local Connection",
];
const salesPeople = ["Ava Morgan", "Riley Khan", "Jordan Davis"];
const currencies = ["USD", "BDT", "EUR", "GBP"];
const paymentMethods = [
  "Fiverr",
  "Upwork",
  "Bank Payment - City Bank",
  "Bank Payment - IFIC Bank",
  "Mobile Banking - Bkash",
  "Mobile Banking - Nagad",
];
const initialProjects: Project[] = [
  {
    id: "1",
    invoiceNumber: "INV-2026-001",
    name: "Website redesign",
    clientName: "Acme Corporation",
    description: "A complete redesign of the company website.",
    projectType: "MERN",
    technologyType: "Full Stack",
    technologies: {
      Frontend: ["React JS"],
      CSS: ["CSS"],
      Backend: ["Node JS"],
      Database: ["Mongo DB"],
    },
    collectionWay: "LinkedIn",
    contactPerson: "Ava Morgan",
    price: "8500",
    commissionAmount: "500",
    commissionMode: "amount",
    commissionPercent: "",
    commissionPlatform: "LinkedIn",
    salesCommission: "250",
    salesCommissionMode: "amount",
    secondSalesCommission: "0",
    secondSalesPerson: "",
    discount: "0",
    accountItems: [{ id: "1-1", work: "Website redesign", amount: "8500" }],
    currency: "USD",
    bdtValue: "",
    paymentMethod: "Upwork",
    payableAmount: "0",
    status: "Ongoing",
    deliveryDate: "2026-09-14",
  },
  {
    id: "2",
    invoiceNumber: "INV-2026-002",
    name: "Mobile app launch",
    clientName: "Northstar Labs",
    description: "Marketing site and launch support for the mobile app.",
    projectType: "MERN",
    technologyType: "Full Stack",
    technologies: {
      Frontend: ["Next JS", "TypeScript"],
      CSS: ["CSS"],
      Backend: ["Node JS"],
      Database: ["Mongo DB"],
    },
    collectionWay: "Upwork",
    contactPerson: "Riley Khan",
    price: "6200",
    commissionAmount: "620",
    commissionMode: "percent",
    commissionPercent: "10",
    commissionPlatform: "Upwork",
    salesCommission: "200",
    salesCommissionMode: "amount",
    secondSalesCommission: "0",
    secondSalesPerson: "",
    discount: "0",
    accountItems: [
      { id: "2-1", work: "Full Stack Development", amount: "6200" },
    ],
    currency: "USD",
    bdtValue: "",
    paymentMethod: "Upwork",
    payableAmount: "0",
    status: "Ongoing",
    deliveryDate: "2026-09-20",
  },
  {
    id: "3",
    invoiceNumber: "INV-2026-003",
    name: "Brand identity",
    clientName: "Lumina Studio",
    description: "Brand identity package and visual guidelines.",
    projectType: "Raw PHP",
    technologyType: "Frontend",
    technologies: {
      Frontend: ["HTML"],
      CSS: ["CSS"],
      Backend: [],
      Database: [],
    },
    collectionWay: "Local Connection",
    contactPerson: "Jordan Davis",
    price: "3800",
    commissionAmount: "0",
    commissionMode: "amount",
    commissionPercent: "",
    commissionPlatform: "Local Connection",
    salesCommission: "150",
    salesCommissionMode: "amount",
    secondSalesCommission: "0",
    secondSalesPerson: "",
    discount: "200",
    accountItems: [{ id: "3-1", work: "Brand identity", amount: "3800" }],
    currency: "USD",
    bdtValue: "",
    paymentMethod: "Bank Payment - City Bank",
    payableAmount: "0",
    status: "Ongoing",
    deliveryDate: "2026-09-08",
  },
];

const emptyForm = (): ProjectForm => ({
  invoiceNumber: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
  name: "",
  clientName: "",
  description: "",
  projectType: "MERN",
  technologyType: "Full Stack",
  technologies: {
    Frontend: [],
    CSS: [],
    Backend: [],
    Database: [],
  },
  collectionWay: "Fiverr",
  contactPerson: salesPeople[0],
  price: "",
  commissionAmount: "",
  commissionMode: "amount",
  commissionPercent: "",
  commissionPlatform: "Fiverr",
  salesCommission: "",
  salesCommissionMode: "amount",
  secondSalesCommission: "",
  secondSalesPerson: "",
  discount: "",
  accountItems: [{ id: crypto.randomUUID(), work: "", amount: "" }],
  currency: "USD",
  bdtValue: "",
  paymentMethod: "Fiverr",
  payableAmount: "",
  status: "Ongoing",
  deliveryDate: "",
});

function money(value: string, currency = "USD") {
  return value ? `${currency} ${Number(value).toLocaleString()}` : "-";
}

function projectChanges(previous: Project, next: Project) {
  const fields: Array<[keyof Project, string]> = [
    ["invoiceNumber", "Invoice number"],
    ["name", "Project name"],
    ["clientName", "Client name"],
    ["description", "Description"],
    ["projectType", "Project type"],
    ["technologyType", "Technology type"],
    ["technologies", "Technologies"],
    ["collectionWay", "Collection method"],
    ["contactPerson", "Sales person"],
    ["commissionPlatform", "Commission platform"],
    ["accountItems", "Work items"],
    ["currency", "Currency"],
    ["bdtValue", "BDT value"],
    ["paymentMethod", "Payment method"],
    ["payableAmount", "Payable amount"],
    ["discount", "Discount"],
    ["commissionMode", "Commission mode"],
    ["commissionPercent", "Commission percentage"],
    ["commissionAmount", "Commission amount"],
  ];
  return fields
    .filter(
      ([field]) =>
        JSON.stringify(previous[field]) !== JSON.stringify(next[field]),
    )
    .map(
      ([field, label]) =>
        `${label}: ${formatActivityValue(previous[field])} -> ${formatActivityValue(next[field])}`,
    )
    .join("\n");
}

function formatActivityValue(value: unknown) {
  if (value === undefined || value === "") return "empty";
  if (typeof value === "object")
    return JSON.stringify(value, (key, nestedValue) =>
      key === "id" ? undefined : nestedValue,
    );
  return String(value);
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [hydrated, setHydrated] = useState(false);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [invoiceProject, setInvoiceProject] = useState<Project | null>(null);
  const [activityProject, setActivityProject] = useState<Project | null>(null);
  const [projectPage, setProjectPage] = useState(1);
  const [activityLogs, setActivityLogs] = useState<
    Record<string, ActivityEvent[]>
  >({});
  const [customType, setCustomType] = useState("");
  const [customTechnologyType, setCustomTechnologyType] = useState("");
  const [customCollection, setCustomCollection] = useState("");
  const [customPlatform, setCustomPlatform] = useState("");
  const [customTech, setCustomTech] = useState<
    Record<TechnologyCategory, string>
  >({ Frontend: "", CSS: "", Backend: "", Database: "" });
  const [technologyOptions, setTechnologyOptions] = useState<
    Record<TechnologyCategory, string[]>
  >({
    Frontend: ["Next JS", "TypeScript", "React JS", "JavaScript", "HTML"],
    CSS: ["CSS"],
    Backend: ["Node JS"],
    Database: ["Mongo DB", "Supabase"],
  });

  useEffect(() => {
    const saved = window.localStorage.getItem("focura-projects");
    const savedActivity = window.localStorage.getItem("focura-activity");
    const timer = window.setTimeout(() => {
      if (saved) {
        const storedProjects = JSON.parse(saved) as Project[];
        setProjects(
          storedProjects.map((project) => ({
            ...project,
            status: project.status ?? "Ongoing",
            deliveryDate: project.deliveryDate ?? "",
          })),
        );
      }
      if (savedActivity) {
        setActivityLogs(
          JSON.parse(savedActivity) as Record<string, ActivityEvent[]>,
        );
      } else {
        const storedProjects = saved
          ? (JSON.parse(saved) as Project[])
          : initialProjects;
        setActivityLogs(
          Object.fromEntries(
            storedProjects.map((project) => [
              project.id,
              [
                {
                  id: `created-${project.id}`,
                  action: "Invoice created",
                  detail: `Invoice ${project.invoiceNumber} was created for ${project.name}`,
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
    if (hydrated)
      window.localStorage.setItem("focura-projects", JSON.stringify(projects));
  }, [hydrated, projects]);

  useEffect(() => {
    if (hydrated)
      window.localStorage.setItem(
        "focura-activity",
        JSON.stringify(activityLogs),
      );
  }, [activityLogs, hydrated]);

  function logActivity(projectId: string, action: string, detail: string) {
    const event: ActivityEvent = {
      id: crypto.randomUUID(),
      action,
      detail,
      profile: "Jordan Davis (Admin)",
      timestamp: new Date().toISOString(),
    };
    setActivityLogs((current) => ({
      ...current,
      [projectId]: [event, ...(current[projectId] ?? [])],
    }));
  }

  function updateField(field: keyof ProjectForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateAccountItem(
    id: string,
    field: "work" | "amount",
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      accountItems: current.accountItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function addAccountItem() {
    setForm((current) => ({
      ...current,
      accountItems: [
        ...current.accountItems,
        { id: crypto.randomUUID(), work: "", amount: "" },
      ],
    }));
  }

  function removeAccountItem(id: string) {
    setForm((current) => ({
      ...current,
      accountItems:
        current.accountItems.length > 1
          ? current.accountItems.filter((item) => item.id !== id)
          : current.accountItems,
    }));
  }

  function updateTechnology(category: TechnologyCategory, value: string) {
    setForm((current) => ({
      ...current,
      technologies: {
        ...current.technologies,
        [category]: current.technologies[category].includes(value)
          ? current.technologies[category].filter((item) => item !== value)
          : [...current.technologies[category], value],
      },
    }));
  }

  function addTechnology(category: TechnologyCategory) {
    const value = customTech[category].trim();
    if (!value) return;
    updateTechnology(category, value);
    setTechnologyOptions((current) => ({
      ...current,
      [category]: current[category].includes(value)
        ? current[category]
        : [...current[category], value],
    }));
    setCustomTech((current) => ({ ...current, [category]: "" }));
  }

  function openNew() {
    setEditingId(null);
    setForm(emptyForm());
    setIsOpen(true);
  }

  function openEdit(project: Project) {
    setEditingId(project.id);
    setForm({
      ...emptyForm(),
      ...project,
      accountItems: project.accountItems ?? [
        { id: crypto.randomUUID(), work: project.name, amount: project.price },
      ],
      technologies: { ...emptyForm().technologies, ...project.technologies },
    });
    setIsOpen(true);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const lineTotal = form.accountItems.reduce(
      (total, item) => total + (Number(item.amount) || 0),
      0,
    );
    const commissionAmount =
      form.commissionMode === "percent"
        ? lineTotal * ((Number(form.commissionPercent) || 0) / 100)
        : Number(form.commissionAmount) || 0;
    const salesCommission =
      form.salesCommissionMode === "percent"
        ? lineTotal * ((Number(form.salesCommission) || 0) / 100)
        : Number(form.salesCommission) || 0;
    const project = {
      ...form,
      price: String(lineTotal),
      commissionAmount: String(commissionAmount),
      salesCommission: String(salesCommission),
      id: editingId ?? crypto.randomUUID(),
    };
    const previousProject = editingId
      ? projects.find((item) => item.id === editingId)
      : undefined;
    logActivity(
      project.id,
      editingId ? "Project edited" : "Invoice created",
      editingId
        ? projectChanges(previousProject ?? project, project) ||
            `Updated ${project.name} and invoice ${project.invoiceNumber}`
        : `Created invoice ${project.invoiceNumber} for ${project.name}`,
    );
    setProjects((current) =>
      editingId
        ? current.map((item) => (item.id === editingId ? project : item))
        : [project, ...current],
    );
    setIsOpen(false);
  }

  function updateProjectStatus(id: string, status: Project["status"]) {
    setProjects((current) =>
      current.map((project) => (project.id === id ? { ...project, status } : project)),
    );
  }

  const paginatedProjects = projects.slice(
    (projectPage - 1) * 8,
    projectPage * 8,
  );
  const projectPageCount = Math.ceil(projects.length / 8);

  function remove(id: string) {
    if (window.confirm("Delete this project?"))
      setProjects((current) => current.filter((project) => project.id !== id));
  }

  function viewInvoice(project: Project) {
    logActivity(
      project.id,
      "Invoice viewed",
      `Viewed invoice ${project.invoiceNumber}`,
    );
    setInvoiceProject(project);
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafb]">
      <WorkspaceSidebar active="Projects" />
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
            <strong>Projects</strong>
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
                Projects
              </h1>
              <p className="mt-2 text-sm text-[#89939f]">
                Plan, track, and deliver your team&apos;s most important work.
              </p>
            </div>
            <button
              onClick={openNew}
              className="inline-flex shrink-0 items-center gap-2 rounded-[7px] bg-[#2e6ff2] px-4 py-[11px] text-[13px] font-semibold text-white shadow-[0_5px_12px_rgba(46,111,242,0.15)] hover:bg-[#1f5edd]"
            >
              <span className="text-base leading-none">+</span>Add new project
            </button>
          </div>
          <section className="overflow-hidden rounded-xl border border-[#e6ebf1] bg-white p-6 shadow-[0_12px_32px_rgba(30,55,80,0.04)] max-md:p-4">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="font-sans text-base font-bold text-[#18232f]">
                  All projects
                </h2>
                <p className="mt-1 text-xs text-[#96a0ac]">
                  Your team&apos;s active work
                </p>
              </div>
              <span className="rounded-full bg-[#edf3ff] px-2.5 py-1 text-[10px] font-semibold text-[#2e6ff2]">
                {projects.length} active
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead>
                  <tr className="text-left">
                    <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">
                      Project
                    </th>
                    <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">
                      Client
                    </th>
                    <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">
                      Type
                    </th>
                    <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">
                      Price
                    </th>
                    <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">
                      Status
                    </th>
                    <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">
                      Technology
                    </th>
                    <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">
                      Invoice
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
                  {paginatedProjects.map((project) => (
                    <tr className="border-t border-[#f0f2f4]" key={project.id}>
                      <td className="py-4">
                        <div className="flex items-center gap-2.5">
                          <span className="grid size-[29px] place-items-center rounded-lg bg-[#edf3ff] text-[9px] font-bold text-[#2e6ff2]">
                            {project.name.slice(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <strong className="block text-xs font-semibold text-[#26333d]">
                              {project.name}
                            </strong>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-xs text-[#89939f]">
                        {project.clientName}
                      </td>
                      <td>
                        <span className="rounded-full bg-[#f4f6f8] px-2 py-1 text-[10px] text-[#687582]">
                          {project.projectType}
                        </span>
                        <span className="mt-1 block text-[10px] text-[#a2abb5]">
                          {project.technologyType}
                        </span>
                      </td>
                      <td className="text-xs font-semibold text-[#26333d]">
                        {money(project.price, project.currency ?? "USD")}
                      </td>
                      <td>
                        <select
                          aria-label={`Change ${project.name} status`}
                          value={project.status ?? "Ongoing"}
                          onChange={(event) =>
                            updateProjectStatus(
                              project.id,
                              event.target.value as Project["status"],
                            )
                          }
                          className="rounded-md border border-[#e4e9ef] bg-white px-2 py-1 text-[10px] font-semibold text-[#26333d] outline-none focus:border-[#2e6ff2]"
                        >
                          <option>Ongoing</option>
                          <option>Review</option>
                          <option>Done</option>
                          <option>Cancel</option>
                        </select>
                      </td>
                      <td className="max-w-[190px] text-[10px] text-[#89939f]">
                        {categories
                          .flatMap((category) => project.technologies[category])
                          .join(", ")}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => viewInvoice(project)}
                          className="rounded-md bg-[#f4f6f8] px-2 py-1 text-[10px] font-semibold text-[#2e6ff2] hover:bg-[#edf3ff]"
                        >
                          {project.invoiceNumber}
                        </button>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(project)}
                            className="rounded-md bg-[#edf3ff] px-2 py-1 text-[10px] font-semibold text-[#2e6ff2]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => remove(project.id)}
                            className="rounded-md bg-[#fff0ef] px-2 py-1 text-[10px] font-semibold text-[#d8665d]"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => setActivityProject(project)}
                          className="rounded-md bg-[#f3f5f7] px-2 py-1 text-[10px] font-semibold text-[#687582] hover:bg-[#e9edf2]"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {projectPageCount > 1 && (
              <Pagination
                page={projectPage}
                pageCount={projectPageCount}
                onChange={setProjectPage}
              />
            )}
          </section>
        </div>
      </main>
      {isOpen && (
        <ProjectModal
          form={form}
          editing={Boolean(editingId)}
          customType={customType}
          customTechnologyType={customTechnologyType}
          customCollection={customCollection}
          customPlatform={customPlatform}
          customTech={customTech}
          technologyOptions={technologyOptions}
          setCustomType={setCustomType}
          setCustomTechnologyType={setCustomTechnologyType}
          setCustomCollection={setCustomCollection}
          setCustomPlatform={setCustomPlatform}
          setCustomTech={setCustomTech}
          updateField={updateField}
          updateTechnology={updateTechnology}
          addTechnology={addTechnology}
          updateAccountItem={updateAccountItem}
          addAccountItem={addAccountItem}
          removeAccountItem={removeAccountItem}
          onSubmit={submit}
          onClose={() => setIsOpen(false)}
        />
      )}
      {invoiceProject && (
        <InvoiceModal
          project={invoiceProject}
          onClose={() => setInvoiceProject(null)}
        />
      )}
      {activityProject && (
        <ActivityModal
          project={activityProject}
          events={activityLogs[activityProject.id] ?? []}
          onClose={() => setActivityProject(null)}
        />
      )}
    </div>
  );
}

function ProjectModal({
  form,
  editing,
  customType,
  customTechnologyType,
  customCollection,
  customPlatform,
  customTech,
  technologyOptions,
  setCustomType,
  setCustomTechnologyType,
  setCustomCollection,
  setCustomPlatform,
  setCustomTech,
  updateField,
  updateTechnology,
  addTechnology,
  updateAccountItem,
  addAccountItem,
  removeAccountItem,
  onSubmit,
  onClose,
}: {
  form: ProjectForm;
  editing: boolean;
  customType: string;
  customTechnologyType: string;
  customCollection: string;
  customPlatform: string;
  customTech: Record<TechnologyCategory, string>;
  technologyOptions: Record<TechnologyCategory, string[]>;
  setCustomType: (value: string) => void;
  setCustomTechnologyType: (value: string) => void;
  setCustomCollection: (value: string) => void;
  setCustomPlatform: (value: string) => void;
  setCustomTech: (value: Record<TechnologyCategory, string>) => void;
  updateField: (field: keyof ProjectForm, value: string) => void;
  updateTechnology: (category: TechnologyCategory, value: string) => void;
  addTechnology: (category: TechnologyCategory) => void;
  updateAccountItem: (
    id: string,
    field: "work" | "amount",
    value: string,
  ) => void;
  addAccountItem: () => void;
  removeAccountItem: (id: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}) {
  const inputClass =
    "mt-1 w-full rounded-md border border-[#e4e9ef] bg-white px-2.5 py-2 text-xs text-[#26333d] outline-none transition focus:border-[#2e6ff2] focus:ring-2 focus:ring-[#edf3ff]";
  const labelClass =
    "text-[10px] font-semibold uppercase tracking-[0.05em] text-[#7e8995]";
  const selectValue = (
    field: keyof ProjectForm,
    value: string,
    custom: string,
    setCustom: (value: string) => void,
    options: string[],
  ) => (
    <>
      <select
        className={inputClass}
        value={
          options.includes(form[field] as string)
            ? (form[field] as string)
            : "__custom"
        }
        onChange={(event) => {
          const next = event.target.value;
          if (next === "__custom") setCustom("");
          else updateField(field, next);
        }}
      >
        <option value="">Select one</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
        <option value="__custom">+ Add new</option>
      </select>
      {(!options.includes(form[field] as string) || custom) && (
        <div className="mt-2 flex gap-2">
          <input
            className={inputClass.replace("mt-1 ", "")}
            placeholder="Type a new option"
            value={custom}
            onChange={(event) => setCustom(event.target.value)}
          />
          <button
            type="button"
            className="rounded-lg bg-[#edf3ff] px-3 text-xs font-semibold text-[#2e6ff2]"
            onClick={() => {
              if (custom.trim()) {
                updateField(field, custom.trim());
                setCustom("");
              }
            }}
          >
            Add
          </button>
        </div>
      )}
    </>
  );
  const subtotal = form.accountItems.reduce(
    (total, item) => total + (Number(item.amount) || 0),
    0,
  );
  const platformCommission =
    form.commissionMode === "percent"
      ? subtotal * ((Number(form.commissionPercent) || 0) / 100)
      : Number(form.commissionAmount) || 0;
  const salesPersonCommission =
    form.salesCommissionMode === "percent"
      ? subtotal * ((Number(form.salesCommission) || 0) / 100)
      : Number(form.salesCommission) || 0;
  const totalAmount = Math.max(
    0,
    subtotal -
      platformCommission -
      salesPersonCommission -
      (Number(form.discount) || 0),
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#18232f]/45 p-4"
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={onSubmit}
        className="max-h-[92vh] w-full max-w-[920px] overflow-y-auto rounded-xl bg-[#f8fafb] shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e6ebf1] bg-white px-6 py-5 max-md:px-4">
          <div>
            <h2 className="font-sans text-xl font-bold text-[#18232f]">
              {editing ? "Edit project" : "Add new project"}
            </h2>
            <p className="mt-1 text-xs text-[#96a0ac]">
              Capture the commercial and technical project details.
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
        <div className="grid gap-5 p-6 max-md:p-4">
          <SectionHeading eyebrow="01" title="General" />
          <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
            <Field
              label="Invoice Number (Auto Generate)"
              className="bg-[#f3f5f7] py-3 text-sm"
              value={form.invoiceNumber}
              onChange={(value) => updateField("invoiceNumber", value)}
            />
            <Field
              label="Project Name"
              required
              className="py-3 text-sm"
              value={form.name}
              onChange={(value) => updateField("name", value)}
            />
            <Field
              label="Client Name"
              required
              className="py-3 text-sm"
              value={form.clientName}
              onChange={(value) => updateField("clientName", value)}
            />
          </div>
          <div>
            <label className={labelClass}>Project description</label>
            <textarea
              className={`${inputClass} min-h-[82px] resize-y`}
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              placeholder="Describe the project scope"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <div>
              <label className={labelClass}>Type of project</label>
              {selectValue(
                "projectType",
                form.projectType,
                customType,
                setCustomType,
                projectTypes,
              )}
            </div>
            <div>
              <label className={labelClass}>Technology type</label>
              {selectValue(
                "technologyType",
                form.technologyType,
                customTechnologyType,
                setCustomTechnologyType,
                technologyTypes,
              )}
            </div>
          </div>
          <SectionHeading eyebrow="02" title="Tech Info" />
          <div className="rounded-xl border border-[#e6ebf1] bg-white p-4">
            <div className="mb-3">
              <h3 className="text-sm font-bold text-[#26333d]">Technology</h3>
              <p className="mt-1 text-xs text-[#96a0ac]">
                Choose defaults or add another technology under the right
                category.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
              {categories.map((category) => (
                <div key={category}>
                  <label className={labelClass}>{category}</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {form.technologies[category].map((technology) => (
                      <button
                        type="button"
                        key={technology}
                        onClick={() => updateTechnology(category, technology)}
                        className="rounded-full bg-[#edf3ff] px-2.5 py-1 text-[10px] font-semibold text-[#2e6ff2]"
                      >
                        {technology} ×
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <select
                      className={inputClass.replace("mt-1 ", "")}
                      value=""
                      onChange={(event) => {
                        if (
                          event.target.value &&
                          !form.technologies[category].includes(
                            event.target.value,
                          )
                        )
                          updateTechnology(category, event.target.value);
                      }}
                    >
                      <option value="">Select technology</option>
                      {technologyOptions[category].map((technology) => (
                        <option key={technology} value={technology}>
                          {technology}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input
                      className={inputClass.replace("mt-1 ", "")}
                      placeholder={`Add ${category} technology`}
                      value={customTech[category]}
                      onChange={(event) =>
                        setCustomTech({
                          ...customTech,
                          [category]: event.target.value,
                        })
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addTechnology(category);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => addTechnology(category)}
                      className="rounded-lg bg-[#edf3ff] px-3 text-xs font-semibold text-[#2e6ff2]"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <SectionHeading eyebrow="03" title="Sales Info" />
          <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
            <div>
              <label className={labelClass}>Way of client collection</label>
              {selectValue(
                "collectionWay",
                form.collectionWay,
                customCollection,
                setCustomCollection,
                collectionWays,
              )}
            </div>
            <div>
              <label className={labelClass}>Sales Person</label>
              <select
                className={inputClass}
                value={form.contactPerson}
                onChange={(event) =>
                  updateField("contactPerson", event.target.value)
                }
              >
                {salesPeople.map((person) => (
                  <option key={person}>{person}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Commission platform name</label>
              {selectValue(
                "commissionPlatform",
                form.commissionPlatform,
                customPlatform,
                setCustomPlatform,
                commissionPlatforms,
              )}
            </div>
          </div>
          <SectionHeading eyebrow="04" title="Accounts" />
          <div className="mb-4">
            <Field
              label="Delivery date"
              type="date"
              value={form.deliveryDate}
              onChange={(value) => updateField("deliveryDate", value)}
            />
          </div>
          <div className="rounded-xl border border-[#e6ebf1] bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#26333d]">Work items</h3>
                <p className="mt-1 text-xs text-[#96a0ac]">
                  Add each service or expense with its amount.
                </p>
              </div>
              <button
                type="button"
                onClick={addAccountItem}
                className="rounded-md bg-[#edf3ff] px-3 py-2 text-[10px] font-semibold text-[#2e6ff2]"
              >
                + Add item
              </button>
            </div>
            <div className="grid gap-2">
              {form.accountItems.map((item, index) => (
                <div
                  className="grid grid-cols-[1fr_150px_30px] gap-2 max-sm:grid-cols-[1fr_100px_30px]"
                  key={item.id}
                >
                  <input
                    className={inputClass.replace("mt-1 ", "")}
                    placeholder={
                      index === 0
                        ? "Full Stack Development"
                        : "Domain / Hosting"
                    }
                    value={item.work}
                    onChange={(event) =>
                      updateAccountItem(item.id, "work", event.target.value)
                    }
                    required
                  />
                  <input
                    className={inputClass.replace("mt-1 ", "")}
                    type="number"
                    min="0"
                    placeholder="Amount"
                    value={item.amount}
                    onChange={(event) =>
                      updateAccountItem(item.id, "amount", event.target.value)
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeAccountItem(item.id)}
                    className="rounded-md bg-[#fff0ef] text-sm text-[#d8665d]"
                    aria-label="Remove work item"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
            <label className={labelClass}>
              Currency
              <select
                className={inputClass}
                value={form.currency}
                onChange={(event) =>
                  updateField("currency", event.target.value)
                }
              >
                {currencies.map((currency) => (
                  <option key={currency}>{currency}</option>
                ))}
              </select>
            </label>
            {form.currency !== "BDT" && (
              <Field
                label="BDT value (optional)"
                type="number"
                value={form.bdtValue}
                onChange={(value) => updateField("bdtValue", value)}
              />
            )}
            <Field
              label={
                form.commissionMode === "percent"
                  ? "Platform Commission (%)"
                  : "Platform Commission amount"
              }
              type="number"
              value={
                form.commissionMode === "percent"
                  ? form.commissionPercent
                  : form.commissionAmount
              }
              onChange={(value) =>
                updateField(
                  form.commissionMode === "percent"
                    ? "commissionPercent"
                    : "commissionAmount",
                  value,
                )
              }
            />
            <label className={labelClass}>
              Commission mode
              <select
                className={inputClass}
                value={form.commissionMode}
                onChange={(event) =>
                  updateField(
                    "commissionMode",
                    event.target.value as "amount" | "percent",
                  )
                }
              >
                <option value="amount">Manual amount</option>
                <option value="percent">Percentage of price</option>
              </select>
            </label>
            <Field
              label={
                form.salesCommissionMode === "percent"
                  ? "Sales person commission (%)"
                  : "Sales person commission amount"
              }
              type="number"
              value={form.salesCommission}
              onChange={(value) => updateField("salesCommission", value)}
            />
            <label className={labelClass}>
              Sales commission mode
              <select
                className={inputClass}
                value={form.salesCommissionMode}
                onChange={(event) =>
                  updateField(
                    "salesCommissionMode",
                    event.target.value as "amount" | "percent",
                  )
                }
              >
                <option value="amount">Flat amount</option>
                <option value="percent">Percentage of price</option>
              </select>
            </label>
            <Field
              label="Discount"
              type="number"
              value={form.discount}
              onChange={(value) => updateField("discount", value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
            <label className={labelClass}>
              Payment
              <select
                className={inputClass}
                value={form.paymentMethod}
                onChange={(event) =>
                  updateField("paymentMethod", event.target.value)
                }
              >
                {paymentMethods.map((method) => (
                  <option key={method}>{method}</option>
                ))}
              </select>
            </label>
            <Field
              label="Payable amount"
              type="number"
              value={form.payableAmount}
              onChange={(value) => updateField("payableAmount", value)}
            />
            <div className="flex items-end pb-2 text-xs text-[#7e8995]">
              Due amount{" "}
              <strong className="ml-auto text-base text-[#d8665d]">
                {money(
                  String(
                    Math.max(
                      0,
                      totalAmount - (Number(form.payableAmount) || 0),
                    ),
                  ),
                  form.currency,
                )}
              </strong>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-[#e6ebf1] bg-white p-3 max-sm:grid-cols-1">
            <div className="grid gap-1 text-xs text-[#7e8995]">
              <div className="flex items-center justify-between">
                <span>Sub total</span>
                <strong className="text-sm text-[#26333d]">
                  {money(String(subtotal), form.currency)}
                </strong>
              </div>
              <span className="text-[10px] text-[#a2abb5]">
              Platform Commission:{" "}
              {money(String(platformCommission), form.currency)}
              </span>
              <span className="text-[10px] text-[#a2abb5]">
              Sales person commission:{" "}
              {money(String(salesPersonCommission), form.currency)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-[#edf3ff] px-3 py-2 text-xs text-[#2e6ff2]">
              <span>Total amount</span>
              <strong className="text-sm">
                {money(String(totalAmount), form.currency)}
              </strong>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-[#e6ebf1] bg-white px-6 py-4 max-md:px-4">
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
            {editing ? "Save changes" : "Create project"}
          </button>
        </div>
      </form>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-[#e6ebf1] pb-2">
      <span className="text-[10px] font-bold text-[#2e6ff2]">{eyebrow}</span>
      <h3 className="font-sans text-sm font-bold text-[#26333d]">{title}</h3>
    </div>
  );
}

function Pagination({
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
      <button type="button" disabled={page === 1} onClick={() => onChange(page - 1)} className="rounded-md border border-[#e4e9ef] px-3 py-1.5 text-[10px] text-[#687582] disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
      <span className="text-[10px] text-[#89939f]">Page {page} of {pageCount}</span>
      <button type="button" disabled={page === pageCount} onClick={() => onChange(page + 1)} className="rounded-md border border-[#e4e9ef] px-3 py-1.5 text-[10px] text-[#687582] disabled:cursor-not-allowed disabled:opacity-40">Next</button>
    </div>
  );
}

function ActivityModal({
  project,
  events,
  onClose,
}: {
  project: Project;
  events: ActivityEvent[];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#18232f]/45 p-4"
      role="dialog"
      aria-modal="true"
    >
      <article className="max-h-[85vh] w-full max-w-[620px] overflow-y-auto rounded-xl bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-[#e6ebf1] px-6 py-5 max-md:px-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#2e6ff2]">
              Activity log
            </p>
            <h2 className="mt-1 font-sans text-xl font-bold text-[#18232f]">
              {project.name}
            </h2>
            <p className="mt-1 text-xs text-[#89939f]">
              Invoice {project.invoiceNumber}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg bg-[#f3f5f7] text-lg text-[#687582]"
            aria-label="Close activity log"
          >
            ×
          </button>
        </header>
        <div className="p-6 max-md:p-4">
          {events.length ? (
            <div className="grid gap-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg border border-[#e6ebf1] bg-[#f8fafb] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <strong className="text-sm font-bold text-[#26333d]">
                      {event.action}
                    </strong>
                    <time className="shrink-0 text-[10px] text-[#96a0ac]">
                      {new Date(event.timestamp).toLocaleString()}
                    </time>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-xs text-[#687582]">
                    {event.detail}
                  </p>
                  <p className="mt-2 text-[10px] font-semibold text-[#2e6ff2]">
                    Profile: {event.profile}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[#dfe5eb] px-4 py-10 text-center text-xs text-[#89939f]">
              No activity recorded for this project yet.
            </div>
          )}
        </div>
      </article>
    </div>
  );
}

function InvoiceModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const currency = project.currency ?? "USD";
  const items = project.accountItems ?? [
    { id: "legacy", work: project.name, amount: project.price },
  ];
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  );
  const commission =
    project.commissionMode === "percent"
      ? subtotal * ((Number(project.commissionPercent) || 0) / 100)
      : Number(project.commissionAmount) || 0;
  const salesPersonCommission =
    project.salesCommissionMode === "percent"
      ? subtotal * ((Number(project.salesCommission) || 0) / 100)
      : Number(project.salesCommission) || 0;
  const total = Math.max(
    0,
    subtotal -
      commission -
      salesPersonCommission -
      (Number(project.discount) || 0),
  );
  const payable = Number(project.payableAmount) || 0;
  const due = Math.max(0, total - payable);
  const technologies = categories.flatMap(
    (category) => project.technologies?.[category] ?? [],
  );
  function downloadInvoice() {
    const pdf = new jsPDF();
    const left = 18;
    let y = 22;
    const line = (label: string, value: string) => {
      if (y > 275) {
        pdf.addPage();
        y = 22;
      }
      pdf.setFont("helvetica", "bold");
      pdf.text(label, left, y);
      pdf.setFont("helvetica", "normal");
      const wrapped = pdf.splitTextToSize(value || "-", 155);
      pdf.text(wrapped, left + 42, y);
      y += Math.max(7, wrapped.length * 5);
    };
    pdf.setFillColor(46, 111, 242);
    pdf.rect(0, 0, 210, 8, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.text("Focura", left, y);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      "Dhaka, Bangladesh | hello@focura.com | +880 1XXX-XXXXXX",
      left,
      y + 7,
    );
    pdf.setFont("helvetica", "bold");
    pdf.text(`INVOICE  ${project.invoiceNumber}`, 135, y);
    y += 25;
    pdf.setDrawColor(225, 230, 236);
    pdf.line(left, y - 5, 192, y - 5);
    pdf.setFontSize(10);
    line("Project", project.name);
    line("Client", project.clientName);
    line("Description", project.description);
    line("Project type", `${project.projectType} / ${project.technologyType}`);
    line("Technology", technologies.join(", "));
    line("Sales person", project.contactPerson);
    line("Collection", project.collectionWay);
    line("Commission platform", project.commissionPlatform);
    line("Payment", project.paymentMethod ?? "-");
    y += 3;
    pdf.setFont("helvetica", "bold");
    pdf.text("WORK / SERVICE", left, y);
    pdf.text("AMOUNT", 165, y);
    y += 7;
    pdf.setFont("helvetica", "normal");
    items.forEach((item) => {
      const wrapped = pdf.splitTextToSize(item.work || "Untitled item", 135);
      pdf.text(wrapped, left, y);
      pdf.text(money(item.amount, currency), 165, y);
      y += Math.max(7, wrapped.length * 5);
    });
    y += 3;
    pdf.line(left, y - 4, 192, y - 4);
    line("Sub total", money(String(subtotal), currency));
    line("Commission", `- ${money(String(commission), currency)}`);
    line("Discount", `- ${money(project.discount, currency)}`);
    line("Payable amount", money(String(payable), currency));
    line("Due amount", money(String(due), currency));
    y += 3;
    pdf.setFillColor(237, 243, 255);
    pdf.roundedRect(left, y - 5, 174, 13, 2, 2, "F");
    pdf.setTextColor(46, 111, 242);
    pdf.setFont("helvetica", "bold");
    pdf.text("TOTAL AMOUNT", left + 5, y + 3);
    pdf.text(money(String(total), currency), 155, y + 3);
    pdf.save(`${project.invoiceNumber}.pdf`);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#18232f]/45 p-4"
      role="dialog"
      aria-modal="true"
    >
      <article className="max-h-[92vh] w-full max-w-[780px] overflow-y-auto rounded-xl bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-[#e6ebf1] px-7 py-6 max-md:px-4">
          <div>
            <p className="font-sans text-xl font-bold tracking-[-0.5px] text-[#18232f]">
              Focura
            </p>
            <p className="mt-1 text-[11px] text-[#687582]">Dhaka, Bangladesh</p>
            <p className="text-[11px] text-[#687582]">
              hello@focura.com · +880 1XXX-XXXXXX
            </p>
          </div>
          <div className="flex items-start gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#2e6ff2]">
                Invoice
              </p>
              <h2 className="mt-1 font-sans text-xl font-bold text-[#18232f]">
                {project.invoiceNumber}
              </h2>
              <p className="mt-1 text-xs text-[#89939f]">Project invoice</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid size-8 place-items-center rounded-lg bg-[#f3f5f7] text-lg text-[#687582]"
              aria-label="Close invoice"
            >
              ×
            </button>
          </div>
        </header>
        <div className="grid gap-5 p-7 max-md:p-4">
          <div className="grid grid-cols-3 gap-4 rounded-lg bg-[#f8fafb] p-4 max-md:grid-cols-1">
            <InvoiceValue label="Project name" value={project.name} />
            <InvoiceValue label="Client name" value={project.clientName} />
            <InvoiceValue label="Sales person" value={project.contactPerson} />
          </div>
          <InvoiceSection title="General">
            <InvoiceValue
              label="Description"
              value={project.description || "-"}
            />
            <InvoiceValue label="Project type" value={project.projectType} />
            <InvoiceValue
              label="Technology type"
              value={project.technologyType}
            />
          </InvoiceSection>
          <InvoiceSection title="Technology">
            <InvoiceValue
              label="Technologies"
              value={technologies.join(", ") || "-"}
            />
          </InvoiceSection>
          <section>
            <h3 className="mb-3 font-sans text-sm font-bold text-[#26333d]">
              Sales Info
            </h3>
            <div className="grid grid-cols-3 gap-3 rounded-lg border border-[#e6ebf1] p-4 max-md:grid-cols-1">
              <InvoiceValue label="Collection" value={project.collectionWay} />
              <InvoiceValue
                label="Commission platform"
                value={project.commissionPlatform}
              />
              <InvoiceValue
                label="Payment method"
                value={project.paymentMethod ?? "-"}
              />
            </div>
          </section>
          <InvoiceSection title="Accounts">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#e6ebf1] text-[10px] uppercase text-[#a2abb5]">
                    <th className="pb-2">Work / service</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-[#f0f2f4]">
                      <td className="py-2 text-[#687582]">
                        {item.work || "Untitled item"}
                      </td>
                      <td className="py-2 text-right font-semibold text-[#26333d]">
                        {money(item.amount, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 grid gap-2 text-xs">
              <InvoiceLine
                label="Sub total"
                value={money(String(subtotal), currency)}
              />
              <InvoiceLine
                label={`Commission (${project.commissionMode === "percent" ? `${project.commissionPercent}%` : "manual"})`}
                value={`- ${money(String(commission), currency)}`}
              />
              <InvoiceLine
                label="Discount"
                value={`- ${money(project.discount, currency)}`}
              />
              <InvoiceLine
                label="Payable amount"
                value={money(String(payable), currency)}
              />
              <InvoiceLine
                label="Due amount"
                value={money(String(due), currency)}
              />
              <div className="mt-2 flex justify-between rounded-lg bg-[#edf3ff] px-3 py-3 font-semibold text-[#2e6ff2]">
                <span>Total amount</span>
                <strong>{money(String(total), currency)}</strong>
              </div>
            </div>
          </InvoiceSection>
        </div>
        <footer className="flex justify-end gap-3 border-t border-[#e6ebf1] px-7 py-4 max-md:px-4">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg border border-[#e1e6ec] bg-white px-4 py-2.5 text-xs font-semibold text-[#687582]"
          >
            Print invoice
          </button>
          <button
            type="button"
            onClick={downloadInvoice}
            className="rounded-lg bg-[#2e6ff2] px-4 py-2.5 text-xs font-semibold text-white"
          >
            Download invoice
          </button>
        </footer>
      </article>
    </div>
  );
}

function InvoiceSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 font-sans text-sm font-bold text-[#26333d]">
        {title}
      </h3>
      <div className="grid gap-3 rounded-lg border border-[#e6ebf1] p-4">
        {children}
      </div>
    </section>
  );
}

function InvoiceValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block text-[10px] font-semibold uppercase tracking-[0.05em] text-[#a2abb5]">
        {label}
      </span>
      <strong className="mt-1 block text-xs text-[#26333d]">{value}</strong>
    </div>
  );
}

function InvoiceLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[#687582]">
      <span>{label}</span>
      <strong className="text-[#26333d]">{value}</strong>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#7e8995]">
      {label}
      {required && <span className="text-[#e56f62]"> *</span>}
      <input
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-1 w-full rounded-md border border-[#e4e9ef] px-2.5 py-2 text-xs font-normal normal-case tracking-normal text-[#26333d] outline-none focus:border-[#2e6ff2] focus:ring-2 focus:ring-[#edf3ff] ${className}`}
      />
    </label>
  );
}
