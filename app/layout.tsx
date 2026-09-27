import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { getSiteUrl } from "@/lib/utils";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Aurane",
    template: "%s · Aurane",
  },
  description: "Aurane. Giving you compliments in a bottle.",
  openGraph: {
    type: "website",
    siteName: "Aurane",
    locale: "en_NG",
  },
  icons: {
    icon: "https://dodptt9f4zk9h.cloudfront.net/stores/294798/favicon.jpeg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${cormorant.variable} antialiased`}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#fbf8f4",
              color: "#1c1612",
              border: "1px solid #e4d9cb",
              borderRadius: "2px",
            },
          }}
        />
      </body>
    </html>
  );
}
