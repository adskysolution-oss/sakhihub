import type { Metadata } from "next";
import "./globals.css";
import MainLayoutWrapper from "@/components/shared/MainLayoutWrapper";
import { LanguageProvider } from "@/context/LanguageContext";
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: "SakhiHub | Empowering Women Across India",
  description: "SakhiHub is a dedicated platform for women's health, awareness, education, and self-reliance. Join our mission to empower every woman in India.",
  keywords: "women health, women empowerment, sanitary pads, rural development, women employment, SakhiHub",
  icons: {
    icon: "/TitleLogo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <LanguageProvider>
          <MainLayoutWrapper>
            {children}
          </MainLayoutWrapper>
        </LanguageProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}

