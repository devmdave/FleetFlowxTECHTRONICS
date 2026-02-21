"use client";

import { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { mockVehicles } from "@/lib/mockData";
import { cn, formatCurrency } from "@/lib/utils";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import {
    BarChart2,
    TrendingUp,
    TrendingDown,
    Fuel,
    Truck,
    DollarSign,
    Download,
    FileText,
    Calendar,
    Activity,
    Target,
    ChevronDown,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";

// ─── Mock data for analytics (self-contained, no global mutations) ────────────

interface VehicleAnalytics {
    vehicleId: string;
    vehicleName: string;
    licensePlate: string;
    vehicleType: string;
    totalDistanceKm: number;
    totalFuelLiters: number;
    fuelCost: number;
    maintenanceCost: number;
    revenue: number;
    acquisitionCost: number;
    fuelEfficiency: number; // km/L
    roi: number; // percentage
}

// Monthly analytics mock data per vehicle (indexed by month 0=Jan … 11=Dec)
const MOCK_VEHICLE_ANALYTICS_BASE: VehicleAnalytics[] = [
    {
        vehicleId: "v001", vehicleName: "Volvo FH16", licensePlate: "TRK-001-AX", vehicleType: "Truck",
        totalDistanceKm: 142530, totalFuelLiters: 17200, fuelCost: 27520, maintenanceCost: 8400,
        revenue: 78000, acquisitionCost: 120000,
        fuelEfficiency: 0, roi: 0,
    },
    {
        vehicleId: "v002", vehicleName: "Mercedes Sprinter", licensePlate: "VAN-002-BX", vehicleType: "Van",
        totalDistanceKm: 78240, totalFuelLiters: 6800, fuelCost: 10880, maintenanceCost: 3200,
        revenue: 42000, acquisitionCost: 55000,
        fuelEfficiency: 0, roi: 0,
    },
    {
        vehicleId: "v003", vehicleName: "Scania R500", licensePlate: "TRK-003-CX", vehicleType: "Truck",
        totalDistanceKm: 289430, totalFuelLiters: 36000, fuelCost: 57600, maintenanceCost: 22800,
        revenue: 145000, acquisitionCost: 135000,
        fuelEfficiency: 0, roi: 0,
    },
    {
        vehicleId: "v004", vehicleName: "Ford Transit", licensePlate: "VAN-004-DX", vehicleType: "Van",
        totalDistanceKm: 54890, totalFuelLiters: 5200, fuelCost: 8320, maintenanceCost: 1800,
        revenue: 28000, acquisitionCost: 45000,
        fuelEfficiency: 0, roi: 0,
    },
    {
        vehicleId: "v005", vehicleName: "Tesla Model 3", licensePlate: "SDN-005-EX", vehicleType: "Sedan",
        totalDistanceKm: 32100, totalFuelLiters: 1850, fuelCost: 740, maintenanceCost: 600,
        revenue: 18500, acquisitionCost: 52000,
        fuelEfficiency: 0, roi: 0,
    },
    {
        vehicleId: "v006", vehicleName: "DAF XF", licensePlate: "TRK-006-FX", vehicleType: "Truck",
        totalDistanceKm: 198760, totalFuelLiters: 24500, fuelCost: 39200, maintenanceCost: 14600,
        revenue: 110000, acquisitionCost: 130000,
        fuelEfficiency: 0, roi: 0,
    },
    {
        vehicleId: "v007", vehicleName: "Toyota Coaster", licensePlate: "BUS-007-GX", vehicleType: "Bus",
        totalDistanceKm: 521340, totalFuelLiters: 89000, fuelCost: 142400, maintenanceCost: 48000,
        revenue: 180000, acquisitionCost: 85000,
        fuelEfficiency: 0, roi: 0,
    },
    {
        vehicleId: "v008", vehicleName: "Isuzu NPR", licensePlate: "TRK-008-HX", vehicleType: "Truck",
        totalDistanceKm: 112300, totalFuelLiters: 14000, fuelCost: 22400, maintenanceCost: 6200,
        revenue: 62000, acquisitionCost: 70000,
        fuelEfficiency: 0, roi: 0,
    },
    {
        vehicleId: "v009", vehicleName: "Renault Master", licensePlate: "VAN-009-IX", vehicleType: "Van",
        totalDistanceKm: 67540, totalFuelLiters: 7100, fuelCost: 11360, maintenanceCost: 4200,
        revenue: 32000, acquisitionCost: 48000,
        fuelEfficiency: 0, roi: 0,
    },
    {
        vehicleId: "v010", vehicleName: "BMW X5", licensePlate: "SUV-010-JX", vehicleType: "SUV",
        totalDistanceKm: 22890, totalFuelLiters: 1600, fuelCost: 3200, maintenanceCost: 800,
        revenue: 15000, acquisitionCost: 95000,
        fuelEfficiency: 0, roi: 0,
    },
    {
        vehicleId: "v011", vehicleName: "MAN TGX", licensePlate: "TRK-011-KX", vehicleType: "Truck",
        totalDistanceKm: 334210, totalFuelLiters: 43000, fuelCost: 68800, maintenanceCost: 26000,
        revenue: 168000, acquisitionCost: 128000,
        fuelEfficiency: 0, roi: 0,
    },
    {
        vehicleId: "v012", vehicleName: "Nissan NV400", licensePlate: "VAN-012-LX", vehicleType: "Van",
        totalDistanceKm: 41200, totalFuelLiters: 4400, fuelCost: 7040, maintenanceCost: 1600,
        revenue: 22000, acquisitionCost: 42000,
        fuelEfficiency: 0, roi: 0,
    },
];

// monthly scalar multipliers per month (simulate monthly breakdown)
const MONTHLY_SCALARS: Record<string, number> = {
    Jan: 0.14, Feb: 0.15, Mar: 0.13, Apr: 0.17, May: 0.16, Jun: 0.18,
    Jul: 0.17, Aug: 0.15, Sep: 0.16, Oct: 0.18, Nov: 0.14, Dec: 0.13,
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Compute derived fields
function buildAnalytics(data: VehicleAnalytics[]): VehicleAnalytics[] {
    return data.map((v) => ({
        ...v,
        fuelEfficiency: v.totalFuelLiters > 0
            ? parseFloat((v.totalDistanceKm / v.totalFuelLiters).toFixed(2))
            : 0,
        roi: v.acquisitionCost > 0
            ? parseFloat(((v.revenue - (v.maintenanceCost + v.fuelCost)) / v.acquisitionCost * 100).toFixed(1))
            : 0,
    }));
}

function buildMonthlyData(analytics: VehicleAnalytics[], monthFilter: string) {
    const months = monthFilter === "All" ? MONTHS : [monthFilter];
    return months.map((m) => {
        const scalar = MONTHLY_SCALARS[m] ?? 1;
        const revenue = analytics.reduce((sum, v) => sum + v.revenue * scalar, 0);
        const fuel = analytics.reduce((sum, v) => sum + v.fuelCost * scalar, 0);
        const maintenance = analytics.reduce((sum, v) => sum + v.maintenanceCost * scalar, 0);
        const expense = fuel + maintenance;
        return {
            month: m,
            revenue: Math.round(revenue),
            expense: Math.round(expense),
            profit: Math.round(revenue - expense),
        };
    });
}

function buildFuelEfficiencyData(analytics: VehicleAnalytics[]) {
    return analytics
        .filter((v) => v.totalFuelLiters > 0)
        .map((v) => ({
            name: v.vehicleName.length > 12 ? v.vehicleName.slice(0, 12) + "…" : v.vehicleName,
            fullName: v.vehicleName,
            efficiency: v.fuelEfficiency,
        }))
        .sort((a, b) => b.efficiency - a.efficiency);
}

// ─── CSV Export (self-contained) ──────────────────────────────────────────────

function exportToCSV(analytics: VehicleAnalytics[], monthlyData: ReturnType<typeof buildMonthlyData>, selectedMonth: string) {
    const sections: string[] = [];

    // ROI Summary
    sections.push("=== VEHICLE ROI SUMMARY ===");
    sections.push("Vehicle,License Plate,Type,Revenue ($),Fuel Cost ($),Maintenance ($),Acquisition Cost ($),ROI (%)");
    analytics.forEach((v) => {
        sections.push(`${v.vehicleName},${v.licensePlate},${v.vehicleType},${v.revenue},${v.fuelCost},${v.maintenanceCost},${v.acquisitionCost},${v.roi}`);
    });

    sections.push("\n=== FUEL EFFICIENCY SUMMARY ===");
    sections.push("Vehicle,License Plate,Distance (km),Fuel (L),Efficiency (km/L)");
    analytics.forEach((v) => {
        sections.push(`${v.vehicleName},${v.licensePlate},${v.totalDistanceKm},${v.totalFuelLiters},${v.fuelEfficiency}`);
    });

    sections.push("\n=== MONTHLY FINANCIAL SUMMARY ===");
    sections.push("Month,Revenue ($),Expenses ($),Profit ($)");
    monthlyData.forEach((m) => {
        sections.push(`${m.month},${m.revenue},${m.expense},${m.profit}`);
    });

    sections.push("\n=== VEHICLE HEALTH REPORT ===");
    sections.push("Vehicle,Maintenance Cost ($),Odometer (km),Status");
    mockVehicles.forEach((v) => {
        sections.push(`${v.name},${analytics.find((a) => a.vehicleId === v.id)?.maintenanceCost ?? 0},${v.odometer},${v.status}`);
    });

    sections.push("\n=== PAYROLL SUMMARY (Estimated) ===");
    sections.push("Month,Estimated Fuel Payroll ($)");
    monthlyData.forEach((m) => {
        sections.push(`${m.month},${Math.round(m.expense * 0.3)}`);
    });

    const csv = sections.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FleetFlow_Analytics_${selectedMonth}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// ─── PDF Export (self-contained text-based PDF) ───────────────────────────────

function exportToPDF(analytics: VehicleAnalytics[], monthlyData: ReturnType<typeof buildMonthlyData>, selectedMonth: string) {
    const content = `
        <html>
        <head>
            <title>FleetFlow Analytics Report</title>
            <style>
                body { font-family: Arial, sans-serif; font-size: 12px; color: #222; margin: 30px; }
                h1 { font-size: 20px; color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 6px; }
                h2 { font-size: 14px; color: #1e40af; margin-top: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px; }
                th { background: #1e40af; color: white; padding: 6px 8px; text-align: left; }
                td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; }
                tr:nth-child(even) td { background: #f9fafb; }
                .positive { color: #059669; font-weight: bold; }
                .negative { color: #dc2626; font-weight: bold; }
                .header-info { color: #6b7280; font-size: 11px; margin-bottom: 20px; }
                .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 10px; }
            </style>
        </head>
        <body>
            <h1>FleetFlow — Operational Analytics & Financial Report</h1>
            <p class="header-info">Generated: ${new Date().toLocaleString()} | Period: ${selectedMonth === "All" ? "Full Year" : selectedMonth} | Fleet Size: ${analytics.length} vehicles</p>

            <h2>1. Vehicle ROI Summary</h2>
            <table>
                <thead><tr><th>Vehicle</th><th>Revenue</th><th>Fuel Cost</th><th>Maintenance</th><th>Acquisition</th><th>ROI</th></tr></thead>
                <tbody>
                    ${analytics.map((v) => `
                        <tr>
                            <td>${v.vehicleName} (${v.licensePlate})</td>
                            <td>$${v.revenue.toLocaleString()}</td>
                            <td>$${v.fuelCost.toLocaleString()}</td>
                            <td>$${v.maintenanceCost.toLocaleString()}</td>
                            <td>$${v.acquisitionCost.toLocaleString()}</td>
                            <td class="${v.roi >= 0 ? "positive" : "negative"}">${v.roi}%</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>

            <h2>2. Fuel Efficiency Summary</h2>
            <table>
                <thead><tr><th>Vehicle</th><th>License Plate</th><th>Distance (km)</th><th>Fuel Used (L)</th><th>Efficiency (km/L)</th></tr></thead>
                <tbody>
                    ${analytics.map((v) => `
                        <tr>
                            <td>${v.vehicleName}</td>
                            <td>${v.licensePlate}</td>
                            <td>${v.totalDistanceKm.toLocaleString()}</td>
                            <td>${v.totalFuelLiters.toLocaleString()}</td>
                            <td><strong>${v.fuelEfficiency} km/L</strong></td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>

            <h2>3. Monthly Financial Summary</h2>
            <table>
                <thead><tr><th>Month</th><th>Revenue</th><th>Expenses</th><th>Profit</th></tr></thead>
                <tbody>
                    ${monthlyData.map((m) => `
                        <tr>
                            <td>${m.month}</td>
                            <td>$${m.revenue.toLocaleString()}</td>
                            <td>$${m.expense.toLocaleString()}</td>
                            <td class="${m.profit >= 0 ? "positive" : "negative"}">$${m.profit.toLocaleString()}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>

            <h2>4. Vehicle Health Report</h2>
            <table>
                <thead><tr><th>Vehicle</th><th>Odometer (km)</th><th>Status</th><th>Maintenance Cost</th><th>Next Service</th></tr></thead>
                <tbody>
                    ${mockVehicles.map((v) => `
                        <tr>
                            <td>${v.name}</td>
                            <td>${v.odometer.toLocaleString()}</td>
                            <td>${v.status}</td>
                            <td>$${(analytics.find((a) => a.vehicleId === v.id)?.maintenanceCost ?? 0).toLocaleString()}</td>
                            <td>${v.nextServiceDue.toLocaleString()} km</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>

            <h2>5. Estimated Payroll Summary</h2>
            <table>
                <thead><tr><th>Month</th><th>Estimated Operational Payroll</th></tr></thead>
                <tbody>
                    ${monthlyData.map((m) => `
                        <tr>
                            <td>${m.month}</td>
                            <td>$${Math.round(m.expense * 0.3).toLocaleString()}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>

            <div class="footer">FleetFlow by TECHTRONICS — Report auto-generated. Data reflects current fleet operational records. Do not redistribute.</div>
        </body>
        </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    }
}

// ─── Custom Tooltip Components ────────────────────────────────────────────────

const FinancialTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs">
                <p className="font-semibold text-foreground mb-2">{label}</p>
                {payload.map((p) => (
                    <div key={p.name} className="flex items-center justify-between gap-4">
                        <span style={{ color: p.color }}>{p.name}</span>
                        <span className="font-semibold text-foreground">${p.value.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const FuelTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs">
                <p className="font-semibold text-foreground mb-1">{label}</p>
                <p className="text-primary font-bold">{payload[0]?.value} km/L</p>
            </div>
        );
    }
    return null;
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const MONTH_OPTIONS = ["All", ...MONTHS];

export default function OperationalAnalyticsFinancialReportsPage() {
    const [selectedMonth, setSelectedMonth] = useState("All");

    const allAnalytics = useMemo(() => buildAnalytics(MOCK_VEHICLE_ANALYTICS_BASE), []);

    const monthlyData = useMemo(() => buildMonthlyData(allAnalytics, selectedMonth), [allAnalytics, selectedMonth]);

    const fuelChartData = useMemo(() => buildFuelEfficiencyData(allAnalytics), [allAnalytics]);

    // KPI totals
    const totalRevenue = useMemo(() => monthlyData.reduce((s, m) => s + m.revenue, 0), [monthlyData]);
    const totalExpenses = useMemo(() => monthlyData.reduce((s, m) => s + m.expense, 0), [monthlyData]);
    const totalProfit = totalRevenue - totalExpenses;
    const avgEfficiency = useMemo(() => {
        const valid = allAnalytics.filter((v) => v.fuelEfficiency > 0);
        return valid.length > 0
            ? (valid.reduce((s, v) => s + v.fuelEfficiency, 0) / valid.length).toFixed(2)
            : "0.00";
    }, [allAnalytics]);
    const positiveROI = allAnalytics.filter((v) => v.roi > 0).length;

    return (
        <AppShell pageTitle="Analytics & Financial Reports">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <BarChart2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Operational Analytics & Financial Reports</h1>
                        <p className="text-sm text-muted-foreground">
                            Fuel efficiency, vehicle ROI, financial overviews and data exports
                        </p>
                    </div>
                </div>

                {/* Export Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        id="export-csv-btn"
                        onClick={() => exportToCSV(allAnalytics, monthlyData, selectedMonth)}
                        className="btn-secondary gap-1.5 text-xs"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Export CSV
                    </button>
                    <button
                        id="export-pdf-btn"
                        onClick={() => exportToPDF(allAnalytics, monthlyData, selectedMonth)}
                        className="btn-primary gap-1.5 text-xs"
                    >
                        <FileText className="w-3.5 h-3.5" />
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Month Filter */}
            <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Period:</span>
                <div className="relative">
                    <select
                        id="month-filter"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="appearance-none input-base pr-8 cursor-pointer min-w-[140px]"
                    >
                        {MONTH_OPTIONS.map((m) => (
                            <option key={m} value={m}>{m === "All" ? "Full Year" : m}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                </div>
                <span className="text-xs text-muted-foreground ml-1">
                    {selectedMonth === "All" ? "Showing all 12 months" : `Showing data for ${selectedMonth}`}
                </span>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    {
                        label: "Total Revenue",
                        value: formatCurrency(totalRevenue),
                        icon: DollarSign,
                        color: "text-emerald-600 dark:text-emerald-400",
                        bg: "bg-emerald-50 dark:bg-emerald-900/20",
                        trend: "+12.4%",
                        up: true,
                    },
                    {
                        label: "Total Expenses",
                        value: formatCurrency(totalExpenses),
                        icon: Activity,
                        color: "text-red-600 dark:text-red-400",
                        bg: "bg-red-50 dark:bg-red-900/20",
                        trend: "+8.1%",
                        up: true,
                    },
                    {
                        label: "Net Profit",
                        value: formatCurrency(totalProfit),
                        icon: TrendingUp,
                        color: totalProfit >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400",
                        bg: totalProfit >= 0 ? "bg-blue-50 dark:bg-blue-900/20" : "bg-red-50 dark:bg-red-900/20",
                        trend: "+18.7%",
                        up: true,
                    },
                    {
                        label: "Avg Fuel Efficiency",
                        value: `${avgEfficiency} km/L`,
                        icon: Fuel,
                        color: "text-amber-600 dark:text-amber-400",
                        bg: "bg-amber-50 dark:bg-amber-900/20",
                        trend: "+3.2%",
                        up: true,
                    },
                ].map((kpi) => (
                    <div key={kpi.label} className={cn("card-base p-5", kpi.bg)}>
                        <div className="flex items-start justify-between mb-3">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{kpi.label}</p>
                            <div className={cn("flex items-center gap-0.5 text-xs font-medium",
                                kpi.up ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                            )}>
                                {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {kpi.trend}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <kpi.icon className={cn("w-5 h-5 shrink-0", kpi.color)} />
                            <p className={cn("text-xl font-bold", kpi.color)}>{kpi.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                {/* Revenue vs Expense Chart */}
                <div className="card-base p-5">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm text-foreground">Revenue vs. Expenses</h3>
                            <p className="text-xs text-muted-foreground">
                                {selectedMonth === "All" ? "Monthly breakdown" : `${selectedMonth} comparison`}
                            </p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={monthlyData} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                            <YAxis
                                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                            />
                            <Tooltip content={<FinancialTooltip />} />
                            <Legend wrapperStyle={{ fontSize: "11px" }} />
                            <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Fuel Efficiency Comparison Chart */}
                <div className="card-base p-5">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <Fuel className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm text-foreground">Fuel Efficiency Comparison</h3>
                            <p className="text-xs text-muted-foreground">km/L per vehicle (higher is better)</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={fuelChartData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                            <XAxis
                                type="number"
                                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => `${v}km/L`}
                            />
                            <YAxis
                                type="category"
                                dataKey="name"
                                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                                axisLine={false}
                                tickLine={false}
                                width={80}
                            />
                            <Tooltip content={<FuelTooltip />} />
                            <Bar dataKey="efficiency" name="km/L" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ROI Per Vehicle Cards */}
            <div className="card-base p-5 mb-6">
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-sm text-foreground">Vehicle ROI Analysis</h3>
                        <p className="text-xs text-muted-foreground">
                            ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost × 100
                        </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{positiveROI}</span>/{allAnalytics.length} vehicles profitable
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {allAnalytics
                        .sort((a, b) => b.roi - a.roi)
                        .map((v) => {
                            const isPositive = v.roi >= 0;
                            return (
                                <div
                                    key={v.vehicleId}
                                    className={cn(
                                        "rounded-xl border p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
                                        isPositive
                                            ? "bg-emerald-50/60 border-emerald-200 dark:bg-emerald-900/15 dark:border-emerald-800/50"
                                            : "bg-red-50/60 border-red-200 dark:bg-red-900/15 dark:border-red-800/50"
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-white/80 dark:bg-card/80 flex items-center justify-center shrink-0">
                                            <Truck className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <div className={cn(
                                            "flex items-center gap-0.5 text-sm font-bold",
                                            isPositive ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"
                                        )}>
                                            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                            {v.roi}%
                                        </div>
                                    </div>
                                    <p className="font-semibold text-foreground text-sm leading-tight">{v.vehicleName}</p>
                                    <p className="text-[10px] text-muted-foreground mb-3">{v.licensePlate}</p>

                                    {/* ROI bar */}
                                    <div className="h-1 bg-white/60 dark:bg-border rounded-full overflow-hidden mb-2">
                                        <div
                                            className={cn("h-full rounded-full", isPositive ? "bg-emerald-500" : "bg-red-500")}
                                            style={{ width: `${Math.min(100, Math.abs(v.roi))}%` }}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
                                        <span>Revenue: <span className="font-medium text-foreground">${(v.revenue / 1000).toFixed(0)}k</span></span>
                                        <span>Fuel: <span className="font-medium text-foreground">${(v.fuelCost / 1000).toFixed(0)}k</span></span>
                                        <span>Maint: <span className="font-medium text-foreground">${(v.maintenanceCost / 1000).toFixed(0)}k</span></span>
                                        <span>Eff: <span className="font-medium text-foreground">{v.fuelEfficiency}km/L</span></span>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>

            {/* Detailed Data Table */}
            <div className="card-base overflow-hidden">
                <div className="flex items-center gap-2 p-5 border-b border-border">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BarChart2 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm text-foreground">Full Fleet Analytics Table</h3>
                        <p className="text-xs text-muted-foreground">Detailed per-vehicle operational data</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Vehicle</th>
                                <th>Type</th>
                                <th className="text-right">Distance (km)</th>
                                <th className="text-right">Fuel (L)</th>
                                <th className="text-right">Efficiency</th>
                                <th className="text-right">Revenue</th>
                                <th className="text-right">Fuel Cost</th>
                                <th className="text-right">Maintenance</th>
                                <th className="text-right">ROI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allAnalytics.map((v) => {
                                const roiPositive = v.roi >= 0;
                                return (
                                    <tr key={v.vehicleId}>
                                        <td>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                    <Truck className="w-4 h-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground text-sm">{v.vehicleName}</p>
                                                    <p className="text-xs text-muted-foreground">{v.licensePlate}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-xs bg-muted px-2 py-0.5 rounded font-medium text-muted-foreground">{v.vehicleType}</span>
                                        </td>
                                        <td className="text-right text-sm">{v.totalDistanceKm.toLocaleString()}</td>
                                        <td className="text-right text-sm">{v.totalFuelLiters.toLocaleString()}</td>
                                        <td className="text-right">
                                            <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                                                {v.fuelEfficiency} km/L
                                            </span>
                                        </td>
                                        <td className="text-right text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                                            ${v.revenue.toLocaleString()}
                                        </td>
                                        <td className="text-right text-sm text-muted-foreground">${v.fuelCost.toLocaleString()}</td>
                                        <td className="text-right text-sm text-muted-foreground">${v.maintenanceCost.toLocaleString()}</td>
                                        <td className="text-right">
                                            <span className={cn(
                                                "text-sm font-bold flex items-center justify-end gap-1",
                                                roiPositive
                                                    ? "text-emerald-600 dark:text-emerald-400"
                                                    : "text-red-600 dark:text-red-400"
                                            )}>
                                                {roiPositive
                                                    ? <TrendingUp className="w-3.5 h-3.5" />
                                                    : <TrendingDown className="w-3.5 h-3.5" />
                                                }
                                                {v.roi}%
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
                    <span className="text-xs text-muted-foreground">{allAnalytics.length} vehicles · Click Export buttons to download full reports</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => exportToCSV(allAnalytics, monthlyData, selectedMonth)}
                            className="btn-ghost text-xs py-1.5 px-2.5 gap-1"
                        >
                            <Download className="w-3 h-3" /> CSV
                        </button>
                        <button
                            onClick={() => exportToPDF(allAnalytics, monthlyData, selectedMonth)}
                            className="btn-ghost text-xs py-1.5 px-2.5 gap-1"
                        >
                            <FileText className="w-3 h-3" /> PDF
                        </button>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
