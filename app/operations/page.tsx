"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import TripsView from "../trips/page";
import MaintenanceView from "../maintenance/page";
import FinanceView from "../finance/page";
import { Package, Wrench, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "trips" | "maintenance" | "finance";

export default function CombinedOperationsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("trips");

    return (
        <div className="flex flex-col h-full bg-background -m-6">
            <div className="border-b border-border bg-card px-6 pt-6">
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-foreground">Operations Dashboard</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Manage trips, service logs, and financial operations from a single view.</p>
                </div>
                <div className="flex space-x-6">
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
                        Trip Dispatcher
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
                        Maintenance Logs
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
                        Financial Overview
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
                {activeTab === "trips" && <TripsView isComponent />}
                {activeTab === "maintenance" && <MaintenanceView isComponent />}
                {activeTab === "finance" && <FinanceView isComponent />}
            </div>
        </div>
    );
}

// Wrapper to provide AppShell if accessed directly but standard div if used as a component
export function OperationsWrapper() {
    return (
        <AppShell pageTitle="Operations">
            <CombinedOperationsPage />
        </AppShell>
    );
}
