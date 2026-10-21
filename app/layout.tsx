import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Heebo } from "next/font/google";
import { Toaster } from "sonner";
import { Atmosphere } from "@/components/Atmosphere";
import { MotionProvider } from "@/components/MotionProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Voca",
    template: "%s · Voca",
  },
  description:
    "Daily technical English for software engineers. Five B2/C1 terms, spaced repetition, voice or text.",
  applicationName: "Voca",
  appleWebApp: {
    capable: true,
    title: "Voca",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#f4f6fb",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${heebo.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-canvas font-sans text-ink">
        <MotionProvider>
          <Atmosphere />
          {children}
          <Toaster theme="light" position="top-center" />
        </MotionProvider>
      </body>
    </html>
  );
}
