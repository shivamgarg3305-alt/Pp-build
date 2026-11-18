import { redirect } from "next/navigation";

export default function AdminIndex() {
  // Middleware normally handles this; this is a safe fallback.
  redirect("/admin/login");
}
