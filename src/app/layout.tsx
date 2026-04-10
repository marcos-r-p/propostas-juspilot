import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Libre_Bodoni } from 'next/font/google';
import { Toaster } from '@/components/ui/toast';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const libreBodoni = Libre_Bodoni({
  variable: '--font-libre-bodoni',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'JusPilot Propostas',
  description: 'Gerador de Propostas Comerciais',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} ${libreBodoni.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
