"use client";

import { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { mockDrivers } from "@/lib/mockData";
import { cn, formatDate, getDriverStatusColor, getSafetyScoreColor } from "@/lib/utils";
import type { Driver, DriverStatus } from "@/types";
import {
    Shield,
    Users,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    X,
    Activity,
    CreditCard,
    Phone,
    Mail,
    MapPin,
    TrendingUp,
    Award,
    Ban,
    RefreshCw,
    ChevronDown,
    Search,
    Eye,
    Star,
    AlertCircle,
    UserCheck,
    UserX,
    UserMinus,
} from "lucide-react";

// ─── Types for extended driver performance data ───────────────────────────────

interface DriverPerformance {
    driver: Driver;
    licenseStatus: "Valid" | "Expiring Soon" | "Expired";
    daysUntilExpiry: number;
    completionRate: number;
    assignedTrips: number;
    completedTrips: number;
    accidents: number;
    lateArrivals: number;
    trafficViolations: number;
    safetyScore: number;
    operationalStatus: "On Duty" | "Off Duty" | "Suspended";
}

// ─── Mock extended performance data (self-contained, no external mutation) ────

const MOCK_PERFORMANCE_EXTRAS: Record<
    string,
    {
        assignedTrips: number;
        completedTrips: number;
        accidents: number;
        lateArrivals: number;
        trafficViolations: number;
        operationalStatus: "On Duty" | "Off Duty" | "Suspended";
    }
> = {
    d001: { assignedTrips: 325, completedTrips: 312, accidents: 0, lateArrivals: 4, trafficViolations: 0, operationalStatus: "On Duty" },
    d002: { assignedTrips: 190, completedTrips: 178, accidents: 0, lateArrivals: 6, trafficViolations: 1, operationalStatus: "On Duty" },
    d003: { assignedTrips: 270, completedTrips: 241, accidents: 1, lateArrivals: 12, trafficViolations: 2, operationalStatus: "On Duty" },
    d004: { assignedTrips: 98, completedTrips: 95, accidents: 0, lateArrivals: 1, trafficViolations: 0, operationalStatus: "On Duty" },
    d005: { assignedTrips: 440, completedTrips: 407, accidents: 1, lateArrivals: 10, trafficViolations: 1, operationalStatus: "On Duty" },
    d006: { assignedTrips: 302, completedTrips: 289, accidents: 0, lateArrivals: 5, trafficViolations: 0, operationalStatus: "On Duty" },
    d007: { assignedTrips: 560, completedTrips: 523, accidents: 3, lateArrivals: 22, trafficViolations: 4, operationalStatus: "Off Duty" },
    d008: { assignedTrips: 142, completedTrips: 134, accidents: 0, lateArrivals: 3, trafficViolations: 0, operationalStatus: "On Duty" },
    d009: { assignedTrips: 375, completedTrips: 348, accidents: 2, lateArrivals: 14, trafficViolations: 2, operationalStatus: "Off Duty" },
    d010: { assignedTrips: 70, completedTrips: 61, accidents: 4, lateArrivals: 18, trafficViolations: 5, operationalStatus: "Suspended" },
};

// ─── Helper: compute license status ──────────────────────────────────────────

function getLicenseStatus(expiryDate: string): { status: "Valid" | "Expiring Soon" | "Expired"; daysUntilExpiry: number } {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffMs = expiry.getTime() - now.getTime();
    const daysUntilExpiry = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return { status: "Expired", daysUntilExpiry };
    if (daysUntilExpiry <= 30) return { status: "Expiring Soon", daysUntilExpiry };
    return { status: "Valid", daysUntilExpiry };
}

// ─── Helper: compute safety score from deductions ────────────────────────────

function computeSafetyScore(accidents: number, lateArrivals: number, violations: number): number {
    const base = 100;
    const deduction = accidents * 15 + lateArrivals * 2 + violations * 8;
    return Math.max(0, Math.min(100, base - deduction));
}

// ─── Build enriched driver performance list (uses only mockDrivers + local extras) ──

function buildDriverPerformanceList(): DriverPerformance[] {
    return mockDrivers.map((driver) => {
        const extras = MOCK_PERFORMANCE_EXTRAS[driver.id] ?? {
            assignedTrips: driver.totalTrips + 10,
            completedTrips: driver.totalTrips,
            accidents: 0,
            lateArrivals: 5,
            trafficViolations: 0,
            operationalStatus: "On Duty" as const,
        };

        const { status: licenseStatus, daysUntilExpiry } = getLicenseStatus(driver.licenseExpiry);
        const completionRate =
            extras.assignedTrips > 0
                ? (extras.completedTrips / extras.assignedTrips) * 100
                : 0;
        const safetyScore = computeSafetyScore(extras.accidents, extras.lateArrivals, extras.trafficViolations);

        return {
            driver,
            licenseStatus,
            daysUntilExpiry,
            completionRate,
            assignedTrips: extras.assignedTrips,
            completedTrips: extras.completedTrips,
            accidents: extras.accidents,
            lateArrivals: extras.lateArrivals,
            trafficViolations: extras.trafficViolations,
            safetyScore,
            operationalStatus: extras.operationalStatus,
        };
    });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LicenseBadge({ status }: { status: "Valid" | "Expiring Soon" | "Expired" }) {
    if (status === "Expired") {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                <XCircle className="w-3 h-3" />
                Expired
            </span>
        );
    }
    if (status === "Expiring Soon") {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                <AlertTriangle className="w-3 h-3" />
                Expiring Soon
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <CheckCircle className="w-3 h-3" />
            Valid
        </span>
    );
}

function OperationalBadge({ status }: { status: "On Duty" | "Off Duty" | "Suspended" }) {
    if (status === "On Duty") {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                <Activity className="w-3 h-3" />
                On Duty
            </span>
        );
    }
    if (status === "Off Duty") {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <Clock className="w-3 h-3" />
                Off Duty
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <Ban className="w-3 h-3" />
            Suspended
        </span>
    );
}

