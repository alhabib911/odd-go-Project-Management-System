"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import WorkspaceSidebar, { Icon } from "@/components/workspace-sidebar";
import ProfileMenu from "@/components/profile-menu";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type ClusterSection = "Leads" | "Blogs" | "Quote Name";
type LeadStatus = "New" | "Contacted" | "Qualified" | "Converted" | "Lost";
type QuoteStatus = "New" | "Reviewing" | "Quoted" | "Accepted" | "Declined";
type Lead = {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  message: string;
  source: string;
  status: LeadStatus;
  created_at: string;
};
type Quote = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: QuoteStatus;
  created_at: string;
};
const leadsOwnerEmail = "devcluster24@gmail.com";

const sections: Record<ClusterSection, {
  description: string;
  columns: string[];
  emptyMessage: string;
}> = {
  Leads: {
    description: "Organize prospective clients and track your sales pipeline.",
    columns: ["Lead", "Company", "Email", "Phone", "Message", "Source", "Status", "Added"],
    emptyMessage: "No leads yet.",
  },
  Blogs: {
    description: "Manage blog content and keep your publishing work organized.",
    columns: ["Title", "Category", "Author", "Status", "Last updated"],
    emptyMessage: "No blog posts yet.",
  },
  "Quote Name": {
    description: "Review quote requests submitted from the Dev Cluster website.",
    columns: ["Name", "Email", "Phone", "Project details", "Status", "Submitted"],
    emptyMessage: "No quote requests yet.",
  },
};

