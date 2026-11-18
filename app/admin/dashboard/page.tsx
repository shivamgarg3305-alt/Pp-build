"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2, LogOut, Pencil, Star, Trash2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, type Category, type Project } from "@/lib/types";

const inputClass =
  "w-full rounded-xl border border-line bg-chip px-4 py-3 text-sm text-fg outline-none placeholder:text-muted/60 focus:border-white focus:ring-2 focus:ring-white/20";
const labelClass = "mb-1.5 block text-xs font-medium text-muted";

type Banner = { type: "success" | "error"; text: string } | null;

export default function AdminDashboardPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<Banner>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Android Apps");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [featured, setFeatured] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) {
      setBanner({ type: "error", text: error.message });
    } else {
      setProjects((data ?? []) as Project[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setCategory("Android Apps");
    setDescription("");
    setTechStack("");
    setImageUrl("");
    setDownloadUrl("");
    setWebsiteUrl("");
    setFeatured(false);
  }

  async function uploadTo(bucket: string, path: string, file: File): Promise<string> {
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "application/octet-stream",
    });
    if (error) throw error;
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }

  async function handleImage(e: ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setBanner(null);
    try {
      const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
      const url = await uploadTo("project-images", `${crypto.randomUUID()}.${ext || "png"}`, file);
      setImageUrl(url);
      setBanner({ type: "success", text: "Thumbnail uploaded." });
    } catch (err) {
      setBanner({ type: "error", text: err instanceof Error ? err.message : "Image upload failed." });
    } finally {
      setUploadingImage(false);
      input.value = "";
    }
  }

  async function handleRelease(e: ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    setBanner(null);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const url = await uploadTo("app-releases", `${crypto.randomUUID()}/${safeName}`, file);
      setDownloadUrl(url);
      setBanner({ type: "success", text: "File uploaded. Download URL filled in." });
    } catch (err) {
      setBanner({ type: "error", text: err instanceof Error ? err.message : "File upload failed." });
    } finally {
      setUploadingFile(false);
      input.value = "";
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) {
      setBanner({ type: "error", text: "Title is required." });
      return;
    }
    setSaving(true);
    setBanner(null);

    const payload = {
      title: title.trim(),
      category,
      description: description.trim() || null,
      tech_stack: techStack
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      image_url: imageUrl.trim() || null,
      download_url: downloadUrl.trim() || null,
      website_url: websiteUrl.trim() || null,
      is_featured: featured,
    };

    const { error } = editingId
      ? await supabase.from("projects").update(payload).eq("id", editingId)
      : await supabase.from("projects").insert(payload);

    if (error) {
      setBanner({ type: "error", text: error.message });
    } else {
      setBanner({ type: "success", text: editingId ? "Project updated." : "Project added." });
      resetForm();
      await load();
    }
    setSaving(false);
  }

  function startEdit(p: Project) {
    setEditingId(p.id);
    setTitle(p.title);
    setCategory((p.category ?? "Other") as Category);
    setDescription(p.description ?? "");
    setTechStack((p.tech_stack ?? []).join(", "));
    setImageUrl(p.image_url ?? "");
    setDownloadUrl(p.download_url ?? "");
    setWebsiteUrl(p.website_url ?? "");
    setFeatured(p.is_featured);
    setBanner(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function toggleFeatured(p: Project) {
    const { error } = await supabase
      .from("projects")
      .update({ is_featured: !p.is_featured })
      .eq("id", p.id);
    if (error) setBanner({ type: "error", text: error.message });
    else await load();
  }

  async function remove(p: Project) {
    if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("projects").delete().eq("id", p.id);
    if (error) {
      setBanner({ type: "error", text: error.message });
    } else {
      if (editingId === p.id) resetForm();
      setBanner({ type: "success", text: "Project deleted." });
      await load();
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-chip px-4 py-2 text-xs font-medium hover:border-white/50"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            View site
          </Link>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-chip px-4 py-2 text-xs font-medium hover:border-white/50"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Log out
          </button>
        </div>
      </header>

      {banner && (
        <div
          role={banner.type === "error" ? "alert" : "status"}
          className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
            banner.type === "error"
              ? "border-white/40 bg-white/10 text-white"
              : "border-line bg-chip text-fg"
          }`}
        >
          {banner.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 rounded-3xl border border-line bg-card p-5 sm:p-8">
        <h2 className="text-lg font-semibold">{editingId ? "Edit project" : "Add project"}</h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="title" className={labelClass}>
              Title
            </label>
            <input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="category" className={labelClass}>
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className={inputClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="tech" className={labelClass}>
              Tech stack (comma-separated)
            </label>
            <input
              id="tech"
              placeholder="Kotlin, Jetpack Compose, Room"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="thumb" className={labelClass}>
              Thumbnail
            </label>
            <label
              htmlFor="thumb"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-line bg-chip px-4 py-3 text-sm text-muted hover:border-white/50"
            >
              {uploadingImage ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Upload className="h-4 w-4" aria-hidden="true" />
              )}
              {uploadingImage ? "Uploading..." : "Upload image"}
            </label>
            <input
              id="thumb"
              type="file"
              accept="image/*"
              onChange={handleImage}
              disabled={uploadingImage}
              className="sr-only"
            />
            {imageUrl && (
              <div className="mt-3 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Thumbnail preview" className="h-16 w-16 rounded-xl border border-line object-cover" />
                <button type="button" onClick={() => setImageUrl("")} className="text-xs text-muted underline hover:text-fg">
                  Remove
                </button>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="release" className={labelClass}>
              APK / ZIP file
            </label>
            <label
              htmlFor="release"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-line bg-chip px-4 py-3 text-sm text-muted hover:border-white/50"
            >
              {uploadingFile ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Upload className="h-4 w-4" aria-hidden="true" />
              )}
              {uploadingFile ? "Uploading..." : "Upload APK or ZIP"}
            </label>
            <input
              id="release"
              type="file"
              accept=".apk,.zip,.aab,application/vnd.android.package-archive,application/zip"
              onChange={handleRelease}
              disabled={uploadingFile}
              className="sr-only"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="download" className={labelClass}>
              Download URL (auto-filled by upload, or paste an external link)
            </label>
            <input
              id="download"
              type="url"
              placeholder="https://..."
              value={downloadUrl}
              onChange={(e) => setDownloadUrl(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="website" className={labelClass}>
              Website URL (optional)
            </label>
            <input
              id="website"
              type="url"
              placeholder="https://..."
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex items-center gap-3 sm:col-span-2">
            <button
              type="button"
              role="switch"
              aria-checked={featured}
              aria-label="Featured"
              onClick={() => setFeatured((v) => !v)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                featured ? "bg-white" : "bg-line"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full transition-transform ${
                  featured ? "translate-x-5 bg-black" : "translate-x-0 bg-white"
                }`}
              />
            </button>
            <span className="text-sm text-muted">Featured (shown first)</span>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving || uploadingImage || uploadingFile}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {editingId ? "Save changes" : "Add project"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-line bg-chip px-6 py-3 text-sm font-medium hover:border-white/50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">All projects</h2>
        <div className="mt-4 overflow-x-auto rounded-3xl border border-line bg-card">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-widest text-muted">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-muted">
                    Loading...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-muted">
                    No projects yet.
                  </td>
                </tr>
              ) : (
                projects.map((p) => (
                  <tr key={p.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-medium">{p.title}</td>
                    <td className="px-4 py-3 text-muted">{p.category}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => toggleFeatured(p)}
                          aria-label={p.is_featured ? `Unfeature ${p.title}` : `Feature ${p.title}`}
                          aria-pressed={p.is_featured}
                          className="rounded-lg p-2 hover:bg-chip"
                        >
                          <Star
                            className={`h-4 w-4 ${p.is_featured ? "fill-white text-white" : "text-muted"}`}
                            aria-hidden="true"
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(p)}
                          aria-label={`Edit ${p.title}`}
                          className="rounded-lg p-2 text-muted hover:bg-chip hover:text-fg"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(p)}
                          aria-label={`Delete ${p.title}`}
                          className="rounded-lg p-2 text-muted hover:bg-chip hover:text-white"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
