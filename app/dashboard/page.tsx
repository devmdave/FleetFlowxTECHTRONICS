"use client";

import { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { UtilizationChart } from "@/components/dashboard/UtilizationChart";
import { PendingShipments } from "@/components/dashboard/RecentActivity";
import { useFleetStore } from "@/store/useFleetStore";
import { mockPendingShipments } from "@/lib/mockData";
import {
    Truck,
    Wrench,
    BarChart3,
    Package,
    ChevronDown,
} from "lucide-react";
import type { VehicleType } from "@/types";

const VEHICLE_TYPES: (VehicleType | "All")[] = ["All", "Truck", "Van", "Sedan", "SUV", "Bus"];
const REGIONS = ["All Regions", "North", "South", "East", "West"];
const STATUSES = ["All Status", "Active", "On Trip", "In Shop", "Retired"];

export default function DashboardPage({ isComponent }: { isComponent?: boolean }) {
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

    const content = (
        <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
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

            {/* Chart + Pending Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2">
                    <UtilizationChart />
                </div>
                <div>
                    <PendingShipments />
                </div>
            </div>
        </>
    );

    if (isComponent) return content;

    return <AppShell pageTitle="Dashboard">{content}</AppShell>;
}
