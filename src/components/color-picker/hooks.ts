import { createContext, useContext } from "react";
import { Coordinate, HSV, RGB } from "./types";

interface ColorPickerContextProps {
  hueAsRgb: RGB;
  color: RGB;
  hueSelectorX: number;
  colorSelector: Coordinate;
  onChangeColorSelector?: (coord: Coordinate) => void;
  onChangeMainColor?: (color: RGB) => void;
  onHueChange?: (hueAsRgb: RGB, coordX: number) => void;
  onChangeInput?: (hsv: HSV, rgb: RGB) => void;
}

export const ColorPickerContext = createContext<ColorPickerContextProps>({
  hueAsRgb: [255, 0, 0],
  color: [255, 255, 255],
  hueSelectorX: 0,
  colorSelector: { x: 0, y: 0 },
});

export const useColor = () => useContext(ColorPickerContext);
