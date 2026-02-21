"use client";

import { mockTrips, mockPendingShipments } from "@/lib/mockData";
import { getTripStatusColor, formatDate, truncate } from "@/lib/utils";
import { Package, MapPin, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function RecentActivity() {
    const recentTrips = mockTrips.slice(0, 4);

    return (
        <div className="card-base overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-foreground">Recent Trips</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Latest fleet movements</p>
                </div>
                <a href="/trips" className="text-xs text-primary hover:underline flex items-center gap-1">
                    View all <ArrowRight className="w-3 h-3" />
                </a>
            </div>
            <div className="divide-y divide-border">
                {recentTrips.map((trip) => (
                    <div key={trip.id} className="px-5 py-3.5 hover:bg-muted/30 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-sm font-medium text-foreground">{trip.vehicleName}</span>
                                    <span className={cn("status-badge text-[10px]", getTripStatusColor(trip.status))}>
                                        {trip.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                                    <MapPin className="w-3 h-3 shrink-0" />
                                    <span>{trip.origin}</span>
                                    <ArrowRight className="w-3 h-3 shrink-0" />
                                    <span>{trip.destination}</span>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-xs text-muted-foreground">{trip.driverName.split(" ")[0]}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{trip.distance} km</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

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
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
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
