import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JamWorks",
  description: "Full-stack web application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
