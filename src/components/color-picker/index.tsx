import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  drawHue,
  drawMain,
  hexToRgb,
  hsvToRgb,
  minmax,
  rgbToHex,
  rgbToHsv,
} from "./helper";
import { ColorPickerContext, useColor } from "./hooks";
import { HSV, RGB } from "./types";

interface ColorPickerProps {
  color?: [number, number, number];
  onChange?: (color: [number, number, number]) => void;
  children?: React.ReactNode;
}

const CANVAS_WIDTH = 288;
const CANVAS_HEIGHT = 256;
const HUE_WIDTH = 220;

const ColorPicker: React.FC<ColorPickerProps> = ({
  onChange,
  color,
  children,
}) => {
  const [hsv, setHsv] = useState<HSV>([0, 0, 100]);
  const [rgb, setRgb] = useState<RGB>([255, 255, 255]);
  const [hueSelectorX, setHueSelectorX] = useState(0);
  const [colorSelector, setColorSelector] = useState({ x: 0, y: 0 });

  const firstTime = useRef(true);

  useEffect(() => {
    if (color && firstTime.current) {
      const hsv = rgbToHsv(color);
      setColorSelector({
        x: (hsv[1] / 100) * CANVAS_WIDTH,
        y: (1 - hsv[2] / 100) * CANVAS_HEIGHT,
      });
      setHueSelectorX((hsv[0] / 360) * HUE_WIDTH);
      setHsv(hsv);
      setRgb(color);

      firstTime.current = false;
    }
  }, [color]);

  return (
    <ColorPickerContext.Provider
      value={{
        colorSelector,
        hueSelectorX,
        hsv,
        rgb,
        onChangeColorSelector: (coord) => setColorSelector(coord),
        onChangeMainColor: (hsv) => {
          const rgb = hsvToRgb(hsv);
          setHsv(hsv);
          setRgb(rgb);

          if (onChange) {
            onChange(rgb);
          }
        },
        onHueChange: (hsv, coordX) => {
          setHsv(hsv);
          setHueSelectorX(coordX);

          const rgb = hsvToRgb(hsv);
          setRgb(rgb);

          if (onChange) {
            onChange(rgb);
          }
        },
        onChangeInput: (hsv, rgb) => {
          const [h, s, v] = hsv;

          setColorSelector({
            x: (s / 100) * CANVAS_WIDTH,
            y: (1 - v / 100) * CANVAS_HEIGHT,
          });
          setHueSelectorX((h / 360) * HUE_WIDTH);
          setHsv(hsv);
          setRgb(rgb);

          if (onChange) {
            onChange(rgb);
          }
        },
      }}
    >
      <div className="w-72 select-none">{children}</div>
    </ColorPickerContext.Provider>
  );
};

export const Main = () => {
  const { colorSelector, onChangeColorSelector, onChangeMainColor, hsv } =
    useColor();

  const [isMouseDown, setMouseDown] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorSelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas) {
      drawMain(canvas, hsvToRgb([hsv[0], 100, 100]));
    }
  }, [hsv, colorSelector]);

  useEffect(
    function colorSelectorInteraction() {
      const mainSelectorEl = colorSelectorRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d", { willReadFrequently: true });

      function updateColorSelectorCoord(e: MouseEvent) {
        let localX =
          e.clientX -
          (colorSelectorRef.current?.parentElement?.offsetLeft ?? 0);
        let localY =
          e.clientY - (colorSelectorRef.current?.parentElement?.offsetTop ?? 0);

        if (canvas && ctx) {
          localX = minmax(localX, 0, canvas.width);
          localY = minmax(localY, 0, canvas.height);

          if (onChangeColorSelector) {
            onChangeColorSelector({ x: localX, y: localY });
          }

          const s = Math.round((localX / canvas.width) * 100);
          const v = Math.round(100 - (localY / canvas.height) * 100);

          if (onChangeMainColor) {
            onChangeMainColor([hsv[0], s, v]);
          }
        }
      }

      function handleMouseDownMain(e: MouseEvent) {
        setMouseDown(true);
        updateColorSelectorCoord(e);
      }

      function handleMouseMoveMain(e: MouseEvent) {
        if (isMouseDown) {
          updateColorSelectorCoord(e);
        }
      }

      function handleMouseUpMain() {
        setMouseDown(false);
      }

      if (canvas && mainSelectorEl) {
        canvas.addEventListener("mousedown", handleMouseDownMain);
        mainSelectorEl.addEventListener("mousedown", handleMouseDownMain);
      }

      document.addEventListener("mousemove", handleMouseMoveMain);
      document.addEventListener("mouseup", handleMouseUpMain);

      return () => {
        canvas?.removeEventListener("mousedown", handleMouseDownMain);
        mainSelectorEl?.removeEventListener("mousedown", handleMouseDownMain);
        document.removeEventListener("mousemove", handleMouseMoveMain);
        document.removeEventListener("mouseup", handleMouseUpMain);
      };
    },
    [hsv, isMouseDown]
  );

  const rgb = useMemo(() => {
    return hsvToRgb(hsv);
  }, [hsv]);

  return (
    <div className="relative mb-4">
      <div
        ref={colorSelectorRef}
        style={{
          top: colorSelector.y,
          left: colorSelector.x,
          transform: "translate(-50%, -50%)",
          background: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
        }}
        className="absolute w-3.5 h-3.5 border-2 border-white rounded-full"
      />
      <canvas
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-64"
        ref={canvasRef}
      />
    </div>
  );
};

