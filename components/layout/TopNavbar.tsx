"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
import {
    Menu,
    Bell,
    Sun,
    Moon,
    LogOut,
    ChevronDown,
    Shield,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface TopNavbarProps {
    onMenuClick: () => void;
    sidebarCollapsed: boolean;
    pageTitle: string;
}

export function TopNavbar({ onMenuClick, sidebarCollapsed, pageTitle }: TopNavbarProps) {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const [darkMode, setDarkMode] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    // Dark mode
    useEffect(() => {
        const saved = localStorage.getItem("fleetflow-theme");
        if (saved === "dark") {
            document.documentElement.classList.add("dark");
            setDarkMode(true);
        }
    }, []);

    const toggleDark = () => {
        const next = !darkMode;
        setDarkMode(next);
        if (next) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("fleetflow-theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("fleetflow-theme", "light");
        }
    };

    // Click outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const getRoleColor = (role?: string) => {
        switch (role) {
            case "Manager": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
            case "Dispatcher": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
            case "Safety Officer": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
            case "Financial Analyst": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
            default: return "bg-muted text-muted-foreground";
        }
    };

    const mockNotifications = [
        { id: 1, text: "Scania R500 requires maintenance check", time: "2m ago", urgent: true },
        { id: 2, text: "Trip #t003 delivered ahead of schedule", time: "18m ago", urgent: false },
        { id: 3, text: "Kevin Thompson license expires in 6 months", time: "1h ago", urgent: true },
        { id: 4, text: "New shipment request from Dallas hub", time: "2h ago", urgent: false },
    ];

    return (
        <header
            className={cn(
                "fixed top-0 right-0 z-20 h-16 bg-card/80 backdrop-blur-md border-b border-border",
                "flex items-center px-4 gap-3 transition-all duration-300",
                sidebarCollapsed ? "left-16" : "left-0 md:left-60"
            )}
        >
            {/* Mobile menu button */}
            <button
                id="mobile-menu-btn"
                onClick={onMenuClick}
                className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Open menu"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Page title */}
            <div className="flex-1 min-w-0">
                <h1 className="text-base font-semibold text-foreground truncate">{pageTitle}</h1>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
                {/* Dark mode toggle */}
                <button
                    id="dark-mode-toggle"
                    onClick={toggleDark}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    aria-label="Toggle dark mode"
                >
                    {darkMode ? <Sun className="w-4.5 h-4.5" size={18} /> : <Moon className="w-4.5 h-4.5" size={18} />}
                </button>

                {/* Notifications */}
                <div ref={notifRef} className="relative">
                    <button
                        id="notifications-btn"
                        onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }}
                        className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        aria-label="Notifications"
                    >
                        <Bell className="w-4.5 h-4.5" size={18} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                    </button>

                    {notifOpen && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                                <h3 className="font-semibold text-sm">Notifications</h3>
                                <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
                                    {mockNotifications.filter(n => n.urgent).length} urgent
                                </span>
                            </div>
                            <div className="divide-y divide-border max-h-72 overflow-y-auto custom-scrollbar">
                                {mockNotifications.map((n) => (
                                    <div key={n.id} className="px-4 py-3 hover:bg-muted/40 transition-colors cursor-pointer">
                                        <div className="flex items-start gap-2.5">
                                            {n.urgent && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                                            )}
                                            {!n.urgent && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-foreground">{n.text}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="px-4 py-2.5 border-t border-border">
                                <button className="text-xs text-primary hover:underline w-full text-center">
                                    Mark all as read
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* User dropdown */}
                <div ref={dropdownRef} className="relative">
                    <button
                        id="user-dropdown-btn"
                        onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
                        className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-accent transition-colors"
                    >
                        <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">{user?.name.charAt(0)}</span>
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-sm font-medium text-foreground leading-tight">{user?.name}</p>
                            <p className="text-[11px] text-muted-foreground">{user?.role}</p>
                        </div>
                        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", dropdownOpen && "rotate-180")} />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                            <div className="px-4 py-3 border-b border-border">
                                <p className="font-semibold text-sm text-foreground">{user?.name}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
                                <span className={cn("inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[11px] font-medium", getRoleColor(user?.role))}>
                                    <Shield className="w-3 h-3" />
                                    {user?.role}
                                </span>
                            </div>
                            <div className="p-1.5">
                                <button
                                    id="logout-btn"
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
