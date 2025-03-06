import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProviderWrapper } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VotexAI',
  description: 'AI-powered DAO governance platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} dark`}>
        <ThemeProviderWrapper>
          {children}
          <Toaster />
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}