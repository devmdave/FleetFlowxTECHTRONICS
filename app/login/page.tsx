"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import type { UserRole } from "@/types";
import {
    Truck,
    Eye,
    EyeOff,
    ChevronDown,
    AlertCircle,
    Loader2,
} from "lucide-react";

const ROLES: UserRole[] = [
    "Manager",
    "Dispatcher",
    "Safety Officer",
    "Financial Analyst",
];

const DEMO_CREDENTIALS: Record<UserRole, { email: string; password: string }> = {
    Manager: { email: "manager@fleetflow.io", password: "manager123" },
    Dispatcher: { email: "dispatcher@fleetflow.io", password: "disp123" },
    "Safety Officer": { email: "safety@fleetflow.io", password: "safe123" },
    "Financial Analyst": { email: "finance@fleetflow.io", password: "fin123" },
};

export default function LoginPage() {
    const router = useRouter();
    const login = useAuthStore((s) => s.login);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<UserRole>("Manager");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [forgotSent, setForgotSent] = useState(false);
    const [touched, setTouched] = useState({ email: false, password: false });

    const emailError = touched.email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    const passwordError = touched.password && password.length < 4;

    const handleDemoFill = () => {
        const creds = DEMO_CREDENTIALS[role];
        setEmail(creds.email);
        setPassword(creds.password);
        setTouched({ email: true, password: true });
        setError("");
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setTouched({ email: true, password: true });

        if (emailError || passwordError || !email || !password) return;

        setLoading(true);
        await new Promise((r) => setTimeout(r, 800)); // Simulate network

        const success = login(email, password, role);
        setLoading(false);

        if (success) {
            router.push("/dashboard");
        } else {
            setError("Invalid credentials. Try the demo credentials below.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md animate-fade-in">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30 mb-4">
                        <Truck className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">FleetFlow</h1>
                    <p className="text-slate-400 text-sm mt-1">Fleet & Logistics Management</p>
                </div>

                {/* Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-white">Sign in to your account</h2>
                        <p className="text-slate-400 text-sm mt-1">Welcome back! Please enter your details.</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-lg mb-5">
                            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                            <span className="text-sm text-red-300">{error}</span>
                        </div>
                    )}

                    {/* Forgot password confirmation */}
                    {forgotSent && (
                        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg mb-5">
                            <p className="text-sm text-emerald-300">
                                Password reset link sent to <span className="font-medium">{email || "your email"}</span>.
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Role Selector */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Role
                            </label>
                            <div className="relative">
                                <select
                                    id="role-select"
                                    value={role}
                                    onChange={(e) => {
                                        setRole(e.target.value as UserRole);
                                        setEmail("");
                                        setPassword("");
                                        setTouched({ email: false, password: false });
                                        setError("");
                                    }}
                                    className="w-full appearance-none bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer"
                                >
                                    {ROLES.map((r) => (
                                        <option key={r} value={r} className="bg-slate-800 text-white">
                                            {r}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email-input" className="block text-sm font-medium text-slate-300 mb-1.5">
                                Email address
                            </label>
                            <input
                                id="email-input"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                                placeholder="you@fleetflow.io"
                                autoComplete="email"
                                className={`w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-500
                  focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200
                  ${emailError ? "border-red-500/50 focus:ring-red-500" : "border-white/10 focus:ring-blue-500"}`}
                            />
                            {emailError && (
                                <p className="text-xs text-red-400 mt-1">Please enter a valid email.</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label htmlFor="password-input" className="text-sm font-medium text-slate-300">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!email) { setError("Enter your email first."); return; }
                                        setForgotSent(true);
                                        setError("");
                                    }}
                                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    id="password-input"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className={`w-full bg-white/5 border rounded-lg px-3 py-2.5 pr-10 text-sm text-white placeholder:text-slate-500
                    focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200
                    ${passwordError ? "border-red-500/50 focus:ring-red-500" : "border-white/10 focus:ring-blue-500"}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {passwordError && (
                                <p className="text-xs text-red-400 mt-1">Password must be at least 4 characters.</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            id="login-submit"
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50
                text-white rounded-lg px-4 py-2.5 text-sm font-semibold
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent
                transition-all duration-200 active:scale-[0.98] shadow-lg shadow-blue-600/25"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Signing in…
                                </>
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </form>

                    {/* Demo credentials */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-xs text-slate-500 mb-3 text-center font-medium uppercase tracking-wide">
                            Demo Quick-Fill
                        </p>
                        <button
                            id="demo-fill-btn"
                            type="button"
                            onClick={handleDemoFill}
                            className="w-full text-center text-sm text-blue-400 hover:text-blue-300 bg-blue-500/5 hover:bg-blue-500/10
                border border-blue-500/20 rounded-lg py-2.5 transition-all duration-200"
                        >
                            Fill credentials for <span className="font-semibold">{role}</span>
                        </button>
                        <div className="mt-3 p-3 bg-white/3 rounded-lg border border-white/5">
                            <p className="text-xs text-slate-500 text-center">
                                <span className="text-slate-400">{DEMO_CREDENTIALS[role].email}</span>
                                <span className="mx-2 text-slate-600">·</span>
                                <span className="text-slate-400">password: </span>
                                <span className="text-slate-400 font-mono">{DEMO_CREDENTIALS[role].password}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-slate-600 mt-6">
                    © 2025 FleetFlow · TECHTRONICS · All rights reserved
                </p>
            </div>
        </div>
    );
}
