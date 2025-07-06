import type { Metadata } from "next";
import { Geist, Geist_Mono, Dancing_Script } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/authHelpers";
import AppWrapper from "@/components/AppWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Debrief - Social Calendar",
  description: "Create, share, and discover social calendars. Plan events, share memories, and stay connected with friends and family.",
  keywords: ["calendar", "social", "events", "planning", "sharing", "memories"],
  authors: [{ name: "Debrief Team" }],
  creator: "Debrief",
  publisher: "Debrief",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://debrief.app"),
  openGraph: {
    title: "Debrief - Social Calendar App",
    description: "Create, share, and discover social calendars. Plan events, share memories, and stay connected with friends and family.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Debrief - Social Calendar App",
    description: "Create, share, and discover social calendars. Plan events, share memories, and stay connected with friends and family.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dancingScript.variable} antialiased`}
      >
        <AuthProvider>
          <AppWrapper>{children}</AppWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
