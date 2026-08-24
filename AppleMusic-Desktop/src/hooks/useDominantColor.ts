import { useState, useEffect } from "react";

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  meshGradient: string;
}

const DEFAULT_PALETTE: ColorPalette = {
  primary: "#fa2d48",
  secondary: "#9333ea",
  accent: "#3b82f6",
  glow: "rgba(250, 45, 72, 0.35)",
  meshGradient: "radial-gradient(circle at 50% 40%, #fa2d48 0%, rgba(147, 51, 234, 0.3) 40%, transparent 75%)",
};

/**
 * Extracts vibrant dominant colors and builds an Apple Music mesh gradient
 */
export function useDominantColor(imageUrl?: string): ColorPalette {
  const [palette, setPalette] = useState<ColorPalette>(DEFAULT_PALETTE);

  useEffect(() => {
    if (!imageUrl) {
      setPalette(DEFAULT_PALETTE);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = 16;
        canvas.height = 16;
        ctx.drawImage(img, 0, 0, 16, 16);

        const imageData = ctx.getImageData(0, 0, 16, 16).data;
        let r = 0, g = 0, b = 0, count = 0;

        for (let i = 0; i < imageData.length; i += 4) {
          const pr = imageData[i];
          const pg = imageData[i + 1];
          const pb = imageData[i + 2];
          const brightness = (pr + pg + pb) / 3;
          if (brightness > 35 && brightness < 220) {
            r += pr;
            g += pg;
            b += pb;
            count++;
          }
        }

        if (count > 0) {
          const avgR = Math.round(r / count);
          const avgG = Math.round(g / count);
          const avgB = Math.round(b / count);

          const primary = `rgb(${avgR}, ${avgG}, ${avgB})`;
          const secR = Math.max(0, avgR - 50);
          const secG = Math.max(0, avgG - 40);
          const secB = Math.min(255, avgB + 60);
          const secondary = `rgb(${secR}, ${secG}, ${secB})`;
          const accent = `rgb(${Math.min(255, avgR + 40)}, ${Math.max(0, avgG - 20)}, ${Math.max(0, avgB - 30)})`;
          const glow = `rgba(${avgR}, ${avgG}, ${avgB}, 0.38)`;
          const meshGradient = `radial-gradient(ellipse at 50% 30%, ${primary} 0%, ${secondary} 50%, transparent 80%)`;

          setPalette({ primary, secondary, accent, glow, meshGradient });
        }
      } catch {
        setPalette(DEFAULT_PALETTE);
      }
    };

    img.onerror = () => {
      setPalette(DEFAULT_PALETTE);
    };
  }, [imageUrl]);

  return palette;
}
