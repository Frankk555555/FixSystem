import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai, Sarabun } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  weight: ["400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-ibm-plex",
  display: "swap",
});

const sarabun = Sarabun({
  weight: ["400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-sarabun",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ระบบแจ้งซ่อมออนไลน์ - มหาวิทยาลัย",
  description: "แจ้งซ่อม ติดตามสถานะ และจัดการงานซ่อมภายในมหาวิทยาลัยได้ในที่เดียว",
  authors: [{ name: "University Repair System" }],
  openGraph: {
    title: "ระบบแจ้งซ่อมออนไลน์ - มหาวิทยาลัย",
    description: "แจ้งซ่อม ติดตามสถานะ และจัดการงานซ่อมภายในมหาวิทยาลัยได้ในที่เดียว",
    type: "website",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${ibmPlexSansThai.variable} ${sarabun.variable}`}>
      <body className="antialiased">
        <AuthProvider>
          {children}
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}

