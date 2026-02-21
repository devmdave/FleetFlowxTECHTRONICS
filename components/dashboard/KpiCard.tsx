"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: ReactNode;
    iconBg: string;
    trend?: { value: number; label: string };
    className?: string;
}

export function KpiCard({ title, value, subtitle, icon, iconBg, trend, className }: KpiCardProps) {
    const trendPositive = trend && trend.value > 0;
    const trendNeutral = trend && trend.value === 0;

    return (
        <div className={cn("kpi-card group", className)}>
            {/* Background gradient decoration */}
            <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-bl-3xl opacity-20 blur-xl transition-opacity group-hover:opacity-30", iconBg)} />

            <div className="relative flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
                    <p className="text-3xl font-bold text-foreground mt-2 leading-none">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground mt-1.5">{subtitle}</p>
                    )}
                    {trend && (
                        <div className="flex items-center gap-1.5 mt-3">
                            <span
                                className={cn(
                                    "flex items-center gap-0.5 text-xs font-medium",
                                    trendPositive && "text-emerald-600 dark:text-emerald-400",
                                    !trendPositive && !trendNeutral && "text-red-500 dark:text-red-400",
                                    trendNeutral && "text-muted-foreground"
                                )}
                            >
                                {trendPositive && <TrendingUp className="w-3.5 h-3.5" />}
                                {!trendPositive && !trendNeutral && <TrendingDown className="w-3.5 h-3.5" />}
                                {trendNeutral && <Minus className="w-3.5 h-3.5" />}
                                {Math.abs(trend.value)}%
                            </span>
                            <span className="text-xs text-muted-foreground">{trend.label}</span>
                        </div>
                    )}
                </div>
                <div className={cn("flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ml-4", iconBg)}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