export const Hue = () => {
  const { hueSelectorX, onHueChange, hsv } = useColor();
  const [isMouseDown, setMouseDown] = useState(false);

  const hueCanvasRef = useRef<HTMLCanvasElement>(null);
  const hueSelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = hueCanvasRef.current;

    if (canvas) {
      drawHue(canvas);
    }
  }, []);

  useEffect(
    function hueSelectorInteraction() {
      const canvas = hueCanvasRef.current;
      const ctx = canvas?.getContext("2d", { willReadFrequently: true });
      const hueSelectorEl = hueSelectorRef.current;

      function updateHueSelectorCoord(e: MouseEvent) {
        if (canvas && ctx) {
          let localX =
            e.clientX - (hueSelectorEl?.parentElement?.offsetLeft ?? 0);
          localX = minmax(localX, 0, canvas.width);

          const h = Math.round((localX / canvas.width) * 360);

          if (onHueChange) {
            onHueChange([h, hsv[1], hsv[2]], localX);
          }
        }
      }

      function handleMouseDownHue(e: MouseEvent) {
        setMouseDown(true);
        updateHueSelectorCoord(e);
      }

      function handleMouseMoveHue(e: MouseEvent) {
        if (isMouseDown) {
          updateHueSelectorCoord(e);
        }
      }

      function handleMouseUpHue() {
        setMouseDown(false);
      }

      if (hueSelectorEl && canvas) {
        hueSelectorEl.addEventListener("mousedown", handleMouseDownHue);
        canvas.addEventListener("mousedown", handleMouseDownHue);
      }

      document.addEventListener("mousemove", handleMouseMoveHue);
      document.addEventListener("mouseup", handleMouseUpHue);

      return () => {
        hueSelectorEl?.removeEventListener("mousedown", handleMouseDownHue);
        canvas?.removeEventListener("mousedown", handleMouseDownHue);
        document.removeEventListener("mousemove", handleMouseMoveHue);
        document.removeEventListener("mouseup", handleMouseUpHue);
      };
    },
    [isMouseDown, hsv]
  );

  return (
    <div
      style={{ width: HUE_WIDTH }}
      className="h-3 rounded-full relative mb-4 ml-auto mr-2"
    >
      <div
        ref={hueSelectorRef}
        style={{
          top: "50%",
          left: hueSelectorX,
          transform: "translate(-50%, -50%)",
        }}
        className="absolute w-4 h-4 bg-white rounded-full shadow-md"
      />
      <div className="h-full rounded-full overflow-hidden">
        <canvas
          width={HUE_WIDTH}
          height="16"
          className="w-full h-4"
          ref={hueCanvasRef}
        />
      </div>
    </div>
  );
};

