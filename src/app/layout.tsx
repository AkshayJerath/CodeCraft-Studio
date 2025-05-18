
import type {Metadata} from 'next';
import { Inter } from 'next/font/google'; 
import { Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', // Use a more standard UI font
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono', // Keep Geist Mono for code if desired
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CodeCraft Studio',
  description: 'A coding editor for young coders, built with Next.js and AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The 'dark' class can be dynamically managed by client-side theme preference logic
    // (e.g., in page.tsx or settings/page.tsx via localStorage and useEffect)
    // For default, we can still set it here.
    <html lang="en" className="dark"> 
      <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}> {/* font-sans uses Inter */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
