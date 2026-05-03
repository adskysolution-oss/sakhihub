import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { MessageCircle } from "lucide-react";

import WhatsAppButton from "@/components/common/WhatsAppButton";

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
        <Navbar />
        <main style={{ minHeight: 'calc(100vh - 80px)', paddingTop: '80px' }}>
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
