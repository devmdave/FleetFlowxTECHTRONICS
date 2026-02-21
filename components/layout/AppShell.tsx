"use client";

import { useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Sidebar } from "./Sidebar";
import { TopNavbar } from "./TopNavbar";
import { ToastProvider } from "./ToastProvider";
import type { UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { ShieldAlert } from "lucide-react";

interface AppShellProps {
    children: ReactNode;
    pageTitle: string;
    requiredRoles?: UserRole[];
}

export function AppShell({ children, pageTitle, requiredRoles }: AppShellProps) {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Redirect if not authenticated (client side guard)
    if (typeof window !== "undefined" && !isAuthenticated) {
        router.push("/login");
        return null;
    }

    // RBAC check
    const hasAccess =
        !requiredRoles ||
        (user?.role && requiredRoles.includes(user.role));

    if (!hasAccess && user) {
        return (
            <ToastProvider>
                <div className="min-h-screen bg-background flex">
                    <Sidebar
                        collapsed={sidebarCollapsed}
                        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                        mobileOpen={mobileOpen}
                        onMobileClose={() => setMobileOpen(false)}
                    />
                    <div
                        className={cn(
                            "flex-1 transition-all duration-300",
                            sidebarCollapsed ? "md:ml-16" : "md:ml-60"
                        )}
                    >
                        <TopNavbar
                            onMenuClick={() => setMobileOpen(true)}
                            sidebarCollapsed={sidebarCollapsed}
                            pageTitle={pageTitle}
                        />
                        <main className="pt-16">
                            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8">
                                <div className="text-center max-w-sm">
                                    <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                                        <ShieldAlert className="w-8 h-8 text-red-500" />
                                    </div>
                                    <h2 className="text-xl font-bold text-foreground mb-2">Access Restricted</h2>
                                    <p className="text-muted-foreground text-sm">
                                        Your role (<span className="font-medium text-foreground">{user?.role}</span>) does not have
                                        permission to access this page.
                                    </p>
                                    <button
                                        onClick={() => router.back()}
                                        className="btn-primary mt-6"
                                    >
                                        Go Back
                                    </button>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </ToastProvider>
        );
    }

    return (
        <ToastProvider>
            <div className="min-h-screen bg-background flex">
                <Sidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                    mobileOpen={mobileOpen}
                    onMobileClose={() => setMobileOpen(false)}
                />
                <div
                    className={cn(
                        "flex-1 transition-all duration-300",
                        sidebarCollapsed ? "md:ml-16" : "md:ml-60"
                    )}
                >
                    <TopNavbar
                        onMenuClick={() => setMobileOpen(true)}
                        sidebarCollapsed={sidebarCollapsed}
                        pageTitle={pageTitle}
                    />
                    <main className="pt-16 min-h-screen">
                        <div className="p-4 md:p-6 lg:p-8 page-enter">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </ToastProvider>
    );
}
