"use client";

import { AppShell } from "@/components/layout/AppShell";
import { mockExpenses, mockMonthlyData, mockCategoryData } from "@/lib/mockData";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Receipt,
    PieChart,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart as RePieChart,
    Pie,
} from "recharts";

const CATEGORY_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"];

export default function FinancePage() {
    const totalRevenue = mockMonthlyData[mockMonthlyData.length - 1].revenue;
    const totalExpenses = mockExpenses.reduce((s, e) => s + e.amount, 0);
    const netProfit = totalRevenue - mockMonthlyData[mockMonthlyData.length - 1].expenses;
    const profitMargin = Math.round((netProfit / totalRevenue) * 100);

    return (
        <AppShell
            pageTitle="Finance"
            requiredRoles={["Manager", "Financial Analyst"]}
        >
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">Finance</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Revenue, expenses, and fleet cost analysis</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {[
                    {
                        label: "Revenue (Jan)",
                        value: formatCurrency(totalRevenue),
                        icon: <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
                        bg: "bg-emerald-100 dark:bg-emerald-900/30",
                        sub: "+12.4% vs Dec",
                        subColor: "text-emerald-600 dark:text-emerald-400",
                    },
                    {
                        label: "Total Expenses",
                        value: formatCurrency(totalExpenses),
                        icon: <Receipt className="w-5 h-5 text-red-600 dark:text-red-400" />,
                        bg: "bg-red-100 dark:bg-red-900/30",
                        sub: "Month-to-date",
                        subColor: "text-muted-foreground",
                    },
                    {
                        label: "Net Profit",
                        value: formatCurrency(netProfit),
                        icon: <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
                        bg: "bg-blue-100 dark:bg-blue-900/30",
                        sub: "Before tax",
                        subColor: "text-muted-foreground",
                    },
                    {
                        label: "Profit Margin",
                        value: `${profitMargin}%`,
                        icon: <PieChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
                        bg: "bg-purple-100 dark:bg-purple-900/30",
                        sub: profitMargin > 20 ? "Healthy margin" : "Below target",
                        subColor: profitMargin > 20 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600",
                    },
                ].map((kpi) => (
                    <div key={kpi.label} className="kpi-card">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                                <p className="text-2xl font-bold text-foreground mt-2">{kpi.value}</p>
                                <p className={cn("text-xs mt-1.5", kpi.subColor)}>{kpi.sub}</p>
                            </div>
                            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", kpi.bg)}>
                                {kpi.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 mb-6">
                {/* Bar Chart */}
                <div className="xl:col-span-3 card-base p-6">
                    <h3 className="font-semibold mb-1">Monthly Revenue</h3>
                    <p className="text-xs text-muted-foreground mb-5">6-month revenue overview</p>
                    <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockMonthlyData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                                <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={45} />
                                <Tooltip
                                    formatter={(v: number) => [formatCurrency(v), ""]}
                                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }}
                                />
                                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="xl:col-span-2 card-base p-6">
                    <h3 className="font-semibold mb-1">Expense Breakdown</h3>
                    <p className="text-xs text-muted-foreground mb-4">By category</p>
                    <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={mockCategoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    dataKey="amount"
                                    nameKey="category"
                                >
                                    {mockCategoryData.map((_, i) => (
                                        <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(v: number) => [formatCurrency(v), ""]}
                                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }}
                                />
                            </RePieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-1.5 mt-2">
                        {mockCategoryData.slice(0, 4).map((c, i) => (
                            <div key={c.category} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[i] }} />
                                    <span className="text-muted-foreground">{c.category}</span>
                                </div>
                                <span className="font-medium text-foreground">{c.percentage}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Expense Table */}
            <div className="card-base overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold">Recent Expenses</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">All fleet expenditures</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{mockExpenses.length} records</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Vehicle</th>
                                <th>Date</th>
                                <th>Approved By</th>
                                <th className="text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockExpenses.map((e) => {
                                const catColors: Record<string, string> = {
                                    Fuel: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                                    Maintenance: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                                    Insurance: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
                                    Salary: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                                    Tolls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
                                    Other: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
                                };
                                return (
                                    <tr key={e.id}>
                                        <td>
                                            <span className={cn("status-badge", catColors[e.category] || catColors.Other)}>
                                                {e.category}
                                            </span>
                                        </td>
                                        <td className="text-sm text-foreground max-w-xs">
                                            <span className="truncate block">{e.description}</span>
                                        </td>
                                        <td>
                                            <span className="text-sm text-muted-foreground">{e.vehicleName || "—"}</span>
                                        </td>
                                        <td>
                                            <span className="text-sm text-muted-foreground">{formatDate(e.date)}</span>
                                        </td>
                                        <td>
                                            <span className="text-sm text-muted-foreground">{e.approvedBy || "—"}</span>
                                        </td>
                                        <td className="text-right">
                                            <span className="font-semibold text-foreground">{formatCurrency(e.amount)}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="px-5 py-3 border-t border-border flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Total</span>
                    <span className="font-bold text-foreground">{formatCurrency(totalExpenses)}</span>
                </div>
            </div>
        </AppShell>
    );
}
