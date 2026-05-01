import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QAuth - 无密码登录、扫码确认与 Passkey 认证引擎",
  description: "QAuth 是一个运行在产品背后的身份认证引擎，支持 Passkey、扫码登录、设备绑定、一次性领取码和高风险二次验证。",
  icons: {
    icon: "/qauth-favicon.svg",
    shortcut: "/qauth-favicon.svg",
    apple: "/qauth-favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><Providers>{children}</Providers></body>
    </html>
  );
}
