import { useState, useRef, useEffect } from 'react'
import { Check } from 'lucide-react'
import { Button } from './ui/button'
import Color from 'color'
import {
  ColorPicker as ShadcnColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerAlpha,
  ColorPickerOutput,
  ColorPickerEyeDropper,
} from '@/components/ui/shadcn-io/color-picker'

interface ColorPickerProps {
  onSelect: (color: string) => void
  onClose: () => void
  currentColor?: string
}

const PRESET_COLORS = [
  '#000000', // Black
  '#4B5563', // Gray
  '#DC2626', // Red
  '#D97706', // Amber
  '#059669', // Emerald
  '#2563EB', // Blue
  '#7C3AED', // Violet
  '#DB2777', // Pink
]

export default function ColorPicker({ onSelect, onClose, currentColor }: ColorPickerProps) {
  const [color, setColor] = useState(currentColor || '#000000')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleColorChange = (value: any) => {
    // value is [r, g, b, a]
    const hex = Color.rgb(value).hex()
    setColor(hex)
  }

  const handleApply = () => {
    onSelect(color)
    onClose()
  }

  return (
    <div 
      ref={containerRef}
      className="absolute top-full left-0 mt-2 p-3 bg-popover border rounded-md shadow-md z-50 w-64 animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="grid grid-cols-4 gap-2 mb-3">
        {PRESET_COLORS.map((presetColor) => (
          <button
            key={presetColor}
            className="w-8 h-8 rounded-full border border-border hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            style={{ backgroundColor: presetColor }}
            onClick={() => {
              onSelect(presetColor)
              onClose()
            }}
            title={presetColor}
          >
            {currentColor === presetColor && (
              <Check className="w-4 h-4 text-white mx-auto drop-shadow-md" />
            )}
          </button>
        ))}
      </div>
      
      <div className="flex flex-col gap-3">
        <ShadcnColorPicker value={color} onChange={handleColorChange}>
          <ColorPickerSelection className="h-32 w-full rounded-md" />
          <ColorPickerHue />
          <ColorPickerAlpha />
          <div className="flex gap-2 items-center">
             <ColorPickerOutput className="w-full" />
             <ColorPickerEyeDropper />
          </div>
        </ShadcnColorPicker>

        <Button size="sm" onClick={handleApply} className="w-full">
          Apply
        </Button>
      </div>
    </div>
  )
}
