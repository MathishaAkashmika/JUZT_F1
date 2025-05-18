import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
  title: "JUZT F1",
  description: "Formula 1 Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}        <Script
          id="anythingllm-chat-widget"
          data-embed-id="c36167c6-517c-4b16-bba6-a7ceaccbdd45"
          data-base-api-url={`${process.env.NEXT_PUBLIC_ANYTHINGLLM_API_URL}/api/embed`}
          data-chat-icon="chatBubble"
          data-no-sponsor="true"
          data-assistant-name="JUZT_F1"
          data-assistant-icon="https://i.ibb.co/2YFHCmtJ/JUZT-2-1.png"
          data-brand-image-url="https://i.ibb.co/2YFHCmtJ/JUZT-2-1.png"
          src={`${process.env.NEXT_PUBLIC_ANYTHINGLLM_API_URL}/embed/anythingllm-chat-widget.min.js`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
