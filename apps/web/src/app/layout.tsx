import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MgCartToast } from "@/components/ui/MgCartToast";
import { CustomerAuthProvider } from "@/providers/CustomerAuthProvider";
import { CatalogNavProvider } from "@/providers/CatalogNavProvider";
import { StoreHeaderSettingsProvider } from "@/providers/StoreHeaderSettingsProvider";
import { loadFooterContentPages } from "@/lib/footerContentPages";
import { loadStoreNavSections } from "@/lib/loadStoreNav";
import { loadStoreHeaderSettings } from "@/lib/storeHeaderSettings";
import { FooterContentPagesProvider } from "@/providers/FooterContentPagesProvider";
import {
  absoluteUrl,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE_PATH,
  getSiteUrl,
  SITE_FAVICON_48,
  SITE_FAVICON_96,
  SITE_FAVICON_192,
  SITE_NAME,
} from "@/lib/seo/site";
import { MobileStoreLayout } from "@/components/store/mobile/MobileStoreLayout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const googleSiteVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || undefined;

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  ...(googleSiteVerification
    ? { verification: { google: googleSiteVerification } }
    : {}),
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
  icons: {
    icon: [
      { url: SITE_FAVICON_48, sizes: "48x48", type: "image/png" },
      { url: SITE_FAVICON_96, sizes: "96x96", type: "image/png" },
      { url: SITE_FAVICON_192, sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: SITE_FAVICON_48,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [headerSettings, catalogNavSections, footerContentPages] =
    await Promise.all([
      loadStoreHeaderSettings(),
      loadStoreNavSections(),
      loadFooterContentPages(),
    ]);

  return (
    <html lang="uk">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <StoreHeaderSettingsProvider value={headerSettings}>
          <FooterContentPagesProvider value={footerContentPages}>
            <CatalogNavProvider sections={catalogNavSections}>
              <CustomerAuthProvider>
                <MobileStoreLayout>{children}</MobileStoreLayout>
              </CustomerAuthProvider>
            </CatalogNavProvider>
          </FooterContentPagesProvider>
        </StoreHeaderSettingsProvider>
        <MgCartToast />
      </body>
    </html>
  );
}
