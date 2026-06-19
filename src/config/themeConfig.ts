export type ThemeType = 'dark' | 'light' | 'elegant';

export const themeConfig: Record<ThemeType, any> = {
  dark: {
    // Fondos muy oscuros, texto claro, bordes celestes (manteniendo el Glassmorphism actual)
    bg: 'bg-[#0b0c0e]',
    fadeBottom: 'from-[#0b0c0e]',
    bgSecondary: 'bg-[#16191e]/40',
    text: 'text-zinc-100',
    textMuted: 'text-zinc-400',
    title: 'text-zinc-50',
    border: 'border-white/5',
    borderHover: 'hover:border-white/20',
    glass: 'backdrop-blur-md',
    shadow: 'shadow-xl',
    overlay: 'bg-[#0b0c0e]/80',
    fontBase: 'font-sans',
    fontTitle: 'font-serif',
    buttonPrimary: 'shadow-lg hover:shadow-[var(--color-primario)] hover:-translate-y-1',
    buttonSecondary: 'shadow-lg hover:shadow-[var(--color-secundario)] hover:-translate-y-1',
  },
  light: {
    // Fondos blancos/grises muy claros, texto oscuro, sombras suaves, look clínico/minimalista
    bg: 'bg-zinc-50',
    fadeBottom: 'from-zinc-50',
    bgSecondary: 'bg-white/80',
    text: 'text-zinc-800',
    textMuted: 'text-zinc-500',
    title: 'text-zinc-950',
    border: 'border-zinc-200',
    borderHover: 'hover:border-zinc-300',
    glass: 'backdrop-blur-sm',
    shadow: 'shadow-sm hover:shadow-md',
    overlay: 'bg-zinc-50/70',
    fontBase: 'font-sans',
    fontTitle: 'font-sans',
    buttonPrimary: 'shadow-md hover:shadow-lg hover:-translate-y-1',
    buttonSecondary: 'shadow-md hover:shadow-lg hover:-translate-y-1',
  },
  elegant: {
    // Tonos crema/beige, tipografía serif para títulos, botones minimalistas con bordes finos
    bg: 'bg-[#fdfbf7]', // Crema exacto para que el fadeBottom no se vea gris
    fadeBottom: 'from-[#fdfbf7]',
    bgSecondary: 'bg-[#f4efe4]', // Crema ligeramente más oscuro para dar contraste
    text: 'text-[#4a4036]',
    textMuted: 'text-[#6b5e4f]',
    title: 'text-[#2c241b]',
    border: 'border-[#d4c5ab]', // Borde fino y definido
    borderHover: 'hover:border-[#bda588]',
    glass: 'backdrop-blur-none',
    shadow: 'shadow-sm hover:shadow-md',
    overlay: 'bg-[#fdfbf7]/70',
    fontBase: 'font-[Lora]', // Fuente de lectura limpia y elegante
    fontTitle: 'font-serif', // Playfair Display u otra serif de Tailwind
    buttonPrimary: 'bg-[#4a4036] text-[#fdfbf7] hover:bg-[#3d342c] shadow-md border border-[#3d342c]',
    buttonSecondary: 'bg-[#4a4036] text-[#fdfbf7] hover:bg-[#3d342c] shadow-md border border-[#3d342c]',
  }
};
