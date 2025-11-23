import { useState, useRef, useEffect } from 'react'
import { Check } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

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
  const [customColor, setCustomColor] = useState(currentColor || '')
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

  const handleCustomColorSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (customColor) {
      onSelect(customColor)
      onClose()
    }
  }

  return (
    <div 
      ref={containerRef}
      className="absolute top-full left-0 mt-2 p-3 bg-popover border rounded-md shadow-md z-50 w-64 animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="grid grid-cols-4 gap-2 mb-3">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            className="w-8 h-8 rounded-full border border-border hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            style={{ backgroundColor: color }}
            onClick={() => {
              onSelect(color)
              onClose()
            }}
            title={color}
          >
            {currentColor === color && (
              <Check className="w-4 h-4 text-white mx-auto drop-shadow-md" />
            )}
          </button>
        ))}
      </div>
      
      <form onSubmit={handleCustomColorSubmit} className="flex flex-col gap-2">
        <Label htmlFor="custom-color" className="text-xs">Custom Hex</Label>
        <div className="flex gap-2">
          <Input
            id="custom-color"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            placeholder="#000000"
            className="h-8 text-xs"
          />
          <Button type="submit" size="sm" className="h-8 px-2">
            Apply
          </Button>
        </div>
      </form>
    </div>
  )
}
