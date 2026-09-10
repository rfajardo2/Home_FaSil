/**
 * Home Hub design system.
 *
 * Ported from the approved visual mockup (Claude Design canvas). Colors were
 * computed from the mockup's OKLCH tokens so the hex values match exactly.
 *
 * Dark mode is a first pass (not pixel-tuned against a dedicated dark
 * mockup) — safe to refine later without touching call sites, since every
 * screen reads colors through `useTheme()` / `Colors[scheme]`.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Surfaces & ink
    background: '#FBF6F0',
    surface: '#FFFDFB',
    surfaceAlt: '#F6EFE6',
    text: '#2E2119',
    textSecondary: '#73665F',
    textFaint: '#A09690',
    border: '#E4DCD6',

    // Brand
    primary: '#E86545',
    primaryOn: '#FFFAF9',
    primarySoft: '#FFDFD2',

    // Status
    success: '#5DA56E',
    successSoft: '#D6F0DA',
    danger: '#D74745',
    dangerSoft: '#FFDCD7',

    // Aliases used by the starter template's ThemedView/ThemedText
    backgroundElement: '#F6EFE6',
    backgroundSelected: '#FFDFD2',
  },
  dark: {
    background: '#171310',
    surface: '#211B16',
    surfaceAlt: '#2A231D',
    text: '#F5EEE7',
    textSecondary: '#C3B7AE',
    textFaint: '#8A7F77',
    border: '#3A322B',

    primary: '#F0805F',
    primaryOn: '#241008',
    primarySoft: '#3A2119',

    success: '#7BC98C',
    successSoft: '#1E3323',
    danger: '#E97674',
    dangerSoft: '#3A1D1C',

    backgroundElement: '#2A231D',
    backgroundSelected: '#3A2119',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Category & avatar accent hues — same in both color schemes (brand identity, not surface). */
export const AccentColors = {
  catCocina: '#DC932E',
  catCocinaSoft: '#FFE7CB',
  catLimpieza: '#30A4AA',
  catLimpiezaSoft: '#D2EEF0',
  catServicios: '#427FD8',
  catServiciosSoft: '#D9E6F9',
  catMantenimiento: '#825EB9',
  catMantenimientoSoft: '#E8E0F9',
  catEventos: '#DF5770',
  catEventosSoft: '#FFDCE0',
  petGreen: '#5BB661',
  petGreenSoft: '#D6F0D6',

  avatar1: '#E86545', // coral (brand primary)
  avatar2: '#30A4AA', // teal
  avatar3: '#825EB9', // violet
  avatar4: '#DC932E', // amber
  avatar5: '#427FD8', // blue
} as const;

/** Fixed hue order for chart series (validated for CVD-safety — see dataviz notes). */
export const ChartColors = {
  servicios: '#2a78d6',
  cocina: '#eb6834',
  limpieza: '#1baf7a',
  mantenimiento: '#4a3aa7',
  eventos: '#e87ba4',
} as const;

export const Fonts = Platform.select({
  web: {
    display: 'Outfit_700Bold, Outfit_600SemiBold, system-ui, sans-serif',
    displayMedium: 'Outfit_600SemiBold, system-ui, sans-serif',
    body: 'PlusJakartaSans_400Regular, system-ui, sans-serif',
    bodyMedium: 'PlusJakartaSans_600SemiBold, system-ui, sans-serif',
    bodyBold: 'PlusJakartaSans_700Bold, system-ui, sans-serif',
  },
  default: {
    display: 'Outfit_700Bold',
    displayMedium: 'Outfit_600SemiBold',
    body: 'PlusJakartaSans_400Regular',
    bodyMedium: 'PlusJakartaSans_600SemiBold',
    bodyBold: 'PlusJakartaSans_700Bold',
  },
})!;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  seven: 32,
  eight: 40,
} as const;

export const Radii = {
  sm: 10,
  md: 14,
  lg: 18,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 34, android: 24, default: 12 }) ?? 12;
export const MaxContentWidth = 480;

/** Category metadata shared by Tareas, Nueva tarea, and Categorías screens. */
export const CATEGORIES = [
  { id: 'cocina', label: 'Cocina', color: AccentColors.catCocina, soft: AccentColors.catCocinaSoft, icon: 'utensils' as const },
  { id: 'limpieza', label: 'Limpieza', color: AccentColors.catLimpieza, soft: AccentColors.catLimpiezaSoft, icon: 'droplet' as const },
  { id: 'servicios', label: 'Servicios', color: AccentColors.catServicios, soft: AccentColors.catServiciosSoft, icon: 'bolt' as const },
  { id: 'mantenimiento', label: 'Mantenimiento', color: AccentColors.catMantenimiento, soft: AccentColors.catMantenimientoSoft, icon: 'wrench' as const },
  { id: 'eventos', label: 'Eventos', color: AccentColors.catEventos, soft: AccentColors.catEventosSoft, icon: 'gift' as const },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];
