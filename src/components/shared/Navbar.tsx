import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from './Logo';

interface NavbarProps {
  slug?: string;
  isAdmin?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ slug, isAdmin: propIsAdmin }) => {
  const location = useLocation();
  const { slug: routeSlug } = useParams<{ slug?: string }>();
  const activeSlug = routeSlug || slug || 'barberia-chaga';
  const currentPath = location.pathname;

  // Evaluar si estamos en la sección de administración
  const isAdminPage = currentPath.startsWith('/admin') || !!propIsAdmin;

  // Determine current active section for styling
  const isLanding = currentPath === `/${activeSlug}`;
  const isAgenda = currentPath === `/${activeSlug}/reservar`;
  const isDashboard = currentPath.startsWith('/admin/dashboard');

  const { user, profile } = useAuth();

  const hasSession = !!user;
  const userName = profile?.nombre || user?.user_metadata?.nombre || user?.email?.split('@')[0] || 'Admin';

  return (
    <>
      {/* Top Navbar for Desktop/Tablet */}
      <nav className="hidden md:flex justify-between items-center px-6 md:px-12 py-4 bg-zinc-900/85 backdrop-blur-md border-b border-zinc-800/80 sticky top-0 z-50">
        <Link 
          to="/" 
          className="hover:scale-[1.02] transition-transform"
        >
          <Logo size="md" />
        </Link>
        <div className="flex items-center gap-4">
          {isAdminPage ? (
            <>
              <span className="text-zinc-400 text-sm font-medium flex items-center gap-2 px-3 py-1.5 bg-zinc-800/40 border border-zinc-700/30 rounded-xl">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.5)]"></span>
                <span>Modo Admin ({userName})</span>
              </span>
              <Link
                to="/admin/dashboard"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isDashboard
                    ? 'text-sky-400 bg-sky-500/10 shadow-[inset_0_0_12px_rgba(14,165,233,0.08)] border border-sky-500/20'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to={`/${activeSlug}`}
                className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-sky-400 hover:bg-zinc-800/40 border border-transparent hover:border-sky-500/20 transition-all duration-200 flex items-center gap-1.5"
              >
                <span>Ver Vista Cliente</span>
                <span className="text-base">👁️</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to={`/${activeSlug}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isLanding
                    ? 'text-sky-400 bg-sky-500/10 shadow-[inset_0_0_12px_rgba(14,165,233,0.08)] border border-sky-500/20'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40'
                }`}
              >
                Inicio
              </Link>
              <Link
                to={`/${activeSlug}/reservar`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isAgenda
                    ? 'text-sky-400 bg-sky-500/10 shadow-[inset_0_0_12px_rgba(14,165,233,0.08)] border border-sky-500/20'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40'
                }`}
              >
                Reservar
              </Link>
              {hasSession && (
                <Link
                  to="/admin/dashboard"
                  className="px-4 py-2 rounded-lg text-sm font-bold text-sky-500 hover:text-zinc-950 bg-transparent hover:bg-sky-500 border border-sky-500/40 hover:border-sky-500 shadow-[inset_0_0_12px_rgba(14,165,233,0.05)] transition-all duration-300 flex items-center gap-1.5"
                >
                  <span>Panel</span>
                  <span>🛠️</span>
                </Link>
              )}
            </>
          )}
        </div>
      </nav>

      <div className="md:hidden flex justify-center items-center py-4 bg-zinc-900/85 backdrop-blur-md border-b border-zinc-800/80 sticky top-0 z-40">
        <Link 
          to="/"
        >
          <Logo size="sm" />
        </Link>
      </div>

      {/* Bottom Nav Bar for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800/80 z-50 flex justify-around items-center px-2 py-3 pb-safe transition-all duration-200">
        {isAdminPage ? (
          <>
            <Link
              to="/admin/dashboard"
              className={`flex flex-col items-center gap-1 p-2 rounded-xl min-w-[70px] transition-all duration-200 active:scale-95 ${
                isDashboard ? 'text-sky-400 bg-sky-500/10' : 'text-zinc-400 active:bg-zinc-800/50 active:text-zinc-200'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              <span className="text-[10px] font-bold">Panel</span>
            </Link>
            <Link
              to={`/${activeSlug}`}
              className="flex flex-col items-center gap-1 p-2 rounded-xl min-w-[70px] text-zinc-400 active:bg-zinc-800/50 active:text-zinc-200 active:scale-95 transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              <span className="text-[10px] font-bold">Ver Cliente</span>
            </Link>
          </>
        ) : (
          <>
            <Link
              to={`/${activeSlug}`}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl min-w-[70px] transition-all duration-200 active:scale-95 ${
                isLanding ? 'text-sky-400 bg-sky-500/10' : 'text-zinc-400 active:bg-zinc-800/50 active:text-zinc-200'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              <span className="text-[10px] font-bold">Inicio</span>
            </Link>
            <Link
              to={`/${activeSlug}/reservar`}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl min-w-[70px] transition-all duration-200 active:scale-95 ${
                isAgenda ? 'text-sky-400 bg-sky-500/10' : 'text-zinc-400 active:bg-zinc-800/50 active:text-zinc-200'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span className="text-[10px] font-bold">Reservar</span>
            </Link>
            {hasSession && (
              <Link
                to="/admin/dashboard"
                className="flex flex-col items-center gap-1 p-2 rounded-xl min-w-[70px] text-sky-500/90 active:bg-zinc-800/50 active:text-sky-400 active:scale-95 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="text-[10px] font-bold">Panel</span>
              </Link>
            )}
          </>
        )}
      </nav>
    </>
  );
};
