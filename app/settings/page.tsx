"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useAuthStore } from "@/store/useAuthStore";
import { useState } from "react";
import { useToast } from "@/components/layout/ToastProvider";
import { cn } from "@/lib/utils";
import {
    Settings,
    User,
    Bell,
    Shield,
    Palette,
    Globe,
    Save,
    ChevronRight,
} from "lucide-react";

const TABS = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "system", label: "System", icon: Globe },
];

export default function SettingsPage() {
    const { user } = useAuthStore();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState("profile");
    const [profileName, setProfileName] = useState(user?.name || "");
    const [profileEmail, setProfileEmail] = useState(user?.email || "");
    const [notifs, setNotifs] = useState({
        email: true,
        push: true,
        maintenance: true,
        trips: false,
        finance: true,
    });

    const handleSave = () => {
        showToast("success", "Settings saved", "Your preferences have been updated.");
    };

    return (
        <AppShell pageTitle="Settings">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">Settings</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Manage your account and application preferences</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar Tabs */}
                <div className="card-base p-2 md:col-span-1 h-fit">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                activeTab === tab.id
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            <ChevronRight className={cn("w-3.5 h-3.5 ml-auto transition-transform", activeTab === tab.id && "text-primary")} />
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="md:col-span-3 card-base p-6">
                    {activeTab === "profile" && (
                        <div>
                            <h3 className="font-semibold text-lg mb-1">Profile Information</h3>
                            <p className="text-sm text-muted-foreground mb-6">Update your display name and email address.</p>
                            <div className="flex items-center gap-4 mb-6 p-4 bg-muted/50 rounded-xl">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-primary">{user?.name.charAt(0)}</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">{user?.name}</p>
                                    <p className="text-sm text-muted-foreground">{user?.role}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">ID: {user?.id}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Display Name</label>
                                    <input
                                        className="input-base"
                                        value={profileName}
                                        onChange={(e) => setProfileName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        className="input-base"
                                        value={profileEmail}
                                        onChange={(e) => setProfileEmail(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
                                    <input className="input-base bg-muted cursor-not-allowed" value={user?.role || ""} readOnly />
                                    <p className="text-xs text-muted-foreground mt-1">Role is managed by your administrator.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "notifications" && (
                        <div>
                            <h3 className="font-semibold text-lg mb-1">Notification Preferences</h3>
                            <p className="text-sm text-muted-foreground mb-6">Choose what alerts you receive.</p>
                            <div className="space-y-4">
                                {Object.entries(notifs).map(([key, val]) => {
                                    const labels: Record<string, { label: string; desc: string }> = {
                                        email: { label: "Email Notifications", desc: "Receive alerts via email" },
                                        push: { label: "Push Notifications", desc: "Browser push alerts" },
                                        maintenance: { label: "Maintenance Alerts", desc: "When a vehicle needs service" },
                                        trips: { label: "Trip Updates", desc: "Status changes on active trips" },
                                        finance: { label: "Finance Reports", desc: "Monthly financial summaries" },
                                    };
                                    return (
                                        <div key={key} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{labels[key]?.label}</p>
                                                <p className="text-xs text-muted-foreground">{labels[key]?.desc}</p>
                                            </div>
                                            <button
                                                onClick={() => setNotifs((n: typeof notifs) => ({ ...n, [key]: !val }))}
                                                className={cn(
                                                    "relative w-10 h-5 rounded-full transition-colors duration-200",
                                                    val ? "bg-primary" : "bg-muted-foreground/30"
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200",
                                                        val && "translate-x-5"
                                                    )}
                                                />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === "security" && (
                        <div>
                            <h3 className="font-semibold text-lg mb-1">Security</h3>
                            <p className="text-sm text-muted-foreground mb-6">Manage your password and session.</p>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Current Password</label>
                                    <input type="password" className="input-base" placeholder="••••••••" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">New Password</label>
                                    <input type="password" className="input-base" placeholder="••••••••" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Confirm New Password</label>
                                    <input type="password" className="input-base" placeholder="••••••••" />
                                </div>
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                                    <p className="text-sm text-amber-700 dark:text-amber-400">
                                        🔒 Password changes require re-authentication in a live system. This is a demo environment.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "appearance" && (
                        <div>
                            <h3 className="font-semibold text-lg mb-1">Appearance</h3>
                            <p className="text-sm text-muted-foreground mb-6">Customize the look and feel of FleetFlow.</p>
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">Use the <strong>Moon/Sun icon</strong> in the top navbar to toggle dark mode.</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {["Default Blue", "Indigo", "Emerald", "Violet"].map((theme, i) => (
                                        <div
                                            key={theme}
                                            className={cn(
                                                "p-4 rounded-xl border-2 cursor-pointer transition-all",
                                                i === 0 ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                                            )}
                                        >
                                            <div className={cn("w-6 h-6 rounded-full mb-2", ["bg-blue-500", "bg-indigo-500", "bg-emerald-500", "bg-violet-500"][i])} />
                                            <p className="text-sm font-medium">{theme}</p>
                                            {i === 0 && <p className="text-xs text-primary mt-0.5">Active</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "system" && (
                        <div>
                            <h3 className="font-semibold text-lg mb-1">System</h3>
                            <p className="text-sm text-muted-foreground mb-6">Application information and data management.</p>
                            <div className="space-y-3">
                                {[
                                    { label: "Application Version", value: "1.0.0 (Demo)" },
                                    { label: "Data Mode", value: "Mock / Local Storage" },
                                    { label: "Next.js Version", value: "14.2.5" },
                                    { label: "Environment", value: "Development" },
                                    { label: "Last Updated", value: "Feb 21, 2025" },
                                ].map((row) => (
                                    <div key={row.label} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                        <span className="text-sm text-muted-foreground">{row.label}</span>
                                        <span className="text-sm font-medium text-foreground">{row.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Save button */}
                    <div className="flex justify-end mt-6 pt-5 border-t border-border">
                        <button onClick={handleSave} className="btn-primary">
                            <Save className="w-4 h-4" />
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
