import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AlumniConnect - Alumni Network System",
  description:
    "Connect with alumni, find mentors, discover career opportunities, and build professional networks through your college alumni community.",
  keywords: [
    "alumni network",
    "college alumni",
    "mentorship",
    "career opportunities",
    "professional networking",
  ],
  openGraph: {
    title: "AlumniConnect - Alumni Network System",
    description:
      "Connect with alumni, find mentors, discover career opportunities, and build professional networks.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-background font-sans text-foreground antialiased">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
