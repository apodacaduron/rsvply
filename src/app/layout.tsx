// app/layout.tsx (Server component, no hooks)
import './globals.css';
import 'aos/dist/aos.css';

import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';

import { Providers } from '@/context/Providers'; // Your client wrapper

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Sweet Invites CUU",
  description: "Invitaciones digitales para tus eventos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <Toaster />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
