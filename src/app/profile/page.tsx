"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import WorkspaceSidebar, { Icon } from "@/components/workspace-sidebar";
import ProfileMenu, { defaultProfile, ProfileData } from "@/components/profile-menu";

type DocumentItem = { id: string; name: string; fileName: string; data: string };
type Project = { contactPerson?: string; secondSalesPerson?: string; salesCommission?: string; secondSalesCommission?: string; status?: string };

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saved, setSaved] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [photoError, setPhotoError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const currentUser = JSON.parse(
        window.localStorage.getItem("focura-current-user") ?? "null",
      ) as { id?: string; name?: string; email?: string } | null;
      const email = currentUser?.email ?? defaultProfile.email;
      const requests = JSON.parse(
        window.localStorage.getItem("focura-role-requests") ?? "[]",
      ) as Array<{ email: string; name?: string; teamName?: string; role?: string }>;
      const registration = requests.find(
        (request) => request.email.toLowerCase() === email.toLowerCase(),
      );
      const stored = window.localStorage.getItem(`focura-profile:${email}`);
      const members = window.localStorage.getItem("focura-team");
      const savedProjects = window.localStorage.getItem("focura-projects");
      if (stored) setProfile({ ...defaultProfile, ...(JSON.parse(stored) as Partial<ProfileData>) });
      else if (members) {
        const member = (JSON.parse(members) as Array<ProfileData & { teamName: string }>).find((item) => item.email.toLowerCase() === email.toLowerCase());
        if (member) setProfile((current) => ({ ...current, ...member, technology: member.technology ?? "" }));
        else setProfile((current) => ({
          ...current,
          name: registration?.name ?? currentUser?.name ?? email.split("@")[0],
          email,
          teamName: registration?.teamName ?? registration?.role ?? "",
        }));
      } else {
        setProfile((current) => ({
          ...current,
          name: registration?.name ?? currentUser?.name ?? (email === defaultProfile.email ? defaultProfile.name : email.split("@")[0]),
          email,
          teamName: registration?.teamName ?? registration?.role ?? "",
        }));
      }
      if (savedProjects) setProjects(JSON.parse(savedProjects) as Project[]);
      const storedDocuments = window.localStorage.getItem(`focura-profile-documents:${email}`);
      if (storedDocuments) setDocuments(JSON.parse(storedDocuments) as DocumentItem[]);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const commission = useMemo(() => projects.reduce((total, project) => {
    if (project.status?.toLowerCase() !== "done") return total;
    return total + (project.contactPerson === profile.name ? Number(project.salesCommission) || 0 : 0) + (project.secondSalesPerson === profile.name ? Number(project.secondSalesCommission) || 0 : 0);
  }, 0), [projects, profile.name]);
  const dueCommission = useMemo(() => projects.reduce((total, project) => {
    if (project.status?.toLowerCase() === "done") return total;
    return total + (project.contactPerson === profile.name ? Number(project.salesCommission) || 0 : 0) + (project.secondSalesPerson === profile.name ? Number(project.secondSalesCommission) || 0 : 0);
  }, 0), [projects, profile.name]);

  function update(field: keyof ProfileData, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }
  function save(event: FormEvent) {
    event.preventDefault();
    window.localStorage.setItem(`focura-profile:${profile.email}`, JSON.stringify(profile));
    const members = window.localStorage.getItem("focura-team");
    if (members) {
      const next = (JSON.parse(members) as Array<ProfileData & { id: string }>).map((member) => member.email === profile.email ? { ...member, ...profile, skills: profile.technology.split(",").map((item) => item.trim()).filter(Boolean) } : member);
      window.localStorage.setItem("focura-team", JSON.stringify(next));
    }
    setSaved(true);
  }
  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    setSelectedFile(event.target.files?.[0] ?? null);
  }
  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("Profile photo must be smaller than 2MB.");
      return;
    }
    setPhotoError("");
    const reader = new FileReader();
    reader.onload = () => update("avatarUrl", String(reader.result));
    reader.readAsDataURL(file);
  }
  function uploadDocument() {
    if (!selectedFile || !fileName.trim()) return;
    const reader = new FileReader();
    reader.onload = () => {
      const next = [...documents, { id: crypto.randomUUID(), name: fileName.trim(), fileName: selectedFile.name, data: String(reader.result) }];
      setDocuments(next);
      window.localStorage.setItem(`focura-profile-documents:${profile.email}`, JSON.stringify(next));
      setFileName("");
      setSelectedFile(null);
    };
    reader.readAsDataURL(selectedFile);
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafb]">
      <WorkspaceSidebar active="Profile" />
      <main className="min-w-0 flex-1">
        <header className="flex h-[72px] items-center justify-between border-b border-[#e9edf2] bg-white px-[47px] max-md:px-5">
          <div className="flex items-center gap-3 text-[#a5adb7]"><span>Workspace</span><b>/</b><strong>My Profile</strong></div>
          <div className="flex items-center gap-4 text-[#89939f]"><Icon name="bell" /><ProfileMenu /></div>
        </header>
        <div className="mx-auto max-w-[1100px] px-[47px] pb-12 pt-10 max-md:px-5">
          <h1 className="text-3xl font-bold text-[#18232f]">My Profile</h1>
          <p className="mt-2 text-sm text-[#89939f]">Manage your personal information, commission and official documents.</p>
          <form onSubmit={save} className="mt-8 space-y-6">
            <section className="rounded-xl border border-[#e6ebf1] bg-white p-4">
              <h2 className="text-base font-bold text-[#18232f]">General</h2>
              <div className="mt-4 flex items-center gap-4">
                <div className="grid size-16 overflow-hidden place-items-center rounded-full bg-[#edf3ff] text-sm font-bold text-[#2e6ff2]">
                  {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.name} className="size-full object-cover" /> : profile.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <label className="inline-flex cursor-pointer rounded-lg border border-[#e1e6ec] px-3 py-2 text-xs font-semibold text-[#687582] hover:border-[#2e6ff2] hover:text-[#2e6ff2]">
                    Upload profile photo
                    <input type="file" accept="image/*" onChange={choosePhoto} className="hidden" />
                  </label>
                  <p className="mt-1 text-[10px] text-[#89939f]">JPG, PNG or WEBP. Maximum 2MB.</p>
                  {photoError && <p className="mt-1 text-[10px] text-[#d8665d]">{photoError}</p>}
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <Input label="Full Name" value={profile.name} onChange={(value) => update("name", value)} />
                <Input label="Email" type="email" value={profile.email} onChange={() => undefined} disabled />
                <Input label="Phone" value={profile.phone} onChange={(value) => update("phone", value)} />
                <Input label="Password" type="password" value="********" onChange={() => undefined} disabled />
                <Input label="Team Name" value={profile.teamName} onChange={() => undefined} disabled />
                <Input label="Technology" value={profile.technology} onChange={(value) => update("technology", value)} />
              </div>
            </section>
            <section className="grid gap-4 md:grid-cols-2">
              <Stat title="Total commission" value={`USD ${commission.toLocaleString()}`} color="text-[#2caf82]" />
              <Stat title="Due Commission" value={`USD ${dueCommission.toLocaleString()}`} color="text-[#d58b35]" />
            </section>
            <section className="rounded-xl border border-[#e6ebf1] bg-white p-4">
              <h2 className="text-base font-bold text-[#18232f]">Official Document</h2>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <Input label="Document name" value={fileName} onChange={setFileName} />
                <input type="file" onChange={chooseFile} className="text-xs text-[#687582]" />
                <button type="button" onClick={uploadDocument} className="rounded-lg bg-[#2e6ff2] px-4 py-2.5 text-xs font-semibold text-white">Upload</button>
              </div>
              <div className="mt-5 space-y-2">{documents.map((document) => <div key={document.id} className="flex items-center justify-between rounded-lg bg-[#f8fafb] px-4 py-3"><div><strong className="block text-xs text-[#26333d]">{document.name}</strong><span className="text-[10px] text-[#89939f]">{document.fileName}</span></div><a href={document.data} download={document.fileName} className="text-xs font-semibold text-[#2e6ff2]">Download</a></div>)}</div>
            </section>
            <div className="flex items-center justify-end gap-3"><span className="text-xs text-[#2caf82]">{saved ? "Profile saved" : ""}</span><button type="submit" className="rounded-lg bg-[#2e6ff2] px-5 py-2.5 text-xs font-semibold text-white">Save changes</button></div>
          </form>
        </div>
      </main>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, disabled }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; disabled?: boolean }) {
  return <label className="block text-xs font-semibold text-[#687582]">{label}<input type={type} value={value} placeholder={placeholder} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[#e1e6ec] px-3 py-2 text-xs font-normal text-[#26333d] outline-none focus:border-[#2e6ff2] disabled:bg-[#f5f7f9] disabled:text-[#89939f]" /></label>;
}
function Stat({ title, value, color }: { title: string; value: string; color: string }) {
  return <div className="rounded-xl border border-[#e6ebf1] bg-white p-5"><span className="text-xs text-[#89939f]">{title}</span><strong className={`mt-2 block text-2xl ${color}`}>{value}</strong></div>;
}
