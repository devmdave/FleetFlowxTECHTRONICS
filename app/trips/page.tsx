"use client";

import { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { mockTrips } from "@/lib/mockData";
import { getTripStatusColor, formatDate, cn } from "@/lib/utils";
import {
    Route,
    MapPin,
    ArrowRight,
    Search,
    ChevronDown,
    Package,
    Clock,
    CheckCircle2,
    XCircle,
    Navigation,
} from "lucide-react";
import type { TripStatus } from "@/types";

const STATUSES: (TripStatus | "All")[] = ["All", "Scheduled", "In Transit", "Delivered", "Cancelled"];

const statusIcons: Record<TripStatus, React.ElementType> = {
    Scheduled: Clock,
    "In Transit": Navigation,
    Delivered: CheckCircle2,
    Cancelled: XCircle,
};

export default function TripsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<TripStatus | "All">("All");

    const filtered = useMemo(() => {
        return mockTrips.filter((t) => {
            if (statusFilter !== "All" && t.status !== statusFilter) return false;
            if (search) {
                const q = search.toLowerCase();
                return (
                    t.vehicleName.toLowerCase().includes(q) ||
                    t.driverName.toLowerCase().includes(q) ||
                    t.origin.toLowerCase().includes(q) ||
                    t.destination.toLowerCase().includes(q) ||
                    t.cargoDescription.toLowerCase().includes(q)
                );
            }
            return true;
        });
    }, [search, statusFilter]);

    const stats = {
        total: mockTrips.length,
        inTransit: mockTrips.filter((t) => t.status === "In Transit").length,
        delivered: mockTrips.filter((t) => t.status === "Delivered").length,
        scheduled: mockTrips.filter((t) => t.status === "Scheduled").length,
    };

    return (
        <AppShell pageTitle="Trips">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">Trips</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Track and manage all fleet movements</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Total Trips", value: stats.total, color: "text-foreground", bg: "bg-muted" },
                    { label: "In Transit", value: stats.inTransit, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
                    { label: "Delivered", value: stats.delivered, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
                    { label: "Scheduled", value: stats.scheduled, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30" },
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
                        placeholder="Search vehicle, driver, route, cargo…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as TripStatus | "All")}
                        className="appearance-none input-base pr-8 cursor-pointer min-w-[140px]"
                    >
                        {STATUSES.map((s) => <option key={s} value={s}>{s === "All" ? "All Status" : s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                </div>
            </div>

            {/* Trip Cards */}
            {filtered.length === 0 ? (
                <div className="card-base p-12 text-center">
                    <Route className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-semibold">No trips found</h3>
                    <p className="text-sm text-muted-foreground mt-1">Try adjusting filters</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filtered.map((trip) => {
                        const Icon = statusIcons[trip.status];
                        return (
                            <div key={trip.id} className="card-base p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs text-muted-foreground">#{trip.id.toUpperCase()}</span>
                                        <span className={cn("status-badge", getTripStatusColor(trip.status))}>
                                            <Icon className="w-3 h-3" />
                                            {trip.status}
                                        </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{formatDate(trip.scheduledDate)}</span>
                                </div>

                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex-1 text-center">
                                        <div className="flex items-center justify-center gap-1.5 text-sm">
                                            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                            <span className="font-medium text-foreground truncate">{trip.origin}</span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">Origin</p>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 shrink-0 px-2">
                                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-[10px] text-muted-foreground">{trip.distance} km</span>
                                    </div>
                                    <div className="flex-1 text-center">
                                        <div className="flex items-center justify-center gap-1.5 text-sm">
                                            <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                            <span className="font-medium text-foreground truncate">{trip.destination}</span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">Destination</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 mb-3 p-2.5 bg-muted/50 rounded-lg">
                                    <Package className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                    <span className="text-xs text-foreground flex-1 truncate">{trip.cargoDescription}</span>
                                    <span className="text-xs text-muted-foreground shrink-0">{trip.weight.toLocaleString()} kg</span>
                                </div>

                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>🚛 {trip.vehicleName}</span>
                                    <span>👤 {trip.driverName}</span>
                                    {trip.actualArrival && (
                                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ Delivered</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </AppShell>
    );
}
