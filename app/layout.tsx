import type { Metadata } from "next";
import { Geologica } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geologica = Geologica({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Get Stuff Done",
  description: "Professional task management for the FirstStep Team",
  icons: {
    icon: "/brand/fst-logo.png",
    apple: "/brand/fst-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geologica.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
