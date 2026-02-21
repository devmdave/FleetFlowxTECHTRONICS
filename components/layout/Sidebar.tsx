"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import type { UserRole } from "@/types";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Truck,
    Settings,
    ChevronLeft,
    ChevronRight,
    X,
    Users,
    Package,
    Wrench,
    Calculator,
    Layers,
    Shield,
    BarChart2,
} from "lucide-react";

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    allowedRoles?: UserRole[];
    group?: string;
}

const NAV_ITEMS: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, group: "main" },
    { label: "Vehicles", href: "/vehicles", icon: Truck, group: "main", allowedRoles: ["Manager", "Dispatcher", "Financial Analyst"] },
    { label: "Trips", href: "/trips", icon: Package, group: "main", allowedRoles: ["Dispatcher"] },
    { label: "Drivers", href: "/drivers", icon: Users, group: "main", allowedRoles: ["Safety Officer", "Dispatcher"] },
    { label: "Maintenance", href: "/maintenance", icon: Wrench, group: "main", allowedRoles: ["Manager", "Financial Analyst"] },
    { label: "Finance", href: "/finance", icon: Calculator, group: "main", allowedRoles: ["Financial Analyst"] },
    { label: "Driver Performance", href: "/driver-performance", icon: Shield, group: "main", allowedRoles: ["Safety Officer"] },
    { label: "Analytics & Reports", href: "/analytics", icon: BarChart2, group: "main", allowedRoles: ["Financial Analyst", "Manager"] },
    { label: "Settings", href: "/settings", icon: Settings, group: "main" }
];

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
    mobileOpen: boolean;
    onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
    const pathname = usePathname();
    const user = useAuthStore((s) => s.user);

    const visibleItems = NAV_ITEMS.filter(
        (item) =>
            !item.allowedRoles ||
            (user?.role && item.allowedRoles.includes(user.role))
    );

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div
                className={cn(
                    "flex items-center border-b border-border transition-all duration-300",
                    collapsed ? "justify-center px-4 py-5" : "px-5 py-5 gap-3"
                )}
            >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary shrink-0">
                    <Truck className="w-5 h-5 text-white" />
                </div>
                {!collapsed && (
                    <div className="overflow-hidden">
                        <p className="font-bold text-foreground leading-tight whitespace-nowrap">FleetFlow</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 whitespace-nowrap">TECHTRONICS</p>
                    </div>
                )}
                {/* Desktop collapse toggle */}
                <button
                    onClick={onToggle}
                    className={cn(
                        "hidden md:flex items-center justify-center w-6 h-6 rounded-full border border-border bg-background text-muted-foreground hover:text-foreground hover:border-border/60 transition-all duration-200 shrink-0 ml-auto",
                    )}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed ? (
                        <ChevronRight className="w-3.5 h-3.5" />
                    ) : (
                        <ChevronLeft className="w-3.5 h-3.5" />
                    )}
                </button>
                {/* Mobile close */}
                <button
                    onClick={onMobileClose}
                    className="md:hidden ml-auto p-1 rounded text-muted-foreground hover:text-foreground"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar">
                {/* Main section */}
                {!collapsed && (
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-2">
                        Main
                    </p>
                )}
                <div className="space-y-0.5 mb-4">
                    {visibleItems.filter(i => i.group === "main").map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onMobileClose}
                                className={cn(
                                    "sidebar-link",
                                    isActive && "active",
                                    collapsed && "justify-center px-2"
                                )}
                                title={collapsed ? item.label : undefined}
                            >
                                <item.icon className="shrink-0" size={18} />
                                {!collapsed && <span>{item.label}</span>}
                                {isActive && !collapsed && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* User info bottom */}
            {user && !collapsed && (
                <div className="px-4 py-4 border-t border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary">
                                {user.name.charAt(0)}
                            </span>
                        </div>
                        <div className="overflow-hidden flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{user.role}</p>
                        </div>
                    </div>
                </div>
            )}
            {user && collapsed && (
                <div className="px-3 py-4 border-t border-border flex justify-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">{user.name.charAt(0)}</span>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onMobileClose}
                />
            )}

            {/* Mobile sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 bottom-0 z-50 w-64 bg-card border-r border-border md:hidden transition-transform duration-300",
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {sidebarContent}
            </aside>

            {/* Desktop sidebar */}
            <aside
                className={cn(
                    "hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-30 bg-card border-r border-border transition-all duration-300",
                    collapsed ? "w-16" : "w-60"
                )}
            >
                {sidebarContent}
            </aside>
        </>
    );
}
