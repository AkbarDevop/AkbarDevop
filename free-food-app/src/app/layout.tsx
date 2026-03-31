import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Free Food @ Uni",
  description: "Discover free food at university events",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--background)]">{children}</body>
    </html>
  );
}
