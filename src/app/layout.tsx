import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
  preload: true,
});

const sans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: true,
});

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Memory Drop",
    template: "%s · Memory Drop",
  },
  description:
    "Collect wedding photos and videos from guests privately. Guests upload via link or QR — only you can view the gallery.",
  applicationName: "Memory Drop",
  keywords: [
    "wedding photos",
    "guest uploads",
    "private gallery",
    "QR code",
    "Google Drive",
  ],
  authors: [{ name: "Memory Drop" }],
  creator: "Memory Drop",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "/",
    siteName: "Memory Drop",
    title: "Memory Drop",
    description:
      "Collect wedding photos and videos from guests privately. Guests upload via link or QR — only you can view the gallery.",
    images: [
      {
        url: "/floral-asset.webp",
        width: 900,
        height: 600,
        alt: "Memory Drop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Memory Drop",
    description:
      "Collect wedding photos and videos from guests privately. Guests upload via link or QR — only you can view the gallery.",
    images: ["/floral-asset.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/logo-mark.webp", type: "image/webp" }],
    apple: [{ url: "/logo-mark.webp", type: "image/webp" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f5e6df",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
