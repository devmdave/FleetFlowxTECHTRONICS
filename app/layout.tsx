import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "FleetFlow – Fleet & Logistics Management",
    description:
        "Enterprise-grade fleet and logistics management system. Monitor vehicles, track trips, manage drivers, and analyze fleet performance.",
    keywords: "fleet management, logistics, vehicle tracking, dispatch, telematics",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
            </head>
            <body className="min-h-screen bg-background antialiased">
                {children}
            </body>
        </html>
    );
}
