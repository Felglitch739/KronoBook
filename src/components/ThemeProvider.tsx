import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface ThemeConfig {
  primary: string;
  background: string;
  card: string;
  text: string;
}

interface ThemeProviderProps {
  slug: string;
  children: React.ReactNode;
}

const defaultTheme: ThemeConfig = {
  primary: '#6E3BFF',
  background: '#111111',
  card: '#2B2B2B',
  text: '#FFFFFF',
};

// Convierte HEX a RGB para soportar opacidad en Tailwind (ej. bg-tenant-primary/50)
function hexToRgb(hex: string) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r} ${g} ${b}`;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ slug, children }) => {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const { data, error } = await supabase
          .from('negocios')
          .select('theme_config')
          .eq('slug', slug)
          .single();

        if (data && data.theme_config) {
          setTheme(data.theme_config);
        }
      } catch (error) {
        console.error('Error fetching theme:', error);
      }
    };

    if (slug && slug !== 'global' && slug !== 'demo') {
      fetchTheme();
    }
  }, [slug]);

  const cssVariables = {
    '--tenant-primary': hexToRgb(theme.primary),
    '--tenant-background': hexToRgb(theme.background),
    '--tenant-card': hexToRgb(theme.card),
    '--tenant-text': hexToRgb(theme.text),
  } as React.CSSProperties;

  return (
    <div 
      style={cssVariables} 
      className="min-h-screen bg-tenant-background text-tenant-text transition-colors duration-300 w-full"
    >
      {children}
    </div>
  );
};
