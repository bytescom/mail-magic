import { Geist, Geist_Mono, Manrope } from "next/font/google";
import AuthProvider from "@/lib/AuthProvider";
import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata = {
  title: "Desento - Full-Stack Outreach Platform",
  description: "Create, send, track, and manage personalized outreach from a single workspace. The ultimate outreach platform for professionals.",
  keywords: ["personalized outreach", "cold outreach tool", "email outreach", "sales prospecting", "outreach automation"],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={` ${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
