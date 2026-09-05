import type { Metadata, Viewport } from 'next';
import { Inter as FontSans } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { PwaRegister } from '@/components/pwa-register';
import { OfflineFlush } from '@/components/offline-flush';

const inter = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const geistMono = localFont({
  src: './fonts/GeistMono[wght].woff2',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Cimitri',
  description: 'Scheduling and compliance automation for regulated trades.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Cimitri',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  themeColor: '#E56515',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
      className={cn(inter.variable, geistMono.variable, 'font-sans antialiased')}
    >
      <body className='bg-background text-foreground'>
        <ThemeProvider attribute='class' defaultTheme='light' enableSystem>
          <TooltipProvider>
            <div className='flex min-h-screen flex-col'>{children}</div>
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
        <PwaRegister />
        <OfflineFlush />
      </body>
    </html>
  );
}
