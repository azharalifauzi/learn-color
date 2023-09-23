import { createContext, useContext } from "react";
import { Coordinate, HSV, RGB } from "./types";

interface ColorPickerContextProps {
  hueSelectorX: number;
  colorSelector: Coordinate;
  hsv: HSV;
  rgb: RGB;
  onChangeColorSelector?: (coord: Coordinate) => void;
  onChangeMainColor?: (hsv: HSV) => void;
  onHueChange?: (hsv: HSV, coordX: number) => void;
  onChangeInput?: (hsv: HSV, rgb: RGB) => void;
}

export const ColorPickerContext = createContext<ColorPickerContextProps>({
  hueSelectorX: 0,
  colorSelector: { x: 0, y: 0 },
  hsv: [0, 0, 100],
  rgb: [255, 255, 255],
});

export const useColor = () => useContext(ColorPickerContext);
