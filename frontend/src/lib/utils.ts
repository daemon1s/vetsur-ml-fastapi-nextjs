import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Nota: La función 'cn' es una utilidad que permite combinar clases de Tailwind de forma dinámica.
// Evita conflictos de estilos (ej: si pasas dos colores de fondo distintos) usando tailwind-merge.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
