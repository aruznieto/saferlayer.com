import type { Metadata } from "next";
import { Inter } from "next/font/google";
import './styles/styles.less';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Saferlayer",
  description: "Add watermarks to your documents for free and avoid scams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}