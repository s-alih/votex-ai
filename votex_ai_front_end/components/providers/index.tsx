"use client";

import { ThemeProviderWrapper } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import WagmiProvider from "./wagmi-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider>
      <ThemeProviderWrapper>
        <div className="min-h-screen bg-background">
          <div className="fixed inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#4f46e5,#3b82f6,#2563eb),linear-gradient(to_bottom,#4f46e5,#3b82f6,#2563eb)] bg-[size:400%_400%] opacity-20 dark:opacity-10 animate-gradient" />
          {children}
        </div>
        <Toaster />
      </ThemeProviderWrapper>
    </WagmiProvider>
  );
}
