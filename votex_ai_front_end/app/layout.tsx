import "./globals.css";
import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { ThemeProviderWrapper } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "VotexAI",
  description: "AI-powered DAO governance platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans dark`}
      >
        <ThemeProviderWrapper>
          <div className="min-h-screen bg-background">
            <div className="fixed inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#4f46e5,#3b82f6,#2563eb),linear-gradient(to_bottom,#4f46e5,#3b82f6,#2563eb)] bg-[size:400%_400%] opacity-20 dark:opacity-10 animate-gradient" />
            {children}
          </div>
          <Toaster />
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
