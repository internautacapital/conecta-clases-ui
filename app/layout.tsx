import { Providers } from "@/components/providers";
import { Navbar } from "@/components/ui/Navbar";
import { PageLoader } from "@/components/ui/PageLoader";
import { ErrorInterceptor } from "@/components/ErrorInterceptor";
import { TourInitializer } from "@/components/TourInitializer";
import { HelpButton } from "@/components/ui/HelpButton";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Conecta Clases - Semillero Digital",
  description: "Plataforma educativa para gestión de clases y seguimiento de estudiantes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <Providers>
          <ErrorInterceptor />
          <TourInitializer />
          <PageLoader />
          <Navbar />
          <main className="min-h-screen bg-background">
            {children}
          </main>
          <HelpButton />
        </Providers>
      </body>
    </html>
  );
}
