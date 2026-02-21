"use client";

import { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { UtilizationChart } from "@/components/dashboard/UtilizationChart";
import { RecentActivity, PendingShipments } from "@/components/dashboard/RecentActivity";
import { useFleetStore } from "@/store/useFleetStore";
import { mockTrips, mockDrivers, mockPendingShipments } from "@/lib/mockData";
import { formatNumber, formatCurrency } from "@/lib/utils";
import {
    Truck,
    Wrench,
    BarChart3,
    Package,
    ChevronDown,
    Users,
    Route,
    DollarSign,
} from "lucide-react";
import type { VehicleType } from "@/types";

const VEHICLE_TYPES: (VehicleType | "All")[] = ["All", "Truck", "Van", "Sedan", "SUV", "Bus"];
const REGIONS = ["All Regions", "North", "South", "East", "West"];
const STATUSES = ["All Status", "Active", "On Trip", "In Shop", "Retired"];

export default function DashboardPage() {
    const vehicles = useFleetStore((s) => s.vehicles);

    const [typeFilter, setTypeFilter] = useState<string>("All");
    const [regionFilter, setRegionFilter] = useState<string>("All Regions");
    const [statusFilter, setStatusFilter] = useState<string>("All Status");

    const filteredVehicles = useMemo(() => {
        return vehicles.filter((v) => {
            if (typeFilter !== "All" && v.type !== typeFilter) return false;
            if (regionFilter !== "All Regions" && v.region !== regionFilter) return false;
            if (statusFilter !== "All Status" && v.status !== statusFilter) return false;
            return true;
        });
    }, [vehicles, typeFilter, regionFilter, statusFilter]);

    // KPI calculations
    const activeFleet = filteredVehicles.filter((v) => v.status === "On Trip").length;
    const maintenanceAlerts = filteredVehicles.filter((v) => v.status === "In Shop").length;
    const assignedCount = filteredVehicles.filter((v) => v.status !== "Retired" && v.status !== "In Shop").length;
    const totalOperational = filteredVehicles.filter((v) => v.status !== "Retired").length;
    const utilizationRate = totalOperational > 0 ? Math.round((assignedCount / totalOperational) * 100) : 0;
    const pendingCargo = mockPendingShipments.length;

    const totalDrivers = mockDrivers.length;
    const activeDrivers = mockDrivers.filter((d) => d.status === "On Trip").length;
    const totalTripsThisMonth = mockTrips.filter((t) => t.status !== "Cancelled").length;

    return (
        <AppShell pageTitle="Command Center">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">Command Center</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Real-time fleet overview · {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Vehicle Type */}
                    <div className="relative">
                        <select
                            id="filter-type"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="appearance-none bg-card border border-border text-foreground text-sm rounded-lg pl-3 pr-8 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            {VEHICLE_TYPES.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    </div>

                    {/* Status */}
                    <div className="relative">
                        <select
                            id="filter-status"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none bg-card border border-border text-foreground text-sm rounded-lg pl-3 pr-8 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            {STATUSES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    </div>

                    {/* Region */}
                    <div className="relative">
                        <select
                            id="filter-region"
                            value={regionFilter}
                            onChange={(e) => setRegionFilter(e.target.value)}
                            className="appearance-none bg-card border border-border text-foreground text-sm rounded-lg pl-3 pr-8 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            {REGIONS.map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <KpiCard
                    title="Active Fleet"
                    value={activeFleet}
                    subtitle={`of ${filteredVehicles.length} filtered vehicles`}
                    icon={<Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                    iconBg="bg-blue-100 dark:bg-blue-900/30"
                    trend={{ value: 5.3, label: "vs last week" }}
                />
                <KpiCard
                    title="Maintenance Alerts"
                    value={maintenanceAlerts}
                    subtitle="Vehicles currently in shop"
                    icon={<Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                    iconBg="bg-amber-100 dark:bg-amber-900/30"
                    trend={{ value: -2, label: "vs last week" }}
                />
                <KpiCard
                    title="Utilization Rate"
                    value={`${utilizationRate}%`}
                    subtitle="Assigned vs idle fleet"
                    icon={<BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                    iconBg="bg-emerald-100 dark:bg-emerald-900/30"
                    trend={{ value: 8.1, label: "vs last month" }}
                />
                <KpiCard
                    title="Pending Cargo"
                    value={pendingCargo}
                    subtitle="Unassigned shipments"
                    icon={<Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                    iconBg="bg-purple-100 dark:bg-purple-900/30"
                    trend={{ value: 0, label: "no change" }}
                />
            </div>

            {/* Secondary KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="card-base p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Drivers</p>
                        <p className="text-xl font-bold text-foreground">{activeDrivers} <span className="text-sm font-normal text-muted-foreground">/ {totalDrivers} on duty</span></p>
                    </div>
                </div>
                <div className="card-base p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center shrink-0">
                        <Route className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Trips This Month</p>
                        <p className="text-xl font-bold text-foreground">{totalTripsThisMonth} <span className="text-sm font-normal text-muted-foreground">completed</span></p>
                    </div>
                </div>
                <div className="card-base p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
                        <DollarSign className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Revenue (Jan)</p>
                        <p className="text-xl font-bold text-foreground">{formatCurrency(235000)}</p>
                    </div>
                </div>
            </div>

            {/* Chart + Pending Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
                <div className="xl:col-span-2">
                    <UtilizationChart />
                </div>
                <div>
                    <PendingShipments />
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 gap-4">
                <RecentActivity />
            </div>
        </AppShell>
    );
}
