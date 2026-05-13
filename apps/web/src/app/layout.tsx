import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConditionalSiteShell } from "@/components/ConditionalSiteShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Malva Garden",
  description: "Насіння, квіти та садові товари",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <ConditionalSiteShell>{children}</ConditionalSiteShell>
      </body>
    </html>
  );
}
