import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { MessageCircle } from "lucide-react";

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
        
        {/* WhatsApp Floating Button */}
        <a 
          href="https://wa.me/918076611842" 
          className="whatsapp-float"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact on WhatsApp"
        >
          <MessageCircle size={32} />
        </a>

        <style jsx global>{`
          .whatsapp-float {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 60px;
            height: 60px;
            background-color: #25d366;
            color: white;
            border-radius: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 999;
            transition: all 0.3s ease;
          }
          .whatsapp-float:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
          }
          @media (max-width: 768px) {
            .whatsapp-float {
              bottom: 20px;
              right: 20px;
              width: 50px;
              height: 50px;
            }
          }
        `}</style>
      </body>
    </html>
  );
}
