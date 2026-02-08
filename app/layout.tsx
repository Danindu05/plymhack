import type { Metadata } from "next";
import "./globals.css";
import { Space_Grotesk } from "next/font/google";
import Navbar from "@/components/Navbar";

const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const metadata: Metadata = {
  title: "CleanPulse",
  description: "Verified waste reports + fast resolution tracking",

  icons: {
    icon: '/favicon.ico', // public folder එකේ තියෙන path එක
    apple: '/apple-icon.png', // Apple devices සඳහා (අවශ්‍ය නම්)
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={space.variable}>
      <head>
        
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" 
        />
      </head>
      <body className="bg-[#0f172a] antialiased">
     <Navbar />
        <main className="flex-grow pt-18">
          {children}
        </main>
      </body>
    </html>
  );
}