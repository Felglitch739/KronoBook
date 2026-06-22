import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { InteractiveBackground } from './InteractiveBackground';

interface LayoutProps {
  children: React.ReactNode;
  slug?: string;
  isAdmin?: boolean;
  /** Slug del negocio del que el usuario logueado es owner. Si coincide con slug, mostramos botón de admin. */
  ownerSlug?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, slug, isAdmin, ownerSlug }) => {
  return (
    <div className="flex flex-col min-h-screen font-sans w-full max-w-full overflow-x-hidden bg-[#0b0c0e] text-zinc-100 pb-20 md:pb-0 relative">
      {isAdmin && <InteractiveBackground />}
      <div className="relative z-10 flex flex-col flex-1 w-full max-w-full">
        <Navbar slug={slug} isAdmin={isAdmin} ownerSlug={ownerSlug} />
        <main className="flex-1 w-full max-w-full overflow-x-hidden">{children}</main>
        <Footer />
      </div>
    </div>
  );
};
