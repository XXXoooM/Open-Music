export interface HslPalette {
  background: string;
  primary: string;
  surface: string;
  textMain: string;
  textMuted: string;
  textInactive: string;
  softAccent: string;
}

// Compute song hash color (Hue) consistently with Web/Android versions
export function getSongHashColor(title: string, artist: string): number {
  let hash = 0;
  const str = title + artist;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360; // Direct modulo without step accumulation
}

// Convert HSL values to CSS hsl string format
export function hslToColor(hue: number, saturation: number, lightness: number): string {
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Generate the HslPalette based on target Hue
export function generatePalette(hue: number): HslPalette {
  return {
    background: `hsl(${hue}, 18%, 4%)`,
    primary: `hsl(${hue}, 92%, 68%)`,
    surface: `hsl(${hue}, 15%, 10%)`,
    textMain: `hsl(${hue}, 8%, 96%)`,
    textMuted: `hsl(${hue}, 6%, 62%)`,
    textInactive: `hsl(${hue}, 4%, 38%)`,
    softAccent: `hsl(${hue}, 40%, 20%)`
  };
}
