import { useState } from "react";
import ColorPicker, { Hue, Input, Main } from "./components/color-picker";
import { RGB } from "./components/color-picker/types";

function App() {
  const [color, setColor] = useState<RGB>([255, 2, 0]);

  return (
    <div className="p-10 bg-gray-200">
      <div className="mb-4">Color Picker Project</div>
      <div className="bg-white w-fit pb-4">
        <ColorPicker color={color} onChange={(rgb) => setColor(rgb)}>
          <Main />
          <Hue />
          <Input />
        </ColorPicker>
      </div>
    </div>
  );
}

export default App;
