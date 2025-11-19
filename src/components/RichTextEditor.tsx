import { useRef, useEffect } from 'react'
import { Bold, Italic, Underline, Type, Palette } from 'lucide-react'
import { Button } from './ui/button'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = 'Enter template content...',
  className = ''
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleInput()
  }

  const handleFontSize = () => {
    const size = prompt('Enter font size (e.g., 12, 14, 16, 18, 24):', '14')
    if (size) {
      execCommand('fontSize', '7') // Use size 7 as placeholder
      // Replace the font tag with span
      const fontElements = editorRef.current?.querySelectorAll('font[size="7"]')
      fontElements?.forEach(el => {
        const span = document.createElement('span')
        span.style.fontSize = `${size}px`
        span.innerHTML = el.innerHTML
        el.parentNode?.replaceChild(span, el)
      })
      handleInput()
    }
  }

  const handleColor = () => {
    const color = prompt('Enter color (e.g., #ff0000, red, rgb(255,0,0)):', '#000000')
    if (color) {
      execCommand('foreColor', color)
    }
  }

  return (
    <div className={`rich-text-editor border rounded-md ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('bold')}
          title="Bold (Ctrl+B)"
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('italic')}
          title="Italic (Ctrl+I)"
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('underline')}
          title="Underline (Ctrl+U)"
          className="h-8 w-8 p-0"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <div className="w-px h-8 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleFontSize}
          title="Font Size"
          className="h-8 w-8 p-0"
        >
          <Type className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleColor}
          title="Text Color"
          className="h-8 w-8 p-0"
        >
          <Palette className="h-4 w-4" />
        </Button>
        <div className="w-px h-8 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('justifyLeft')}
          title="Align Left"
          className="h-8 px-2 text-xs"
        >
          Left
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('justifyCenter')}
          title="Align Center"
          className="h-8 px-2 text-xs"
        >
          Center
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('justifyRight')}
          title="Align Right"
          className="h-8 px-2 text-xs"
        >
          Right
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[300px] p-4 focus:outline-none prose prose-sm max-w-none"
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      <style dangerouslySetInnerHTML={{__html: `
        .rich-text-editor [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
        
        .rich-text-editor [contenteditable]:focus {
          outline: none;
        }

        .rich-text-editor .prose {
          color: hsl(var(--foreground));
        }

        .rich-text-editor .prose strong {
          font-weight: 700;
        }

        .rich-text-editor .prose em {
          font-style: italic;
        }

        .rich-text-editor .prose u {
          text-decoration: underline;
        }
      `}} />
    </div>
  )
}
