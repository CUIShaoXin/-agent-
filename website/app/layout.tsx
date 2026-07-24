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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://minimum-agent-lab.cuihshaoxin6.chatgpt.site";
const base = new URL(siteUrl);
const ogImagePath = process.env.GITHUB_ACTIONS === "true"
  ? "/-agent-/og.png"
  : "/og.png";

export const metadata: Metadata = {
  metadataBase: base,
  title: "Minimum Agent Lab｜从零实现一个最小可用 Agent",
  description:
    "一份可运行、可测试、可追踪的 Agent Runtime 开源教程。从 Loop、Tools、Session 到 Context，逐层理解智能体。",
  openGraph: {
    title: "Minimum Agent Lab",
    description: "不用 Agent 框架，从零读懂并实现一个最小可用 Agent。",
    type: "website",
    images: [
      {
        url: new URL(ogImagePath, base).toString(),
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Minimum Agent Lab",
    description: "不用 Agent 框架，从零读懂并实现一个最小可用 Agent。",
    images: [new URL(ogImagePath, base).toString()],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
