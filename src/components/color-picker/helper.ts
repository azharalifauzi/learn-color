import { HSV, RGB } from "./types";

export function getRgbFromCanvas(
  hue: RGB,
  x: number,
  y: number,
  canvasW: number,
  canvasH: number
): RGB {
  const MIN = 0;
  const MAX = 255;
  const whiteOpacity = (canvasW - x) / canvasW;
  const blackOpacity = y / canvasH;
  const whiteChannel = Math.round(whiteOpacity * 255);
  const blackChannel = Math.round(blackOpacity * 0);

  return hue.map((color) => {
    let c = Math.round(color * (1 - whiteOpacity)) + whiteChannel;
    c = Math.round(c * (1 - blackOpacity)) + blackChannel;

    c = Math.min(c, MAX);

    return c < MIN ? MIN : c;
  }) as RGB;
}

export function getHue(x: number, canvasW: number): RGB {
  const position = x / canvasW;

  // Purple
  if (position >= 0 && position <= 0.15) {
    const multiplier = position / 0.15;

    return [255, 0, Math.round(multiplier * 255)];
  }

  // Blue
  if (position >= 0.15 && position <= 0.33) {
    const multiplier = 1 - (position - 0.15) / (0.33 - 0.15);

    return [Math.round(multiplier * 255), 0, 255];
  }

  // Teal
  if (position >= 0.33 && position <= 0.49) {
    const multiplier = (position - 0.33) / (0.49 - 0.33);

    return [0, Math.round(multiplier * 255), 255];
  }

  // Green
  if (position >= 0.49 && position <= 0.67) {
    const multiplier = 1 - (position - 0.49) / (0.67 - 0.49);

    return [0, 255, Math.round(multiplier * 255)];
  }

  // Yellow
  if (position >= 0.67 && position <= 0.84) {
    const multiplier = (position - 0.67) / (0.84 - 0.67);

    return [Math.round(multiplier * 255), 255, 0];
  }

  // Orange
  if (position >= 0.84 && position <= 1) {
    const multiplier = 1 - (position - 0.84) / (1 - 0.84);

    return [255, Math.round(multiplier * 255), 0];
  }

  return [255, 0, 0];
}

export function rgbToHsv(rgb: RGB): HSV {
  const [r, g, b] = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let v = max / 255;

  const delta = max - min;

  if (delta === 0) {
    // Achromatic (grayscale)
    h = 0;
  } else {
    // Calculate hue
    if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }

    h = Math.round(h * 60);

    // Ensure that hue is within [0, 360] range
    if (h < 0) {
      h += 360;
    }
  }

  // Calculate saturation
  if (max !== 0) {
    s = delta / max;
  }

  s = +(s * 100).toFixed(2);
  v = +(v * 100).toFixed(2);

  return [Math.abs(h), s, v];
}

export function hsvToRgb(hsv: HSV): RGB {
  const [h, s, v] = hsv;
  const c = (v / 100) * (s / 100);
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v / 100 - c;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
  } else if (h >= 120 && h < 180) {
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return [r, g, b];
}

export function drawMain(canvas: HTMLCanvasElement, hueAsRgb: RGB) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (ctx) {
    ctx.fillStyle = `rgb(${hueAsRgb[0]}, ${hueAsRgb[1]}, ${hueAsRgb[2]})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const whiteGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    whiteGradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    whiteGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.fillStyle = whiteGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const blackGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    blackGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    blackGradient.addColorStop(1, "rgba(0, 0, 0, 1)");

    ctx.fillStyle = blackGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

export function drawHue(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    // Red
    gradient.addColorStop(0, "rgb(255, 0, 0)");
    // Purple
    gradient.addColorStop(0.15, "rgb(255, 0, 255)");
    // Blue
    gradient.addColorStop(0.33, "rgb(0, 0, 255)");
    // Teal
    gradient.addColorStop(0.49, "rgb(0, 255, 255)");
    // Green
    gradient.addColorStop(0.67, "rgb(0, 255, 0)");
    // Yellow
    gradient.addColorStop(0.84, "rgb(255, 255, 0)");
    // Orange
    gradient.addColorStop(1, "rgb(255, 0, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// Minmax a value between an upper and lower bound.
// We use ternary operators because it makes the minified code
// 2 times shorter then `Math.min(Math.max(a,b),c)`
export const minmax = (number: number, min = 0, max = 1): number => {
  return number > max ? max : number < min ? min : number;
};

export function rgbToHex(rgb: RGB): string {
  const [r, g, b] = rgb;
  const toHex = (value: number): string => {
    const hex = value.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hexToRgb(hex: string): RGB | null {
  // Remove the "#" symbol if present
  hex = hex.replace(/^#/, "");

  // Check if the hex string is a valid 3- or 6-digit hex color
  const validHexPattern = /^(?:[0-9a-fA-F]{3}){1,2}$/;
  if (!validHexPattern.test(hex)) {
    return null; // Invalid hex color
  }

  // Normalize the hex string to a 6-digit format if it's 3 digits
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  // Parse the hex values for red, green, and blue
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 2), 16);
  const b = parseInt(hex.substring(4, 2), 16);

  return [r, g, b];
}

export function isValidRgbColor(color: RGB): boolean {
  if (Array.isArray(color) && color.length === 3) {
    const [r, g, b] = color;
    if (
      Number.isInteger(r) &&
      Number.isInteger(g) &&
      Number.isInteger(b) &&
      r >= 0 &&
      r <= 255 &&
      g >= 0 &&
      g <= 255 &&
      b >= 0 &&
      b <= 255
    ) {
      return true;
    }
  }
  return false;
}
