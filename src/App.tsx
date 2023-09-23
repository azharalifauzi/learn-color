import { useState } from 'react'
import ColorPicker from './components/color-picker'
import { RGB } from './components/color-picker/helper'

function App() {
  const [color, setColor] = useState<RGB>([255, 0, 255])

  return (
    <div className="p-10 bg-gray-200">
      <div className="mb-4">Color Picker Project</div>
      <ColorPicker color={color} onChange={(rgb) => setColor(rgb)} />
    </div>
  )
}

export default App
