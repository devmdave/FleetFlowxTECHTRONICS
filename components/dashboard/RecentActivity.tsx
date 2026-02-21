"use client";

import { mockPendingShipments } from "@/lib/mockData";
import { formatDate, truncate } from "@/lib/utils";
import { Package, MapPin, ArrowRight } from "lucide-react";

export function PendingShipments() {
    return (
        <div className="card-base overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-foreground">Pending Cargo</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Unassigned shipments awaiting dispatch</p>
                </div>
                <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full font-medium">
                    {mockPendingShipments.length} unassigned
                </span>
            </div>
            <div className="divide-y divide-border">
                {mockPendingShipments.map((s) => (
                    <div key={s.id} className="px-5 py-3.5 hover:bg-muted/30 transition-colors cursor-pointer">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                                <Package className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground">{truncate(s.description, 45)}</p>
                                <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                                    <MapPin className="w-3 h-3 shrink-0" />
                                    <span>{s.pickup}</span>
                                    <ArrowRight className="w-3 h-3 shrink-0" />
                                    <span>{s.delivery}</span>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground shrink-0">{formatDate(s.date)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
