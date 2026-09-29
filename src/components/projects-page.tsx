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
  cashReceivedBy?: string;
  status: "Ongoing" | "Review" | "Done" | "Cancel";
  deliveryDate: string;
};

type ProjectForm = Omit<Project, "id">;
type AccountItem = { id: string; work: string; amount: string };
type ClientRecord = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  source: string;
};
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
const clientSourceOptions = [
  "Fiverr",
  "Upwork",
  "LinkedIn",
  "Facebook",
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
const paymentMethods = ["Bkash", "Bank", "Cash"];
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
  paymentMethod: "",
  payableAmount: "",
  cashReceivedBy: "",
  status: "Ongoing",
  deliveryDate: "",
});

function money(value: string, currency = "USD") {
  return value ? `${currency} ${Number(value).toLocaleString()}` : "-";
}

function getProjectPaymentSummary(project: Project | ProjectForm) {
  const accountItems = project.accountItems ?? [
    { id: "legacy", work: project.name, amount: project.price },
  ];
  const subtotal = accountItems.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  );
  const commission =
    project.commissionMode === "percent"
      ? subtotal * ((Number(project.commissionPercent) || 0) / 100)
      : Number(project.commissionAmount) || 0;
  const salesCommission =
    project.salesCommissionMode === "percent"
      ? subtotal * ((Number(project.salesCommission) || 0) / 100)
      : Number(project.salesCommission) || 0;
  const totalAmount = Math.max(
    0,
    subtotal - commission - salesCommission - (Number(project.discount) || 0),
  );
  const paidAmount = Math.max(0, Number(project.payableAmount) || 0);
  const dueAmount = Math.max(0, totalAmount - paidAmount);

  return {
    totalAmount,
    paidAmount,
    dueAmount,
    paymentStatus: dueAmount === 0 ? "Paid" : "Due",
  };
}

