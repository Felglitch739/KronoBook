import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="py-8 bg-zinc-950 text-zinc-500 border-t border-zinc-900 text-center mt-auto text-sm">
      <p>&copy; {new Date().getFullYear()} KronoBook. Todos los derechos reservados.</p>
    </footer>
  );
};
