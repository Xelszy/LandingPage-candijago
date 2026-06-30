import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4">
      <h2 className="text-4xl font-bold mb-4 font-viaoda tracking-wider text-amber-500">404</h2>
      <p className="text-lg font-imprima text-white/70 mb-8">Page Not Found</p>
      <Link href="/" className="px-6 py-3 border border-white/20 rounded-full font-imprima uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-colors duration-500">
        Return Home
      </Link>
    </div>
  );
}
