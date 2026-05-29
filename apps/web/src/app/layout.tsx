import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConditionalSiteShell } from "@/components/ConditionalSiteShell";
import { MgCartToast } from "@/components/figma/MgCartToast";
import { CustomerAuthProvider } from "@/providers/CustomerAuthProvider";
import { CatalogNavProvider } from "@/providers/CatalogNavProvider";
import { StoreHeaderSettingsProvider } from "@/providers/StoreHeaderSettingsProvider";
import { loadStoreNavSections } from "@/lib/loadStoreNav";
import { loadStoreHeaderSettings } from "@/lib/storeHeaderSettings";
import {
  absoluteUrl,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE_PATH,
  getSiteUrl,
  SITE_NAME,
} from "@/lib/seo/site";
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
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_NAME} — насіння, квіти та садові товари`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "uk_UA",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE_PATH, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
  },
  alternates: {
    canonical: absoluteUrl("/"),
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [headerSettings, catalogNavSections] = await Promise.all([
    loadStoreHeaderSettings(),
    loadStoreNavSections(),
  ]);

  return (
    <html lang="uk">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <StoreHeaderSettingsProvider value={headerSettings}>
          <CatalogNavProvider sections={catalogNavSections}>
            <CustomerAuthProvider>
              <ConditionalSiteShell>{children}</ConditionalSiteShell>
            </CustomerAuthProvider>
          </CatalogNavProvider>
        </StoreHeaderSettingsProvider>
        <MgCartToast />
      </body>
    </html>
  );
}
