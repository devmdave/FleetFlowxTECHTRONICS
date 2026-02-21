"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { mockMonthlyData } from "@/lib/mockData";
import { formatCurrency } from "@/lib/utils";

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border border-border rounded-xl shadow-lg px-4 py-3 text-sm">
                <p className="font-semibold text-foreground mb-2">{label}</p>
                {payload.map((p: any) => (
                    <div key={p.dataKey} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-muted-foreground capitalize">{p.dataKey}:</span>
                        <span className="font-medium text-foreground">{formatCurrency(p.value)}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export function UtilizationChart() {
    return (
        <div className="card-base p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-semibold text-foreground">Revenue vs Expenses</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Last 6 months financial overview</p>
                </div>
                <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full font-medium">
                    +12.4% profit
                </span>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockMonthlyData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                        <defs>
                            <linearGradient id="revenue-grad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="expenses-grad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="profit-grad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                        <XAxis
                            dataKey="month"
                            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                            axisLine={false}
                            tickLine={false}
                            width={50}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill="url(#revenue-grad)"
                            dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
                            activeDot={{ r: 5 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="expenses"
                            stroke="#f43f5e"
                            strokeWidth={2}
                            fill="url(#expenses-grad)"
                            dot={{ r: 3, fill: "#f43f5e", strokeWidth: 0 }}
                            activeDot={{ r: 5 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="profit"
                            stroke="#10b981"
                            strokeWidth={2}
                            fill="url(#profit-grad)"
                            dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
                            activeDot={{ r: 5 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
