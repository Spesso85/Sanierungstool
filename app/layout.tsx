import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sanierungs-Cockpit",
  description: "Dein privates Bauprojekt im Griff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className="h-full">
      <body className={`${inter.className} antialiased h-full`}>{children}</body>
    </html>
  );
}
