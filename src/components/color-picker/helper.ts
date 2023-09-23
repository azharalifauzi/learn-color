export type RGB = [number, number, number]
export type HSV = [number, number, number]

export function getRgbFromCanvas(
  hue: RGB,
  x: number,
  y: number,
  canvasW: number,
  canvasH: number
): RGB {
  const MIN = 0
  const MAX = 255
  const whiteOpacity = (canvasW - x) / canvasW
  const blackOpacity = y / canvasH
  const whiteChannel = Math.round(whiteOpacity * 255)
  const blackChannel = Math.round(blackOpacity * 0)

  return hue.map((color) => {
    let c = Math.round(color * (1 - whiteOpacity)) + whiteChannel
    c = Math.round(c * (1 - blackOpacity)) + blackChannel

    c = Math.min(c, MAX)

    return c < MIN ? MIN : c
  }) as RGB
}

export function getHue(x: number, canvasW: number): RGB {
  const position = x / canvasW

  // Purple
  if (position >= 0 && position <= 0.15) {
    const multiplier = position / 0.15

    return [255, 0, Math.round(multiplier * 255)]
  }

  // Blue
  if (position >= 0.15 && position <= 0.33) {
    const multiplier = 1 - (position - 0.15) / (0.33 - 0.15)

    return [Math.round(multiplier * 255), 0, 255]
  }

  // Teal
  if (position >= 0.33 && position <= 0.49) {
    const multiplier = (position - 0.33) / (0.49 - 0.33)

    return [0, Math.round(multiplier * 255), 255]
  }

  // Green
  if (position >= 0.49 && position <= 0.67) {
    const multiplier = 1 - (position - 0.49) / (0.67 - 0.49)

    return [0, 255, Math.round(multiplier * 255)]
  }

  // Yellow
  if (position >= 0.67 && position <= 0.84) {
    const multiplier = (position - 0.67) / (0.84 - 0.67)

    return [Math.round(multiplier * 255), 255, 0]
  }

  // Orange
  if (position >= 0.84 && position <= 1) {
    const multiplier = 1 - (position - 0.84) / (1 - 0.84)

    return [255, Math.round(multiplier * 255), 0]
  }

  return [255, 0, 0]
}

export function rgbToHsv(rgb: RGB): HSV {
  const [r, g, b] = rgb
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  let v = max / 255

  const delta = max - min

  if (delta === 0) {
    // Achromatic (grayscale)
    h = 0
  } else {
    // Calculate hue
    if (max === r) {
      h = ((g - b) / delta) % 6
    } else if (max === g) {
      h = (b - r) / delta + 2
    } else {
      h = (r - g) / delta + 4
    }

    h = Math.round(h * 60)

    if (h < 0) {
      h += 360
    }
  }

  // Calculate saturation
  if (max !== 0) {
    s = delta / max
  }

  s = +(s * 100).toFixed(2)
  v = +(v * 100).toFixed(2)

  return [h, s, v]
}

export function hsvToRgb(hsv: HSV): RGB {
  const [h, s, v] = hsv
  const c = (v / 100) * (s / 100)
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v / 100 - c
  let r = 0
  let g = 0
  let b = 0

  if (h >= 0 && h < 60) {
    r = c
    g = x
  } else if (h >= 60 && h < 120) {
    r = x
    g = c
  } else if (h >= 120 && h < 180) {
    g = c
    b = x
  } else if (h >= 180 && h < 240) {
    g = x
    b = c
  } else if (h >= 240 && h < 300) {
    r = x
    b = c
  } else {
    r = c
    b = x
  }

  r = Math.round((r + m) * 255)
  g = Math.round((g + m) * 255)
  b = Math.round((b + m) * 255)

  return [r, g, b]
}
