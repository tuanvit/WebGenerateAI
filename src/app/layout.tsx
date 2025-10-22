import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SessionProvider from "@/components/providers/SessionProvider";
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
  title: "AI Prompt Generator for Teachers",
  description: "Hệ thống tạo prompt AI cho giáo viên Việt Nam - Hỗ trợ tạo giáo án và nội dung giảng dạy theo chuẩn GDPT 2018",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <div id="main-content">
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
