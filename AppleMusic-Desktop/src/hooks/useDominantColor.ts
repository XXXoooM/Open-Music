import { useState, useEffect } from "react";

interface ColorPalette {
  primary: string;
  secondary: string;
  glow: string;
}

const DEFAULT_PALETTE: ColorPalette = {
  primary: "#fa2d48",
  secondary: "#9333ea",
  glow: "rgba(250, 45, 72, 0.35)",
};

/**
 * Extracts vibrant dominant colors from an album art image using offscreen canvas
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
          // Exclude extreme darks and extreme whites to get vibrant midtones
          const brightness = (pr + pg + pb) / 3;
          if (brightness > 30 && brightness < 225) {
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
          const secondary = `rgb(${Math.max(0, avgR - 40)}, ${Math.max(0, avgG - 30)}, ${Math.min(255, avgB + 50)})`;
          const glow = `rgba(${avgR}, ${avgG}, ${avgB}, 0.4)`;

          setPalette({ primary, secondary, glow });
        }
      } catch (err) {
        // Fallback for CORS restricted images
        setPalette(DEFAULT_PALETTE);
      }
    };

    img.onerror = () => {
      setPalette(DEFAULT_PALETTE);
    };
  }, [imageUrl]);

  return palette;
}
