"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import DashboardView from "../dashboard/page";
import VehiclesView from "../vehicles/page";
import TripsView from "../trips/page";
import MaintenanceView from "../maintenance/page";
import FinanceView from "../finance/page";
import SettingsView from "../settings/page";
import {
    LayoutDashboard,
    Truck,
    Package,
    Wrench,
    Calculator,
    Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "dashboard" | "vehicles" | "trips" | "maintenance" | "finance" | "settings";

export default function MegaDashboardPage() {
    const [activeTab, setActiveTab] = useState<Tab>("dashboard");

    return (
        <div className="flex flex-col h-full bg-background -m-6">
            <div className="border-b border-border bg-card px-6 pt-6 sticky top-0 z-10">
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-foreground">FleetFlow Master View</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">All modules accessed from a single interface.</p>
                </div>

                {/* Scrollable Tabs for smaller screens */}
                <div className="overflow-x-auto custom-scrollbar">
                    <div className="flex space-x-6 min-w-max">
                        <button
                            onClick={() => setActiveTab("dashboard")}
                            className={cn(
                                "pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                                activeTab === "dashboard"
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                            )}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab("vehicles")}
                            className={cn(
                                "pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                                activeTab === "vehicles"
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                            )}
                        >
                            <Truck className="w-4 h-4" />
                            Vehicles
                        </button>
                        <button
                            onClick={() => setActiveTab("trips")}
                            className={cn(
                                "pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                                activeTab === "trips"
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                            )}
                        >
                            <Package className="w-4 h-4" />
                            Trips
                        </button>
                        <button
                            onClick={() => setActiveTab("maintenance")}
                            className={cn(
                                "pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                                activeTab === "maintenance"
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                            )}
                        >
                            <Wrench className="w-4 h-4" />
                            Maintenance
                        </button>
                        <button
                            onClick={() => setActiveTab("finance")}
                            className={cn(
                                "pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                                activeTab === "finance"
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                            )}
                        >
                            <Calculator className="w-4 h-4" />
                            Finance
                        </button>
                        <button
                            onClick={() => setActiveTab("settings")}
                            className={cn(
                                "pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                                activeTab === "settings"
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                            )}
                        >
                            <Settings className="w-4 h-4" />
                            Settings
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
                {activeTab === "dashboard" && <DashboardView isComponent />}
                {activeTab === "vehicles" && <VehiclesView isComponent />}
                {activeTab === "trips" && <TripsView isComponent />}
                {activeTab === "maintenance" && <MaintenanceView isComponent />}
                {activeTab === "finance" && <FinanceView isComponent />}
                {activeTab === "settings" && <SettingsView isComponent />}
            </div>
        </div>
    );
}

export function MegaDashboardWrapper() {
    return (
        <AppShell pageTitle="All Modules">
            <MegaDashboardPage />
        </AppShell>
    );
}

