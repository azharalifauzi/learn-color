import { useEffect, useRef, useState } from 'react'
import { RGB, getHue, getRgbFromCanvas, hsvToRgb, rgbToHsv } from './helper'

interface ColorPickerProps {
  color?: [number, number, number]
  onChange?: (color: [number, number, number]) => void
}

const CANVAS_WIDTH = 288
const CANVAS_HEIGHT = 256

const ColorPicker: React.FC<ColorPickerProps> = ({ onChange, color }) => {
  const [localColor, setLocalColor] = useState<RGB>([255, 255, 255])
  const [hue, setHue] = useState<RGB>([255, 0, 0])
  const [hueSelectorX, setHueSelectorX] = useState(0)
  const [colorSelector, setColorSelector] = useState({ x: 0, y: 0 })
  const [isMouseDownMain, setMouseDownMain] = useState(false)
  const [isMouseDownHue, setMouseDownHue] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hueCanvasRef = useRef<HTMLCanvasElement>(null)
  const hueSelectorRef = useRef<HTMLDivElement>(null)
  const colorSelectorRef = useRef<HTMLDivElement>(null)

  const firstTime = useRef(true)

  useEffect(() => {
    if (color && firstTime.current) {
      setLocalColor(color)

      const hsv = rgbToHsv(color)

      setColorSelector({
        x: (hsv[1] / 100) * CANVAS_WIDTH,
        y: (1 - hsv[2] / 100) * CANVAS_HEIGHT
      })

      setHueSelectorX((1 - hsv[0] / 360) * CANVAS_WIDTH)
      setHue(hsvToRgb([hsv[0], 100, 100]))

      firstTime.current = false
    }
  }, [color])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d', { willReadFrequently: true })

    /**
     * Main color picker
     */
    function drawMainColor() {
      if (canvas && ctx) {
        ctx.fillStyle = `rgb(${hue[0]}, ${hue[1]}, ${hue[2]})`
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const whiteGradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
        whiteGradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
        whiteGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

        ctx.fillStyle = whiteGradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const blackGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
        blackGradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
        blackGradient.addColorStop(1, 'rgba(0, 0, 0, 1)')

        ctx.fillStyle = blackGradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }

    drawMainColor()

    const hueCanvas = hueCanvasRef.current
    const hueCtx = hueCanvas?.getContext('2d', { willReadFrequently: true })

    /**
     * Hue color
     */
    function drawHue() {
      if (hueCanvas && hueCtx) {
        const gradient = hueCtx.createLinearGradient(0, 0, hueCanvas.width, 0)
        // Red
        gradient.addColorStop(0, 'rgb(255, 0, 0)')
        // Purple
        gradient.addColorStop(0.15, 'rgb(255, 0, 255)')
        // Blue
        gradient.addColorStop(0.33, 'rgb(0, 0, 255)')
        // Teal
        gradient.addColorStop(0.49, 'rgb(0, 255, 255)')
        // Green
        gradient.addColorStop(0.67, 'rgb(0, 255, 0)')
        // Yellow
        gradient.addColorStop(0.84, 'rgb(255, 255, 0)')
        // Orange
        gradient.addColorStop(1, 'rgb(255, 0, 0)')

        hueCtx.fillStyle = gradient
        hueCtx.fillRect(0, 0, hueCanvas.width, hueCanvas.height)
      }
    }

    drawHue()

    function updateHueSelectorCoord(e: MouseEvent) {
      if (hueCanvas && hueCtx && ctx && canvas) {
        // Center of circle
        const minX = 0
        const maxX = hueCanvas.width

        let localX = e.clientX - (hueSelectorEl?.parentElement?.offsetLeft ?? 0)

        localX = Math.min(maxX, localX)
        localX = localX < minX ? minX : localX

        setHueSelectorX(localX)
        const hue = getHue(localX, canvas.width)
        const color = getRgbFromCanvas(
          hue,
          colorSelector.x,
          colorSelector.y,
          canvas.width,
          canvas.height
        )

        setLocalColor([color[0], color[1], color[2]])
        setHue(hue)
        drawMainColor()

        if (onChange) {
          onChange([color[0], color[1], color[2]])
        }
      }
    }

    function updateColorSelectorCoord(e: MouseEvent) {
      let localX =
        e.clientX - (colorSelectorRef.current?.parentElement?.offsetLeft ?? 0)
      let localY =
        e.clientY - (colorSelectorRef.current?.parentElement?.offsetTop ?? 0)

      if (canvas && ctx) {
        const minX = 0
        const maxX = canvas.width
        const minY = 0
        const maxY = canvas.height

        localX = Math.min(maxX, localX)
        localY = Math.min(maxY, localY)

        localX = localX < minX ? minX : localX
        localY = localY < minY ? minY : localY

        setColorSelector({ x: localX, y: localY })
        const [r, g, b] = getRgbFromCanvas(
          hue,
          localX,
          localY,
          canvas.width,
          canvas.height
        )

        setLocalColor([r, g, b])

        if (onChange) {
          onChange([r, g, b])
        }
      }
    }

    function handleMouseDownMain(e: MouseEvent) {
      setMouseDownMain(true)
      updateColorSelectorCoord(e)
    }

    function handleMouseMoveMain(e: MouseEvent) {
      if (isMouseDownMain) {
        updateColorSelectorCoord(e)
      }
    }

    function handleMouseUpMain() {
      setMouseDownMain(false)
    }

    function handleMouseDownHue(e: MouseEvent) {
      setMouseDownHue(true)
      updateHueSelectorCoord(e)
    }

    function handleMouseMoveHue(e: MouseEvent) {
      if (isMouseDownHue) {
        updateHueSelectorCoord(e)
      }
    }

    function handleMouseUpHue() {
      setMouseDownHue(false)
    }

    const hueSelectorEl = hueSelectorRef.current
    const mainSelectorEl = colorSelectorRef.current

    if (canvas && mainSelectorEl) {
      canvas.addEventListener('mousedown', handleMouseDownMain)
      mainSelectorEl.addEventListener('mousedown', handleMouseDownMain)
    }

    if (hueSelectorEl && hueCanvas) {
      hueSelectorEl.addEventListener('mousedown', handleMouseDownHue)
      hueCanvas.addEventListener('mousedown', handleMouseDownHue)
    }

    document.addEventListener('mousemove', handleMouseMoveHue)
    document.addEventListener('mousemove', handleMouseMoveMain)
    document.addEventListener('mouseup', handleMouseUpHue)
    document.addEventListener('mouseup', handleMouseUpMain)

    return () => {
      hueSelectorEl?.removeEventListener('mousedown', handleMouseDownHue)
      hueCanvas?.removeEventListener('mousedown', handleMouseDownHue)
      canvas?.removeEventListener('mousedown', handleMouseDownMain)
      mainSelectorEl?.removeEventListener('mousedown', handleMouseDownMain)
      document.removeEventListener('mousemove', handleMouseMoveHue)
      document.removeEventListener('mousemove', handleMouseMoveMain)
      document.removeEventListener('mouseup', handleMouseUpHue)
      document.removeEventListener('mouseup', handleMouseUpMain)
    }
  }, [colorSelector, isMouseDownMain, hue, isMouseDownHue, onChange])

  return (
    <div className="w-72 select-none">
      <div className="relative mb-4">
        <div
          ref={colorSelectorRef}
          style={{
            top: colorSelector.y,
            left: colorSelector.x,
            transform: 'translate(-50%, -50%)',
            background: `rgb(${localColor[0]}, ${localColor[1]}, ${localColor[2]})`
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
      <div className="h-3 rounded-full relative">
        <div
          ref={hueSelectorRef}
          style={{
            top: '50%',
            left: hueSelectorX,
            transform: 'translate(-50%, -50%)'
          }}
          className="absolute w-4 h-4 bg-white rounded-full shadow-md"
        />
        <div className="h-full rounded-full overflow-hidden">
          <canvas
            width={CANVAS_WIDTH}
            height="16"
            className="w-full h-4"
            ref={hueCanvasRef}
          />
        </div>
      </div>
      <div className="mt-4 text-sm">
        rgb({localColor[0]}, {localColor[1]}, {localColor[2]})
      </div>
    </div>
  )
}

export default ColorPicker