export default function ClusterManagementPage({
  active,
}: {
  active: ClusterSection;
}) {
  const section = sections[active];
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(active === "Leads");
  const [leadError, setLeadError] = useState("");
  const [leadAuthRequired, setLeadAuthRequired] = useState(false);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(active === "Quote Name");
  const [quoteError, setQuoteError] = useState("");
  const [quoteAuthRequired, setQuoteAuthRequired] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    if (active !== "Leads" && active !== "Quote Name") return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      const isLeads = active === "Leads";
      if (isLeads) {
        setLoadingLeads(true);
        setLeadError("");
        setLeadAuthRequired(false);
      } else {
        setLoadingQuotes(true);
        setQuoteError("");
        setQuoteAuthRequired(false);
      }
      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        if (isLeads) {
          setLeadError("Supabase is not configured.");
          setLoadingLeads(false);
        } else {
          setQuoteError("Supabase is not configured.");
          setLoadingQuotes(false);
        }
        return;
      }

      void supabase.auth.getUser().then(({ data: { user }, error: authError }) => {
        if (cancelled) return;
        if (authError || !user || user.email?.toLowerCase() !== leadsOwnerEmail) {
          if (isLeads) {
            setLeadAuthRequired(true);
            setLoadingLeads(false);
          } else {
            setQuoteAuthRequired(true);
            setLoadingQuotes(false);
          }
          return;
        }

        if (isLeads) {
          return supabase
            .from("leads")
            .select("id, name, company, email, phone, message, source, status, created_at")
            .order("created_at", { ascending: false })
            .then(({ data, error }) => {
              if (cancelled) return;
              if (error) setLeadError(error.message);
              else setLeads((data ?? []) as Lead[]);
              setLoadingLeads(false);
            });
        }

        return supabase
          .from("quotes")
          .select("id, name, email, phone, message, status, created_at")
          .order("created_at", { ascending: false })
          .then(({ data, error }) => {
            if (cancelled) return;
            if (error) setQuoteError(error.message);
            else setQuotes((data ?? []) as Quote[]);
            setLoadingQuotes(false);
          });
      });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [active, refreshCount]);

  async function updateLeadStatus(id: string, status: LeadStatus) {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) {
      setLeadError(error.message);
      return;
    }
    setLeads((current) => current.map((lead) => lead.id === id ? { ...lead, status } : lead));
  }

  async function updateQuoteStatus(id: string, status: QuoteStatus) {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const { error } = await supabase.from("quotes").update({ status }).eq("id", id);
    if (error) {
      setQuoteError(error.message);
      return;
    }
    setQuotes((current) => current.map((quote) => quote.id === id ? { ...quote, status } : quote));
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafb]">
      <WorkspaceSidebar active={active} />
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
            <strong className="text-[#26333d]">{active}</strong>
          </div>
          <ProfileMenu />
        </header>
        <div className="mx-auto max-w-[1440px] px-[47px] pb-[50px] pt-[42px] max-lg:px-7 max-md:px-4 max-md:pb-[35px] max-md:pt-7">
          <div className="mb-8">
            <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9ba5b0]">
              CLUSTER MANAGEMENT
            </span>
            <h1 className="font-sans text-3xl font-bold tracking-[-1px] text-[#18232f]">
              {active}
            </h1>
            <p className="mt-2 text-sm text-[#89939f]">{section.description}</p>
          </div>
          <section className="overflow-hidden rounded-xl border border-[#e6ebf1] bg-white p-6 shadow-[0_12px_32px_rgba(30,55,80,0.04)] max-md:p-4">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#26333d]">All {active}</h2>
              <div className="flex items-center gap-3">
                {(active === "Leads" || active === "Quote Name") && (
                  <button
                    className="text-xs font-semibold text-[#2e6ff2] hover:text-[#1f5edd] disabled:cursor-wait disabled:opacity-60"
                    disabled={active === "Leads" ? loadingLeads : loadingQuotes}
                    onClick={() => setRefreshCount((count) => count + 1)}
                    type="button"
                  >
                    {(active === "Leads" ? loadingLeads : loadingQuotes) ? "Refreshing..." : "Refresh"}
                  </button>
                )}
                <span className="rounded-full bg-[#f3f5f7] px-2.5 py-1 text-[10px] font-semibold text-[#687582]">
                  {active === "Leads" ? leads.length : active === "Quote Name" ? quotes.length : 0} total
                </span>
              </div>
            </div>
            {active === "Leads" && leadError && (
              <p role="alert" className="mb-4 rounded-md bg-[#fff0ef] px-3 py-2 text-xs text-[#b7463f]">
                {leadError}
              </p>
            )}
            {active === "Quote Name" && quoteError && (
              <p role="alert" className="mb-4 rounded-md bg-[#fff0ef] px-3 py-2 text-xs text-[#b7463f]">
                {quoteError}
              </p>
            )}
            {active === "Leads" && leadAuthRequired && (
              <p role="alert" className="mb-4 rounded-md bg-[#fff7e8] px-3 py-2 text-xs text-[#93621d]">
                Sign in as {leadsOwnerEmail} to view database leads. <Link className="font-semibold underline" href="/login">Sign in</Link>
              </p>
            )}
            {active === "Quote Name" && quoteAuthRequired && (
              <p role="alert" className="mb-4 rounded-md bg-[#fff7e8] px-3 py-2 text-xs text-[#93621d]">
                Sign in as {leadsOwnerEmail} to view quote requests. <Link className="font-semibold underline" href="/login">Sign in</Link>
              </p>
            )}
            <div className="overflow-x-auto">
              <table className={`w-full ${active === "Leads" ? "min-w-[1080px]" : active === "Quote Name" ? "min-w-[900px]" : "min-w-[680px]"}`}>
                <thead>
                  <tr className="text-left">
                    {section.columns.map((column) => (
                      <th
                        className="pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a2abb5]"
                        key={column}
                        scope="col"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {active === "Leads" && leads.map((lead) => (
                    <tr className="border-t border-[#f0f2f4]" key={lead.id}>
                      <td className="py-4 text-xs font-semibold text-[#26333d]">{lead.name}</td>
                      <td className="py-4 text-xs text-[#89939f]">{lead.company || "-"}</td>
                      <td className="py-4 text-xs text-[#89939f]">{lead.email}</td>
                      <td className="py-4 text-xs text-[#89939f]">{lead.phone || "-"}</td>
                      <td className="max-w-[260px] truncate py-4 text-xs text-[#89939f]" title={lead.message}>
                        {lead.message}
                      </td>
                      <td className="py-4 text-xs text-[#89939f]">{lead.source}</td>
                      <td className="py-4">
                        <select
                          aria-label={`Change ${lead.name} lead status`}
                          className="rounded-md border border-[#e4e9ef] bg-white px-2 py-1 text-[10px] font-semibold text-[#26333d] outline-none focus:border-[#2e6ff2]"
                          onChange={(event) => void updateLeadStatus(lead.id, event.target.value as LeadStatus)}
                          value={lead.status}
                        >
                          <option>New</option>
                          <option>Contacted</option>
                          <option>Qualified</option>
                          <option>Converted</option>
                          <option>Lost</option>
                        </select>
                      </td>
                      <td className="py-4 text-xs text-[#89939f]">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {active === "Quote Name" && quotes.map((quote) => (
                    <tr className="border-t border-[#f0f2f4]" key={quote.id}>
                      <td className="py-4 text-xs font-semibold text-[#26333d]">{quote.name}</td>
                      <td className="py-4 text-xs text-[#89939f]">{quote.email}</td>
                      <td className="py-4 text-xs text-[#89939f]">{quote.phone || "-"}</td>
                      <td className="max-w-[320px] truncate py-4 text-xs text-[#89939f]" title={quote.message}>
                        {quote.message}
                      </td>
                      <td className="py-4">
                        <select
                          aria-label={`Change ${quote.name} quote status`}
                          className="rounded-md border border-[#e4e9ef] bg-white px-2 py-1 text-[10px] font-semibold text-[#26333d] outline-none focus:border-[#2e6ff2]"
                          onChange={(event) => void updateQuoteStatus(quote.id, event.target.value as QuoteStatus)}
                          value={quote.status}
                        >
                          <option>New</option>
                          <option>Reviewing</option>
                          <option>Quoted</option>
                          <option>Accepted</option>
                          <option>Declined</option>
                        </select>
                      </td>
                      <td className="py-4 text-xs text-[#89939f]">
                        {new Date(quote.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {((active === "Leads" && !leadAuthRequired && (loadingLeads || leads.length === 0)) || (active === "Quote Name" && !quoteAuthRequired && (loadingQuotes || quotes.length === 0)) || active === "Blogs") && (
                    <tr className="border-t border-[#f0f2f4]">
                      <td className="py-16 text-center text-xs text-[#89939f]" colSpan={section.columns.length}>
                        {active === "Leads" && loadingLeads
                          ? "Loading leads..."
                          : active === "Quote Name" && loadingQuotes
                            ? "Loading quote requests..."
                            : section.emptyMessage}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}