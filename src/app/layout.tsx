import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata: Metadata = {
  title: "SakhiHub | Empowering Women Across India",
  description: "SakhiHub is a dedicated platform for women's health, awareness, education, and self-reliance. Join our mission to empower every woman in India.",
  keywords: "women health, women empowerment, sanitary pads, rural development, women employment, SakhiHub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi">
      <body>
        <LanguageProvider>
          <Navbar />
          <main style={{ minHeight: 'calc(100vh - 80px)', paddingTop: '80px' }}>
            {children}
          </main>
          <Footer />
          <WhatsAppButton />
        </LanguageProvider>
      </body>
    </html>
  );
}