function projectChanges(previous: Project, next: Project) {
  const fields: Array<[keyof Project, string]> = [
    ["invoiceNumber", "Invoice number"],
    ["name", "Project name"],
    ["clientName", "Client name"],
    ["description", "Description"],
    ["projectType", "Project type"],
    ["technologyType", "Project Type"],
    ["technologies", "Technologies"],
    ["collectionWay", "Collection method"],
    ["contactPerson", "Sales person"],
    ["commissionPlatform", "Commission platform"],
    ["accountItems", "Work items"],
    ["currency", "Currency"],
    ["bdtValue", "BDT value"],
    ["paymentMethod", "Payment method"],
    ["payableAmount", "Pay amount"],
    ["cashReceivedBy", "Cash received by"],
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

function ProjectTable({
  projects,
  emptyMessage,
  onStatusChange,
  onInvoice,
  onEdit,
  onDelete,
  onActivity,
}: {
  projects: Project[];
  emptyMessage: string;
  onStatusChange: (id: string, status: Project["status"]) => void;
  onInvoice: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onActivity: (project: Project) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px]">
        <thead>
          <tr className="text-left">
            {["Project", "Client", "Type", "Due amount", "Status", "Technology", "Invoice", "Action", "Activity log"].map((heading) => (
              <th key={heading} className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {projects.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-8 text-center text-xs text-[#89939f]">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            projects.map((project) => (
              <tr className="border-t border-[#f0f2f4]" key={project.id}>
                <td className="py-4">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-[29px] place-items-center rounded-lg bg-[#edf3ff] text-[9px] font-bold text-[#2e6ff2]">
                      {project.name.slice(0, 2).toUpperCase()}
                    </span>
                    <strong className="block text-xs font-semibold text-[#26333d]">
                      {project.name}
                    </strong>
                  </div>
                </td>
                <td className="py-4 text-xs text-[#89939f]">{project.clientName}</td>
                <td>
                  <span className="rounded-full bg-[#f4f6f8] px-2 py-1 text-[10px] text-[#687582]">
                    {project.projectType}
                  </span>
                  <span className="mt-1 block text-[10px] text-[#a2abb5]">
                    {project.technologyType}
                  </span>
                </td>
                <td className="py-3 text-xs font-semibold text-[#26333d]">
                  <span>{money(String(getProjectPaymentSummary(project).dueAmount), project.currency ?? "USD")}</span>
                  <span className={`mt-1 block text-[9px] font-semibold ${getProjectPaymentSummary(project).paymentStatus === "Paid" ? "text-[#238d68]" : "text-[#d58b35]"}`}>
                    {getProjectPaymentSummary(project).paymentStatus}
                  </span>
                </td>
                <td>
                  <select
                    aria-label={`Change ${project.name} status`}
                    value={project.status ?? "Ongoing"}
                    onChange={(event) =>
                      onStatusChange(project.id, event.target.value as Project["status"])
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
                    onClick={() => onInvoice(project)}
                    className="rounded-md bg-[#f4f6f8] px-2 py-1 text-[10px] font-semibold text-[#2e6ff2] hover:bg-[#edf3ff]"
                  >
                    {project.invoiceNumber}
                  </button>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(project)}
                      className="rounded-md bg-[#edf3ff] px-2 py-1 text-[10px] font-semibold text-[#2e6ff2]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(project.id)}
                      className="rounded-md bg-[#fff0ef] px-2 py-1 text-[10px] font-semibold text-[#d8665d]"
                    >
                      Delete
                    </button>
                  </div>
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => onActivity(project)}
                    className="rounded-md bg-[#f3f5f7] px-2 py-1 text-[10px] font-semibold text-[#687582] hover:bg-[#e9edf2]"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [viewMode, setViewMode] = useState<"projects" | "clients">("projects");
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientForm, setClientForm] = useState<ClientRecord>({
    id: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    source: "Fiverr",
  });
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [clientSourceList, setClientSourceList] = useState<string[]>(clientSourceOptions);
  const [invoiceProject, setInvoiceProject] = useState<Project | null>(null);
  const [activityProject, setActivityProject] = useState<Project | null>(null);
  const [ongoingPage, setOngoingPage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const [activityLogs, setActivityLogs] = useState<
    Record<string, ActivityEvent[]>
  >({});
  const [projectTypeOptions, setProjectTypeOptions] = useState<string[]>(projectTypes);
  const [technologyTypeOptions, setTechnologyTypeOptions] = useState<string[]>(technologyTypes);
  const [commissionPlatformOptions, setCommissionPlatformOptions] = useState<string[]>(commissionPlatforms);
  const [clientNameOptions, setClientNameOptions] = useState<string[]>([]);
  const [customClientName, setCustomClientName] = useState("");
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
    const savedClients = window.localStorage.getItem("focura-clients");
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
      if (savedClients) {
        const storedClients = JSON.parse(savedClients) as ClientRecord[];
        setClients(storedClients);
        setClientNameOptions(
          Array.from(new Set([...storedClients.map((client) => client.name)])),
        );
        setClientSourceList(
          Array.from(
            new Set([
              ...clientSourceOptions,
              ...storedClients.map((client) => client.source),
            ]),
          ),
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
      window.localStorage.setItem("focura-clients", JSON.stringify(clients));
  }, [clients, hydrated]);

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

  function openNewClient() {
    setEditingClientId(null);
    setClientForm({
      id: "",
      name: "",
      phone: "",
      email: "",
      address: "",
      source: clientSourceList[0] ?? "Fiverr",
    });
    setIsClientModalOpen(true);
  }

  useEffect(() => {
    if (clients.length) {
      setClientNameOptions(
        Array.from(new Set([...clients.map((client) => client.name)])),
      );
    }
  }, [clients]);

  function openEditClient(client: ClientRecord) {
    setEditingClientId(client.id);
    setClientForm(client);
    setIsClientModalOpen(true);
  }

  function saveClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedClient = {
      ...clientForm,
      name: clientForm.name.trim(),
      phone: clientForm.phone.trim(),
      email: clientForm.email.trim(),
      address: clientForm.address.trim(),
      source: clientForm.source.trim(),
    };

    if (!trimmedClient.name || !trimmedClient.source) {
      return;
    }

    setClients((current) => {
      const next = editingClientId
        ? current.map((item) =>
            item.id === editingClientId ? { ...trimmedClient, id: item.id } : item,
          )
        : [{ ...trimmedClient, id: crypto.randomUUID() }, ...current];

      const nextSources = Array.from(
        new Set([...clientSourceList, trimmedClient.source]),
      );
      setClientSourceList(nextSources);
      setClientNameOptions(
        Array.from(new Set([...next.map((client) => client.name)])),
      );
      return next;
    });

    setIsClientModalOpen(false);
    setClientForm({
      id: "",
      name: "",
      phone: "",
      email: "",
      address: "",
      source: clientSourceList[0] ?? "Fiverr",
    });
    setEditingClientId(null);
  }

  function deleteClient(id: string) {
    if (window.confirm("Delete this client?")) {
      setClients((current) => current.filter((client) => client.id !== id));
    }
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
    setOngoingPage(1);
    setCompletedPage(1);
  }

  const ongoingProjects = projects.filter(
    (project) => project.status === "Ongoing" || project.status === "Review",
  );
  const completedProjects = projects.filter(
    (project) => project.status === "Done" || project.status === "Cancel",
  );
  const paginatedProjects = ongoingProjects.slice(
    (ongoingPage - 1) * 5,
    ongoingPage * 5,
  );
  const paginatedCompletedProjects = completedProjects.slice(
    (completedPage - 1) * 5,
    completedPage * 5,
  );
  const projectPageCount = Math.ceil(ongoingProjects.length / 5);
  const completedPageCount = Math.ceil(completedProjects.length / 5);

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
            <strong className="text-[#26333d]">Projects</strong>
          </div>
          <div className="flex items-center gap-4">
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
            <div className="flex items-center gap-2">
              <button
                onClick={openNewClient}
                className="inline-flex shrink-0 items-center gap-2 rounded-[7px] border border-[#dfe5eb] bg-white px-4 py-[11px] text-[13px] font-semibold text-[#2e6ff2] hover:border-[#2e6ff2]"
              >
                <span className="text-base leading-none">+</span>Add New Client
              </button>
              <button
                onClick={openNew}
                className="inline-flex shrink-0 items-center gap-2 rounded-[7px] bg-[#2e6ff2] px-4 py-[11px] text-[13px] font-semibold text-white shadow-[0_5px_12px_rgba(46,111,242,0.15)] hover:bg-[#1f5edd]"
              >
                <span className="text-base leading-none">+</span>Add new project
              </button>
            </div>
          </div>
          <section className="overflow-hidden rounded-xl border border-[#e6ebf1] bg-white p-6 shadow-[0_12px_32px_rgba(30,55,80,0.04)] max-md:p-4">
            <div className="mb-6 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-[#f3f5f7] p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("projects")}
                  className={viewMode === "projects" ? "rounded-md bg-white px-3 py-1.5 text-[11px] font-semibold text-[#2e6ff2] shadow-sm" : "rounded-md px-3 py-1.5 text-[11px] font-semibold text-[#687582]"}
                >
                  All projects
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("clients")}
                  className={viewMode === "clients" ? "rounded-md bg-white px-3 py-1.5 text-[11px] font-semibold text-[#2e6ff2] shadow-sm" : "rounded-md px-3 py-1.5 text-[11px] font-semibold text-[#687582]"}
                >
                  All Clients
                </button>
              </div>
              {viewMode === "projects" && (
                <span className="rounded-full bg-[#edf3ff] px-2.5 py-1 text-[10px] font-semibold text-[#2e6ff2]">
                  {ongoingProjects.length} ongoing
                </span>
              )}
            </div>

            {viewMode === "projects" ? (
              <>
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
                          Due amount
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
                          <td className="py-3 text-xs font-semibold text-[#26333d]">
                            <span>{money(String(getProjectPaymentSummary(project).dueAmount), project.currency ?? "USD")}</span>
                            <span className={`mt-1 block text-[9px] font-semibold ${getProjectPaymentSummary(project).paymentStatus === "Paid" ? "text-[#238d68]" : "text-[#d58b35]"}`}>
                              {getProjectPaymentSummary(project).paymentStatus}
                            </span>
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
                    page={ongoingPage}
                    pageCount={projectPageCount}
                    onChange={setOngoingPage}
                  />
                )}
                <div className="mt-10 border-t border-[#e6ebf1] pt-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-bold text-[#26333d]">
                        Completed Projects
                      </h2>
                      <p className="mt-1 text-xs text-[#89939f]">
                        Finished and cancelled projects
                      </p>
                    </div>
                    <span className="rounded-full bg-[#f3f5f7] px-2.5 py-1 text-[10px] font-semibold text-[#687582]">
                      {completedProjects.length} completed
                    </span>
                  </div>
                  <ProjectTable
                    projects={paginatedCompletedProjects}
                    emptyMessage="No completed projects yet."
                    onStatusChange={updateProjectStatus}
                    onInvoice={viewInvoice}
                    onEdit={openEdit}
                    onDelete={remove}
                    onActivity={setActivityProject}
                  />
                  {completedPageCount > 1 && (
                    <Pagination
                      page={completedPage}
                      pageCount={completedPageCount}
                      onChange={setCompletedPage}
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead>
                    <tr className="text-left">
                      <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">
                        Client name
                      </th>
                      <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">
                        Phone
                      </th>
                      <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">
                        Email
                      </th>
                      <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">
                        Address
                      </th>
                      <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">
                        Source
                      </th>
                      <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-xs text-[#89939f]">
                          No clients yet. Add your first client to begin.
                        </td>
                      </tr>
                    ) : (
                      clients.map((client) => (
                        <tr key={client.id} className="border-t border-[#f0f2f4]">
                          <td className="py-3 text-sm font-semibold text-[#26333d]">{client.name}</td>
                          <td className="py-3 text-xs text-[#687582]">{client.phone || "—"}</td>
                          <td className="py-3 text-xs text-[#687582]">{client.email || "—"}</td>
                          <td className="py-3 text-xs text-[#687582]">{client.address || "—"}</td>
                          <td className="py-3">
                            <span className="rounded-full bg-[#edf3ff] px-2 py-1 text-[10px] font-semibold text-[#2e6ff2]">
                              {client.source}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEditClient(client)}
                                className="rounded-md bg-[#edf3ff] px-2 py-1 text-[10px] font-semibold text-[#2e6ff2]"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteClient(client.id)}
                                className="rounded-md bg-[#fff0ef] px-2 py-1 text-[10px] font-semibold text-[#d8665d]"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
      {isOpen && (
        <ProjectModal
          form={form}
          editing={Boolean(editingId)}
          clientNameOptions={clientNameOptions}
          projectTypeOptions={projectTypeOptions}
          technologyTypeOptions={technologyTypeOptions}
          commissionPlatformOptions={commissionPlatformOptions}
          customClientName={customClientName}
          customType={customType}
          customTechnologyType={customTechnologyType}
          customCollection={customCollection}
          customPlatform={customPlatform}
          customTech={customTech}
          technologyOptions={technologyOptions}
          setCustomClientName={setCustomClientName}
          setCustomType={setCustomType}
          setCustomTechnologyType={setCustomTechnologyType}
          setCustomCollection={setCustomCollection}
          setCustomPlatform={setCustomPlatform}
          setCustomTech={setCustomTech}
          addProjectType={(value) => {
            const next = value.trim();
            if (!next) return;
            setProjectTypeOptions((current) =>
              current.includes(next) ? current : [...current, next],
            );
            updateField("projectType", next);
            setCustomType("");
          }}
          addTechnologyType={(value) => {
            const next = value.trim();
            if (!next) return;
            setTechnologyTypeOptions((current) =>
              current.includes(next) ? current : [...current, next],
            );
            updateField("technologyType", next);
            setCustomTechnologyType("");
          }}
          addCommissionPlatform={(value) => {
            const next = value.trim();
            if (!next) return;
            setCommissionPlatformOptions((current) =>
              current.includes(next) ? current : [...current, next],
            );
            updateField("commissionPlatform", next);
            setCustomPlatform("");
          }}
          setClientName={(value) => updateField("clientName", value)}
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
      {isClientModalOpen && (
        <ClientModal
          form={clientForm}
          sourceOptions={clientSourceList}
          editing={Boolean(editingClientId)}
          onChange={(field, value) =>
            setClientForm((current) => ({ ...current, [field]: value }))
          }
          onSourceAdd={(value) => {
            const next = value.trim();
            if (!next) return;
            setClientSourceList((current) =>
              current.includes(next) ? current : [...current, next],
            );
            setClientForm((current) => ({ ...current, source: next }));
          }}
          onSubmit={saveClient}
          onClose={() => {
            setIsClientModalOpen(false);
            setEditingClientId(null);
          }}
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
  clientNameOptions,
  projectTypeOptions,
  technologyTypeOptions,
  commissionPlatformOptions,
  customClientName,
  customType,
  customTechnologyType,
  customCollection,
  customPlatform,
  customTech,
  technologyOptions,
  setCustomClientName,
  setCustomType,
  setCustomTechnologyType,
  setCustomCollection,
  setCustomPlatform,
  setCustomTech,
  addProjectType,
  addTechnologyType,
  addCommissionPlatform,
  setClientName,
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
  clientNameOptions: string[];
  projectTypeOptions: string[];
  technologyTypeOptions: string[];
  commissionPlatformOptions: string[];
  customClientName: string;
  customType: string;
  customTechnologyType: string;
  customCollection: string;
  customPlatform: string;
  customTech: Record<TechnologyCategory, string>;
  technologyOptions: Record<TechnologyCategory, string[]>;
  setCustomClientName: (value: string) => void;
  setCustomType: (value: string) => void;
  setCustomTechnologyType: (value: string) => void;
  setCustomCollection: (value: string) => void;
  setCustomPlatform: (value: string) => void;
  setCustomTech: (value: Record<TechnologyCategory, string>) => void;
  addProjectType: (value: string) => void;
  addTechnologyType: (value: string) => void;
  addCommissionPlatform: (value: string) => void;
  setClientName: (value: string) => void;
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
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const [projectTypeDropdownOpen, setProjectTypeDropdownOpen] = useState(false);
  const [technologyTypeDropdownOpen, setTechnologyTypeDropdownOpen] =
    useState(false);
  const [technologyDropdownOpen, setTechnologyDropdownOpen] = useState<
    Record<TechnologyCategory, boolean>
  >({ Frontend: false, CSS: false, Backend: false, Database: false });
  const filteredClientNames = clientNameOptions.filter((name) =>
    name.toLowerCase().includes(form.clientName.toLowerCase()),
  );
  const filteredProjectTypes = projectTypeOptions.filter((type) =>
    type.toLowerCase().includes(form.projectType.toLowerCase()),
  );
  const filteredTechnologyTypes = technologyTypeOptions.filter((type) =>
    type.toLowerCase().includes(form.technologyType.toLowerCase()),
  );
  const selectValue = (
    field: keyof ProjectForm,
    value: string,
    custom: string,
    setCustom: (value: string) => void,
    options: string[],
    onAdd: (value: string) => void,
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
          if (next === "__custom") {
            setCustom("");
            return;
          }
          updateField(field, next);
        }}
      >
        <option value="">Select one</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
        <option value="__custom">+ Add new</option>
      </select>
      {(custom || !options.includes(form[field] as string)) && (
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
                onAdd(custom.trim());
              }
            }}
          >
            Add
          </button>
        </div>
      )}
    </>
  );
  const { totalAmount, dueAmount, paymentStatus } =
    getProjectPaymentSummary(form);

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
            <div>
              <label className={labelClass}>Client Name</label>
              <div className="relative">
                <input
                  className={`${inputClass} pr-9`}
                  placeholder="Select or type a client name"
                  value={form.clientName}
                  onFocus={() => setClientDropdownOpen(true)}
                  onBlur={() =>
                    window.setTimeout(() => setClientDropdownOpen(false), 150)
                  }
                  onChange={(event) => {
                    setClientName(event.target.value);
                    setClientDropdownOpen(true);
                  }}
                  required
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 border-x-[4px] border-t-[5px] border-x-transparent border-t-[#8d99a6]">
                </span>
                {clientDropdownOpen && (
                  <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-lg border border-[#e1e7ee] bg-white p-1.5 shadow-[0_12px_30px_rgba(24,35,47,0.14)]">
                    {filteredClientNames.length > 0 ? (
                      filteredClientNames.map((name) => (
                        <button
                          key={name}
                          type="button"
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium text-[#344352] transition hover:bg-[#f1f5ff] hover:text-[#2e6ff2]"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            setClientName(name);
                            setClientDropdownOpen(false);
                          }}
                        >
                          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#edf3ff] text-[10px] font-bold text-[#2e6ff2]">
                            {name.charAt(0).toUpperCase()}
                          </span>
                          <span className="truncate">{name}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2.5 text-xs text-[#8d99a6]">
                        No matching client
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
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
              <div className="relative">
                <input
                  className={`${inputClass} pr-9`}
                  placeholder="Select or type a project type"
                  value={form.projectType}
                  onFocus={() => setProjectTypeDropdownOpen(true)}
                  onBlur={() =>
                    window.setTimeout(
                      () => setProjectTypeDropdownOpen(false),
                      150,
                    )
                  }
                  onChange={(event) => {
                    updateField("projectType", event.target.value);
                    setProjectTypeDropdownOpen(true);
                  }}
                  required
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 border-x-[4px] border-t-[5px] border-x-transparent border-t-[#8d99a6]" />
                {projectTypeDropdownOpen && (
                  <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-lg border border-[#e1e7ee] bg-white p-1.5 shadow-[0_12px_30px_rgba(24,35,47,0.14)]">
                    {filteredProjectTypes.length > 0 ? (
                      filteredProjectTypes.map((type) => (
                        <button
                          key={type}
                          type="button"
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium text-[#344352] transition hover:bg-[#f1f5ff] hover:text-[#2e6ff2]"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            updateField("projectType", type);
                            setProjectTypeDropdownOpen(false);
                          }}
                        >
                          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#edf3ff] text-[10px] font-bold text-[#2e6ff2]">
                            {type.charAt(0).toUpperCase()}
                          </span>
                          <span className="truncate">{type}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2.5 text-xs text-[#8d99a6]">
                        No matching project type
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className={labelClass}>Project Type</label>
              <div className="relative">
                <input
                  className={`${inputClass} pr-9`}
                  placeholder="Select or type a project type"
                  value={form.technologyType}
                  onFocus={() => setTechnologyTypeDropdownOpen(true)}
                  onBlur={() =>
                    window.setTimeout(
                      () => setTechnologyTypeDropdownOpen(false),
                      150,
                    )
                  }
                  onChange={(event) => {
                    updateField("technologyType", event.target.value);
                    setTechnologyTypeDropdownOpen(true);
                  }}
                  required
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 border-x-[4px] border-t-[5px] border-x-transparent border-t-[#8d99a6]" />
                {technologyTypeDropdownOpen && (
                  <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-lg border border-[#e1e7ee] bg-white p-1.5 shadow-[0_12px_30px_rgba(24,35,47,0.14)]">
                    {filteredTechnologyTypes.length > 0 ? (
                      filteredTechnologyTypes.map((type) => (
                        <button
                          key={type}
                          type="button"
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium text-[#344352] transition hover:bg-[#f1f5ff] hover:text-[#2e6ff2]"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            updateField("technologyType", type);
                            setTechnologyTypeDropdownOpen(false);
                          }}
                        >
                          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#edf3ff] text-[10px] font-bold text-[#2e6ff2]">
                            {type.charAt(0).toUpperCase()}
                          </span>
                          <span className="truncate">{type}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2.5 text-xs text-[#8d99a6]">
                        No matching project type
                      </div>
                    )}
                  </div>
                )}
              </div>
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
                  <div className="relative mt-2 flex gap-2">
                    <input
                      className={inputClass.replace("mt-1 ", "")}
                      placeholder={`Select or type ${category} technology`}
                      value={customTech[category]}
                      onFocus={() =>
                        setTechnologyDropdownOpen((current) => ({
                          ...current,
                          [category]: true,
                        }))
                      }
                      onBlur={() =>
                        window.setTimeout(
                          () =>
                            setTechnologyDropdownOpen((current) => ({
                              ...current,
                              [category]: false,
                            })),
                          150,
                        )
                      }
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
                    <span className="pointer-events-none absolute right-[58px] top-1/2 -translate-y-1/2 border-x-[4px] border-t-[5px] border-x-transparent border-t-[#8d99a6]" />
                    {technologyDropdownOpen[category] && (
                      <div className="absolute left-0 right-[48px] top-[calc(100%+6px)] z-20 overflow-hidden rounded-lg border border-[#e1e7ee] bg-white p-1.5 shadow-[0_12px_30px_rgba(24,35,47,0.14)]">
                        {technologyOptions[category].filter((technology) =>
                          technology
                            .toLowerCase()
                            .includes(customTech[category].toLowerCase()),
                        ).length > 0 ? (
                          technologyOptions[category]
                            .filter((technology) =>
                              technology
                                .toLowerCase()
                                .includes(customTech[category].toLowerCase()),
                            )
                            .map((technology) => (
                              <button
                                key={technology}
                                type="button"
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium text-[#344352] transition hover:bg-[#f1f5ff] hover:text-[#2e6ff2]"
                                onMouseDown={(event) =>
                                  event.preventDefault()
                                }
                                onClick={() => {
                                  if (
                                    !form.technologies[category].includes(
                                      technology,
                                    )
                                  )
                                    updateTechnology(category, technology);
                                  setCustomTech({
                                    ...customTech,
                                    [category]: "",
                                  });
                                  setTechnologyDropdownOpen((current) => ({
                                    ...current,
                                    [category]: false,
                                  }));
                                }}
                              >
                                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#edf3ff] text-[10px] font-bold text-[#2e6ff2]">
                                  {technology.charAt(0).toUpperCase()}
                                </span>
                                <span className="truncate">{technology}</span>
                              </button>
                            ))
                        ) : (
                          <div className="px-3 py-2.5 text-xs text-[#8d99a6]">
                            Press Add to use this technology
                          </div>
                        )}
                      </div>
                    )}
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
          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <div>
              <label className={labelClass}>Way of client collection</label>
              {selectValue(
                "collectionWay",
                form.collectionWay,
                customCollection,
                setCustomCollection,
                collectionWays,
                (value) => {
                  const next = value.trim();
                  if (!next) return;
                  updateField("collectionWay", next);
                  setCustomCollection("");
                },
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
          <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
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
          <div className="flex items-center justify-between rounded-lg bg-[#edf3ff] px-4 py-3 text-xs text-[#2e6ff2]">
            <span>Due amount</span>
            <div className="flex items-center gap-3">
              <strong className="text-sm">
                {money(String(dueAmount), form.currency)}
              </strong>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${paymentStatus === "Paid" ? "bg-[#eaf8f2] text-[#238d68]" : "bg-[#fff7e8] text-[#d58b35]"}`}>
                {paymentStatus}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <label className={labelClass}>
              Pay Amount
              <input
                type="number"
                min="0"
                max={totalAmount}
                step="any"
                value={form.payableAmount}
                onChange={(event) =>
                  updateField("payableAmount", event.target.value)
                }
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Payment Method
              <select
                required
                className={inputClass}
                value={form.paymentMethod}
                onChange={(event) => {
                  updateField("paymentMethod", event.target.value);
                  if (event.target.value !== "Cash")
                    updateField("cashReceivedBy", "");
                }}
              >
                <option value="" disabled>
                  Select payment method
                </option>
                {!paymentMethods.includes(form.paymentMethod) &&
                  form.paymentMethod && (
                    <option value={form.paymentMethod}>
                      Current: {form.paymentMethod}
                    </option>
                  )}
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </label>
            {form.paymentMethod === "Cash" && (
              <Field
                label="Cash received by"
                value={form.cashReceivedBy ?? ""}
                onChange={(value) => updateField("cashReceivedBy", value)}
                required
              />
            )}
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

function ClientModal({
  form,
  sourceOptions,
  editing,
  onChange,
  onSourceAdd,
  onSubmit,
  onClose,
}: {
  form: ClientRecord;
  sourceOptions: string[];
  editing: boolean;
  onChange: (field: keyof ClientRecord, value: string) => void;
  onSourceAdd: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}) {
  const inputClass =
    "mt-1 w-full rounded-md border border-[#e4e9ef] bg-white px-2.5 py-2 text-xs text-[#26333d] outline-none transition focus:border-[#2e6ff2] focus:ring-2 focus:ring-[#edf3ff]";
  const labelClass =
    "text-[10px] font-semibold uppercase tracking-[0.05em] text-[#7e8995]";
  const [customSource, setCustomSource] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#18232f]/45 p-4"
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={onSubmit}
        className="w-full max-w-[540px] overflow-hidden rounded-xl bg-[#f8fafb] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#e6ebf1] bg-white px-6 py-5 max-md:px-4">
          <div>
            <h2 className="font-sans text-xl font-bold text-[#18232f]">
              {editing ? "Edit client" : "Add new client"}
            </h2>
            <p className="mt-1 text-xs text-[#96a0ac]">
              Save client details and source information.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg bg-[#f3f5f7] text-lg text-[#687582]"
            aria-label="Close client editor"
          >
            ×
          </button>
        </div>
        <div className="grid gap-4 p-6 max-md:p-4">
          <label className={labelClass}>
            Client Name
            <input
              required
              className={inputClass}
              value={form.name}
              onChange={(event) => onChange("name", event.target.value)}
              placeholder="Acme Corporation"
            />
          </label>
          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <label className={labelClass}>
              Phone
              <input
                className={inputClass}
                value={form.phone}
                onChange={(event) => onChange("phone", event.target.value)}
                placeholder="+1 555 123 4567"
              />
            </label>
            <label className={labelClass}>
              Email
              <input
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(event) => onChange("email", event.target.value)}
                placeholder="client@example.com"
              />
            </label>
          </div>
          <label className={labelClass}>
            Address
            <textarea
              className={`${inputClass} min-h-[88px] resize-y`}
              value={form.address}
              onChange={(event) => onChange("address", event.target.value)}
              placeholder="Street, city, country"
            />
          </label>
          <div>
            <label className={labelClass}>Source</label>
            <select
              className={inputClass}
              value={sourceOptions.includes(form.source) ? form.source : "__custom"}
              onChange={(event) => {
                const next = event.target.value;
                if (next === "__custom") {
                  setCustomSource("");
                  onChange("source", "");
                  return;
                }
                onChange("source", next);
              }}
            >
              {sourceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
              <option value="__custom">+ Add new source</option>
            </select>
            {(!sourceOptions.includes(form.source) || customSource) && (
              <div className="mt-2 flex gap-2">
                <input
                  className={inputClass.replace("mt-1 ", "")}
                  placeholder="Add new source"
                  value={customSource}
                  onChange={(event) => setCustomSource(event.target.value)}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customSource.trim()) {
                      onSourceAdd(customSource.trim());
                      setCustomSource("");
                    }
                  }}
                  className="rounded-lg bg-[#edf3ff] px-3 text-xs font-semibold text-[#2e6ff2]"
                >
                  Add
                </button>
              </div>
            )}
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
            {editing ? "Save changes" : "Save client"}
          </button>
        </div>
      </form>
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
  const {
    totalAmount: total,
    paidAmount: payable,
    dueAmount: due,
    paymentStatus,
  } = getProjectPaymentSummary(project);
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
    line("Pay amount", money(String(payable), currency));
    line("Due amount", money(String(due), currency));
    line("Payment status", paymentStatus);
    if (project.paymentMethod === "Cash")
      line("Cash received by", project.cashReceivedBy ?? "-");
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
              label="Project Type"
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
              {project.paymentMethod === "Cash" && (
                <InvoiceValue
                  label="Cash received by"
                  value={project.cashReceivedBy ?? "-"}
                />
              )}
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
                label="Pay amount"
                value={money(String(payable), currency)}
              />
              <InvoiceLine
                label="Due amount"
                value={money(String(due), currency)}
              />
              <InvoiceLine label="Payment status" value={paymentStatus} />
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
