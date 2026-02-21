"use client";

import { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { mockDrivers } from "@/lib/mockData";
import { getDriverStatusColor, getSafetyScoreColor, formatDate, cn } from "@/lib/utils";
import {
    Users,
    Search,
    ChevronDown,
    Shield,
    Star,
    Phone,
    Mail,
    CreditCard,
} from "lucide-react";
import type { DriverStatus } from "@/types";

const STATUSES: (DriverStatus | "All")[] = ["All", "Available", "On Trip", "Off Duty", "Suspended"];

export default function DriversPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<DriverStatus | "All">("All");

    const filtered = useMemo(() => {
        return mockDrivers.filter((d) => {
            if (statusFilter !== "All" && d.status !== statusFilter) return false;
            if (search) {
                const q = search.toLowerCase();
                return (
                    d.name.toLowerCase().includes(q) ||
                    d.email.toLowerCase().includes(q) ||
                    d.licenseNumber.toLowerCase().includes(q) ||
                    d.region.toLowerCase().includes(q)
                );
            }
            return true;
        });
    }, [search, statusFilter]);

    const avgScore = Math.round(mockDrivers.reduce((acc, d) => acc + d.safetyScore, 0) / mockDrivers.length);

    return (
        <AppShell pageTitle="Drivers">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">Drivers</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                    {mockDrivers.length} registered drivers · Avg safety score: {avgScore}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Total Drivers", value: mockDrivers.length, color: "text-foreground" },
                    { label: "Available", value: mockDrivers.filter((d) => d.status === "Available").length, color: "text-emerald-600 dark:text-emerald-400" },
                    { label: "On Trip", value: mockDrivers.filter((d) => d.status === "On Trip").length, color: "text-blue-600 dark:text-blue-400" },
                    { label: "Avg Safety", value: `${avgScore}%`, color: getSafetyScoreColor(avgScore) },
                ].map((s) => (
                    <div key={s.label} className="card-base p-4">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{s.label}</p>
                        <p className={cn("text-2xl font-bold mt-1", s.color)}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="card-base p-4 mb-5 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        className="input-base pl-9"
                        placeholder="Search name, email, license, region…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as DriverStatus | "All")}
                        className="appearance-none input-base pr-8 cursor-pointer min-w-[140px]"
                    >
                        {STATUSES.map((s) => <option key={s} value={s}>{s === "All" ? "All Status" : s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                </div>
            </div>

            {/* Driver Cards Grid */}
            {filtered.length === 0 ? (
                <div className="card-base p-12 text-center">
                    <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-semibold">No drivers found</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((driver) => (
                        <div key={driver.id} className="card-base p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                            {/* Header */}
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                    <span className="text-lg font-bold text-primary">{driver.name.charAt(0)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="font-semibold text-foreground">{driver.name}</p>
                                            <p className="text-xs text-muted-foreground">{driver.region} Region</p>
                                        </div>
                                        <span className={cn("status-badge text-[10px] shrink-0", getDriverStatusColor(driver.status))}>
                                            {driver.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Safety Score */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Shield className="w-3 h-3" /> Safety Score
                                    </span>
                                    <span className={cn("text-sm font-bold", getSafetyScoreColor(driver.safetyScore))}>
                                        {driver.safetyScore}/100
                                    </span>
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all",
                                            driver.safetyScore >= 95 ? "bg-emerald-500" :
                                                driver.safetyScore >= 85 ? "bg-blue-500" :
                                                    driver.safetyScore >= 70 ? "bg-amber-500" : "bg-red-500"
                                        )}
                                        style={{ width: `${driver.safetyScore}%` }}
                                    />
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <div className="bg-muted/50 rounded-lg p-2.5">
                                    <p className="text-[10px] text-muted-foreground mb-0.5">Total Trips</p>
                                    <p className="text-sm font-semibold text-foreground">{driver.totalTrips}</p>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-2.5">
                                    <p className="text-[10px] text-muted-foreground mb-0.5">License Class</p>
                                    <p className="text-sm font-semibold text-foreground">Class {driver.licenseClass}</p>
                                </div>
                            </div>

                            {/* Contact */}
                            <div className="space-y-1.5 border-t border-border pt-3">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Mail className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{driver.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Phone className="w-3 h-3 shrink-0" />
                                    <span>{driver.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <CreditCard className="w-3 h-3 shrink-0" />
                                    <span>Expires: {formatDate(driver.licenseExpiry)}</span>
                                    {new Date(driver.licenseExpiry) < new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) && (
                                        <span className="text-amber-500 font-medium ml-auto">⚠ Soon</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AppShell>
    );
}