export const Input = () => {
  const { onChangeInput, hsv, rgb } = useColor();

  const [mode, setMode] = useState<"hex" | "rgb" | "hsv">("hex");
  const [localHex, setLocalHex] = useState("#ffffff");
  const [isEditHex, setEditHex] = useState(false);

  const hex = useMemo(() => {
    return rgbToHex(rgb);
  }, [rgb]);

  const handleChangeRgb = (value: string, index: 0 | 1 | 2) => {
    let valueAsNum = parseInt(value || "0");
    valueAsNum = isNaN(valueAsNum) ? 255 : valueAsNum;
    valueAsNum = minmax(valueAsNum, 0, 255);

    const newRgb: RGB = hsvToRgb(hsv);
    newRgb[index] = valueAsNum;

    if (onChangeInput) {
      onChangeInput(rgbToHsv(newRgb), newRgb);
    }
  };

  const handleChangeHsv = (value: string, index: 0 | 1 | 2) => {
    let valueAsNum = parseInt(value || "0");
    valueAsNum = isNaN(valueAsNum) ? 255 : valueAsNum;

    if (index === 0) {
      valueAsNum = minmax(valueAsNum, 0, 360);
    } else {
      valueAsNum = minmax(valueAsNum, 0, 100);
    }

    const newHsv: HSV = [...hsv];
    newHsv[index] = valueAsNum;

    if (onChangeInput) {
      onChangeInput(newHsv, hsvToRgb(newHsv));
    }
  };

  const handleFinishChangeHex = () => {
    setEditHex(false);
    const rgb = hexToRgb(localHex);

    if (onChangeInput) {
      if (rgb) {
        onChangeInput(rgbToHsv(rgb), rgb);
      } else {
        const fallbackHsv: HSV = [hsv[0], 100, 100];
        onChangeInput(fallbackHsv, hsvToRgb(fallbackHsv));
      }
    }
  };

  function renderInput() {
    if (mode === "rgb") {
      return (
        <div className="grid grid-cols-3 items-center gap-1 w-40">
          <input
            value={rgb[0]}
            onChange={(e) => handleChangeRgb(e.target.value, 0)}
            className="w-full outline-none border border-gray-200 px-2 py-1.5 text-xs"
          />
          <input
            value={rgb[1]}
            onChange={(e) => handleChangeRgb(e.target.value, 1)}
            className="w-full outline-none border border-gray-200 px-2 py-1.5 text-xs"
          />
          <input
            value={rgb[2]}
            onChange={(e) => handleChangeRgb(e.target.value, 2)}
            className="w-full outline-none border border-gray-200 px-2 py-1.5 text-xs"
          />
        </div>
      );
    }

    if (mode === "hex") {
      return (
        <div className="w-40">
          <input
            value={isEditHex ? localHex : hex.substring(1).toUpperCase()}
            className="w-full outline-none border border-gray-200 px-2 py-1.5 text-xs"
            onFocus={() => {
              setEditHex(true);
              setLocalHex(hex.substring(1).toUpperCase());
            }}
            onChange={(e) => {
              setLocalHex(e.target.value);
            }}
            onBlur={handleFinishChangeHex}
          />
        </div>
      );
    }

    if (mode === "hsv") {
      return (
        <div className="grid grid-cols-3 items-center gap-1 w-40">
          <input
            value={hsv[0]}
            onChange={(e) => handleChangeHsv(e.target.value, 0)}
            className="w-full outline-none border border-gray-200 px-2 py-1.5 text-xs"
          />
          <input
            value={hsv[1].toFixed(0)}
            onChange={(e) => handleChangeHsv(e.target.value, 1)}
            className="w-full outline-none border border-gray-200 px-2 py-1.5 text-xs"
          />
          <input
            value={hsv[2].toFixed(0)}
            onChange={(e) => handleChangeHsv(e.target.value, 2)}
            className="w-full outline-none border border-gray-200 px-2 py-1.5 text-xs"
          />
        </div>
      );
    }

    return null;
  }

  return (
    <div className="flex items-center justify-end gap-2 px-2">
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value as "hex" | "rgb" | "hsv")}
        className="text-sm bg-transparent hover:outline hover:outline-1 outline-gray-200 py-1 w-16 px-1"
      >
        <option value="hex">Hex</option>
        <option value="rgb">RGB</option>
        <option value="hsv">HSV</option>
      </select>
      {renderInput()}
    </div>
  );
};

export default ColorPicker;