function SafetyBar({ score }: { score: number }) {
    const color =
        score >= 95 ? "bg-emerald-500" :
            score >= 85 ? "bg-blue-500" :
                score >= 70 ? "bg-amber-500" : "bg-red-500";
    return (
        <div className="flex items-center gap-2 w-full">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                    className={cn("h-full rounded-full transition-all", color)}
                    style={{ width: `${score}%` }}
                />
            </div>
            <span className={cn("text-xs font-semibold w-8 text-right", getSafetyScoreColor(score))}>
                {score}
            </span>
        </div>
    );
}

// ─── Driver Detail Modal ──────────────────────────────────────────────────────

function DriverDetailModal({
    perf,
    onClose,
    onStatusChange,
}: {
    perf: DriverPerformance;
    onClose: () => void;
    onStatusChange: (driverId: string, status: "On Duty" | "Off Duty" | "Suspended") => void;
}) {
    const { driver, licenseStatus, daysUntilExpiry, completionRate, assignedTrips, completedTrips, accidents, lateArrivals, trafficViolations, safetyScore, operationalStatus } = perf;

    const scoreColor =
        safetyScore >= 95 ? "#10b981" :
            safetyScore >= 85 ? "#3b82f6" :
                safetyScore >= 70 ? "#f59e0b" : "#ef4444";

    const circumference = 2 * Math.PI * 40;
    const dashOffset = circumference - (safetyScore / 100) * circumference;

    const isBlocked = licenseStatus === "Expired" || operationalStatus === "Suspended";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <span className="text-2xl font-bold text-primary">{driver.name.charAt(0)}</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">{driver.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <MapPin className="w-3 h-3 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{driver.region} Region</span>
                                <span className="text-muted-foreground">·</span>
                                <span className="text-xs text-muted-foreground">License Class {driver.licenseClass}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Blocked warning */}
                {isBlocked && (
                    <div className="mx-6 mt-4 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                        <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                            {licenseStatus === "Expired"
                                ? "⛔ This driver is blocked from trip assignment — license has expired."
                                : "⛔ This driver is suspended and cannot receive trip assignments."}
                        </p>
                    </div>
                )}

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* License Info Card */}
                    <div className="card-base p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="font-semibold text-sm text-foreground">License Info</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">License #</span>
                                <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded font-medium">{driver.licenseNumber}</code>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Class</span>
                                <span className="text-sm font-semibold text-foreground">Class {driver.licenseClass}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Expires</span>
                                <span className="text-sm font-medium text-foreground">{formatDate(driver.licenseExpiry)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Status</span>
                                <LicenseBadge status={licenseStatus} />
                            </div>
                            {licenseStatus !== "Expired" && (
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground">Days left</span>
                                    <span className={cn("text-sm font-semibold",
                                        licenseStatus === "Expiring Soon" ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                                    )}>
                                        {daysUntilExpiry} days
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Safety Overview Card */}
                    <div className="card-base p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="font-semibold text-sm text-foreground">Safety Overview</span>
                        </div>
                        <div className="flex items-center justify-center mb-4">
                            <div className="relative w-24 h-24">
                                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
                                    <circle
                                        cx="50" cy="50" r="40" fill="none"
                                        stroke={scoreColor} strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={dashOffset}
                                        style={{ transition: "stroke-dashoffset 0.6s ease" }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xl font-bold text-foreground">{safetyScore}</span>
                                    <span className="text-[9px] text-muted-foreground">/100</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-red-500" /> Accidents</span>
                                <span className="font-semibold text-foreground">{accidents}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3 text-amber-500" /> Late Arrivals</span>
                                <span className="font-semibold text-foreground">{lateArrivals}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground flex items-center gap-1"><XCircle className="w-3 h-3 text-orange-500" /> Traffic Violations</span>
                                <span className="font-semibold text-foreground">{trafficViolations}</span>
                            </div>
                        </div>
                    </div>

                    {/* Performance Metrics Card */}
                    <div className="card-base p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span className="font-semibold text-sm text-foreground">Performance Metrics</span>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-muted-foreground">Completion Rate</span>
                                    <span className={cn("text-sm font-bold",
                                        completionRate >= 95 ? "text-emerald-600 dark:text-emerald-400" :
                                            completionRate >= 85 ? "text-blue-600 dark:text-blue-400" :
                                                completionRate >= 70 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"
                                    )}>
                                        {completionRate.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full rounded-full transition-all",
                                            completionRate >= 95 ? "bg-emerald-500" :
                                                completionRate >= 85 ? "bg-blue-500" :
                                                    completionRate >= 70 ? "bg-amber-500" : "bg-red-500"
                                        )}
                                        style={{ width: `${completionRate}%` }}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div className="bg-muted/50 rounded-lg p-3">
                                    <p className="text-[10px] text-muted-foreground mb-0.5">Assigned Trips</p>
                                    <p className="text-lg font-bold text-foreground">{assignedTrips}</p>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-3">
                                    <p className="text-[10px] text-muted-foreground mb-0.5">Completed</p>
                                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{completedTrips}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status Controls Card */}
                    <div className="card-base p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <RefreshCw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <span className="font-semibold text-sm text-foreground">Status Controls</span>
                        </div>
                        <div className="mb-4">
                            <p className="text-xs text-muted-foreground mb-2">Current Operational Status</p>
                            <OperationalBadge status={operationalStatus} />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground font-medium">Change Status</p>
                            {(["On Duty", "Off Duty", "Suspended"] as const).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => onStatusChange(driver.id, s)}
                                    disabled={s === operationalStatus}
                                    className={cn(
                                        "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                        s === operationalStatus
                                            ? "bg-primary/10 text-primary border border-primary/30 cursor-default"
                                            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                                    )}
                                >
                                    {s === "On Duty" && <UserCheck className="w-4 h-4" />}
                                    {s === "Off Duty" && <UserMinus className="w-4 h-4" />}
                                    {s === "Suspended" && <UserX className="w-4 h-4" />}
                                    {s}
                                    {s === operationalStatus && (
                                        <span className="ml-auto text-[10px] font-medium text-primary">Active</span>
                                    )}
                                </button>
                            ))}
                            {operationalStatus === "Suspended" && (
                                <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                                    ⛔ Suspended drivers cannot receive trip assignments.
                                </p>
                            )}
                        </div>

                        {/* Contact */}
                        <div className="mt-4 pt-4 border-t border-border space-y-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Mail className="w-3 h-3 shrink-0" />
                                <span className="truncate">{driver.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Phone className="w-3 h-3 shrink-0" />
                                <span>{driver.phone}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const STATUS_FILTERS = ["All", "On Duty", "Off Duty", "Suspended"] as const;
const LICENSE_FILTERS = ["All", "Valid", "Expiring Soon", "Expired"] as const;

export default function DriverPerformanceSafetyPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<typeof STATUS_FILTERS[number]>("All");
    const [licenseFilter, setLicenseFilter] = useState<typeof LICENSE_FILTERS[number]>("All");
    const [selectedDriver, setSelectedDriver] = useState<DriverPerformance | null>(null);

    // Local mutable status overrides (page-scoped only — no global state mutation)
    const [statusOverrides, setStatusOverrides] = useState<Record<string, "On Duty" | "Off Duty" | "Suspended">>({});

    const baseData = useMemo(() => buildDriverPerformanceList(), []);

    const performanceData = useMemo(() => {
        return baseData.map((perf) => ({
            ...perf,
            operationalStatus: statusOverrides[perf.driver.id] ?? perf.operationalStatus,
        }));
    }, [baseData, statusOverrides]);

    const filtered = useMemo(() => {
        return performanceData.filter((p) => {
            if (statusFilter !== "All" && p.operationalStatus !== statusFilter) return false;
            if (licenseFilter !== "All" && p.licenseStatus !== licenseFilter) return false;
            if (search) {
                const q = search.toLowerCase();
                return (
                    p.driver.name.toLowerCase().includes(q) ||
                    p.driver.licenseNumber.toLowerCase().includes(q) ||
                    p.driver.region.toLowerCase().includes(q)
                );
            }
            return true;
        });
    }, [performanceData, statusFilter, licenseFilter, search]);

    const handleStatusChange = (driverId: string, status: "On Duty" | "Off Duty" | "Suspended") => {
        setStatusOverrides((prev) => ({ ...prev, [driverId]: status }));
        // Update selected driver modal if open
        setSelectedDriver((prev) =>
            prev && prev.driver.id === driverId
                ? { ...prev, operationalStatus: status }
                : prev
        );
    };

    // Summary KPIs
    const totalDrivers = performanceData.length;
    const onDuty = performanceData.filter((p) => p.operationalStatus === "On Duty").length;
    const suspended = performanceData.filter((p) => p.operationalStatus === "Suspended").length;
    const expired = performanceData.filter((p) => p.licenseStatus === "Expired").length;
    const expiringSoon = performanceData.filter((p) => p.licenseStatus === "Expiring Soon").length;
    const avgCompletion = performanceData.reduce((a, b) => a + b.completionRate, 0) / totalDrivers;
    const avgSafety = Math.round(performanceData.reduce((a, b) => a + b.safetyScore, 0) / totalDrivers);

    return (
        <AppShell pageTitle="Driver Performance & Safety" requiredRoles={["Safety Officer"]}>
            {/* Page Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Driver Performance & Safety</h1>
                        <p className="text-sm text-muted-foreground">
                            HR compliance, performance metrics, and safety management
                        </p>
                    </div>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {[
                    { label: "Total Drivers", value: totalDrivers, icon: Users, color: "text-foreground", bg: "bg-muted/50" },
                    { label: "On Duty", value: onDuty, icon: UserCheck, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
                    { label: "Suspended", value: suspended, icon: Ban, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20" },
                    { label: "Expired Licenses", value: expired, icon: XCircle, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20" },
                    { label: "Expiring Soon", value: expiringSoon, icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
                    { label: "Avg Safety Score", value: `${avgSafety}`, icon: Star, color: getSafetyScoreColor(avgSafety), bg: "bg-muted/50" },
                ].map((kpi) => (
                    <div key={kpi.label} className={cn("card-base p-4", kpi.bg)}>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-1.5">{kpi.label}</p>
                        <div className="flex items-center gap-2">
                            <kpi.icon className={cn("w-4 h-4 shrink-0", kpi.color)} />
                            <p className={cn("text-xl font-bold", kpi.color)}>{kpi.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="card-base p-4 mb-5 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        className="input-base pl-9"
                        placeholder="Search drivers by name, license, region…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as typeof STATUS_FILTERS[number])}
                        className="appearance-none input-base pr-8 cursor-pointer min-w-[150px]"
                    >
                        {STATUS_FILTERS.map((s) => (
                            <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                </div>
                <div className="relative">
                    <select
                        value={licenseFilter}
                        onChange={(e) => setLicenseFilter(e.target.value as typeof LICENSE_FILTERS[number])}
                        className="appearance-none input-base pr-8 cursor-pointer min-w-[160px]"
                    >
                        {LICENSE_FILTERS.map((s) => (
                            <option key={s} value={s}>{s === "All" ? "All License Status" : s}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                </div>
            </div>

            {/* Driver Table */}
            <div className="card-base overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                            <Users className="w-7 h-7 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">No drivers match filters</h3>
                        <p className="text-sm text-muted-foreground">Adjust the search or filter criteria.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Driver</th>
                                    <th>License Status</th>
                                    <th>Completion Rate</th>
                                    <th>Safety Score</th>
                                    <th>Operational Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((perf) => {
                                    const isBlocked = perf.licenseStatus === "Expired" || perf.operationalStatus === "Suspended";
                                    return (
                                        <tr key={perf.driver.id} className={cn(isBlocked && "bg-red-50/50 dark:bg-red-900/5")}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                                        <span className="text-sm font-bold text-primary">{perf.driver.name.charAt(0)}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground text-sm">{perf.driver.name}</p>
                                                        <p className="text-xs text-muted-foreground">{perf.driver.region} · Class {perf.driver.licenseClass}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <LicenseBadge status={perf.licenseStatus} />
                                                    {perf.licenseStatus === "Expiring Soon" && (
                                                        <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">{perf.daysUntilExpiry}d left</p>
                                                    )}
                                                    {perf.licenseStatus === "Expired" && (
                                                        <p className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">Blocked from assignment</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="w-32">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-xs text-muted-foreground">{perf.completionRate.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className={cn("h-full rounded-full",
                                                                perf.completionRate >= 95 ? "bg-emerald-500" :
                                                                    perf.completionRate >= 85 ? "bg-blue-500" :
                                                                        perf.completionRate >= 70 ? "bg-amber-500" : "bg-red-500"
                                                            )}
                                                            style={{ width: `${perf.completionRate}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground mt-0.5">{perf.completedTrips}/{perf.assignedTrips} trips</p>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="w-28">
                                                    <SafetyBar score={perf.safetyScore} />
                                                </div>
                                            </td>
                                            <td>
                                                <OperationalBadge status={perf.operationalStatus} />
                                                {perf.operationalStatus === "Suspended" && (
                                                    <p className="text-[10px] text-red-500 mt-0.5">No assignments</p>
                                                )}
                                            </td>
                                            <td className="text-right">
                                                <button
                                                    onClick={() => setSelectedDriver(perf)}
                                                    className="btn-secondary gap-1.5 text-xs py-1.5 px-3"
                                                    id={`view-driver-${perf.driver.id}`}
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    Details
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer summary */}
                {filtered.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
                        <span className="text-xs text-muted-foreground">
                            Showing {filtered.length} of {totalDrivers} drivers
                        </span>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-emerald-500" />
                                Avg Completion: <span className="font-semibold text-foreground ml-1">{avgCompletion.toFixed(1)}%</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <Award className="w-3 h-3 text-blue-500" />
                                Avg Safety: <span className="font-semibold text-foreground ml-1">{avgSafety}/100</span>
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Driver Detail Modal */}
            {selectedDriver && (
                <DriverDetailModal
                    perf={selectedDriver}
                    onClose={() => setSelectedDriver(null)}
                    onStatusChange={handleStatusChange}
                />
            )}
        </AppShell>
    );
}
