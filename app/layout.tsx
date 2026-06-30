import type {Metadata} from 'next';
import { Viaoda_Libre, Imprima } from 'next/font/google';
import './globals.css';

const viaoda = Viaoda_Libre({ weight: '400', subsets: ['latin'], variable: '--font-viaoda' });
const imprima = Imprima({ weight: '400', subsets: ['latin'], variable: '--font-imprima' });

export const metadata: Metadata = {
  title: 'Reverie',
  description: 'A high-fidelity interactive landing page',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${viaoda.variable} ${imprima.variable}`}>
      <body className="font-imprima antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
