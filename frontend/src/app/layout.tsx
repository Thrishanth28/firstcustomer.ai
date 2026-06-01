import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FirstCustomer.ai — Get Your First 10 Customers",
  description:
    "AI-powered go-to-market strategy for early-stage startups. Instant customer personas, acquisition channels, outreach scripts and a 30-day action plan.",
  robots: "index, follow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className="font-jakarta">{children}</body>
    </html>
  );
}
