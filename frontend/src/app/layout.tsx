import type { Metadata } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import { AppShell } from "@/components/civic/AppShell";
import "./globals.css";
import "./civic.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Civic — Fredericton reports",
  description: "Report and track local issues in Fredericton",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "FixMap",
  },
};

export const viewport = {
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${manrope.variable}`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
