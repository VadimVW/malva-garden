"use client";

import { AuthGuard } from "./AuthGuard";
import { AdminSidebar } from "./AdminSidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-admin-bg">
        <AdminSidebar />
        <main className="min-w-0 flex-1 overflow-auto p-6 lg:p-8">{children}</main>
      </div>
    </AuthGuard>
  );
}
