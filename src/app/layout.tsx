import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SessionProvider from "@/components/providers/SessionProvider";

import "./globals.css";

// ─── Fonts ────────────────────────────────────────────────────────────────────

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["500", "600", "700", "800", "900"],
});

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXTAUTH_URL ?? "https://kaosociety.fr"
  ),
  title: {
    default: "KAO Society — Communauté de sports outdoor",
    template: "%s | KAO Society",
  },
  description:
    "Rejoignez la KAO Society : randonnées, escalade et activités outdoor en communauté. Découvrez nos événements, inscrivez-vous et partagez votre passion.",
  keywords: [
    "sports outdoor",
    "randonnée",
    "escalade",
    "communauté",
    "activités nature",
    "KAO Society",
  ],
  authors: [{ name: "KAO Society" }],
  creator: "KAO Society",
  publisher: "KAO Society",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://kaosociety.fr",
    siteName: "KAO Society",
    title: "KAO Society — Communauté de sports outdoor",
    description:
      "Rejoignez la KAO Society : randonnées, escalade et activités outdoor en communauté.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "KAO Society — Communauté de sports outdoor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KAO Society — Communauté de sports outdoor",
    description:
      "Rejoignez la KAO Society : randonnées, escalade et activités outdoor en communauté.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#4F3872",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html
      lang="fr"
      className={`${inter.variable} ${montserrat.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-lavender-200 font-sans antialiased">
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
