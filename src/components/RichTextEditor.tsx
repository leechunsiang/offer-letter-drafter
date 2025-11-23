import { useRef, useEffect, useState } from 'react'
import { Bold, Italic, Underline, Type, Palette, AlignJustify, List } from 'lucide-react'
import { Button } from './ui/button'
import ColorPicker from './ColorPicker'

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
  const selectionRange = useRef<Range | null>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)

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

  const insertVariable = (variable: string) => {
    if (editorRef.current) {
      editorRef.current.focus()
      const selection = window.getSelection()
      const range = selection?.getRangeAt(0)
      
      if (range) {
        const textNode = document.createTextNode(`{{${variable}}}`)
        range.insertNode(textNode)
        
        // Move cursor after inserted text
        range.setStartAfter(textNode)
        range.setEndAfter(textNode)
        selection?.removeAllRanges()
        selection?.addRange(range)
      } else {
        // If no selection, append to end
        editorRef.current.innerHTML += `{{${variable}}}`
      }
      
      handleInput()
    }
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

  const saveSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      selectionRange.current = selection.getRangeAt(0)
    }
  }

  const restoreSelection = () => {
    const selection = window.getSelection()
    if (selection && selectionRange.current) {
      selection.removeAllRanges()
      selection.addRange(selectionRange.current)
    }
  }

  const handleColorSelect = (color: string) => {
    restoreSelection()
    execCommand('foreColor', color)
    setShowColorPicker(false)
  }

  const variables = [
    { label: 'Name', value: 'name' },
    { label: 'Role', value: 'role' },
    { label: 'Offer Date', value: 'offerDate' },
    { label: 'Company Name', value: 'companyName' },
    { label: 'Company Address', value: 'companyAddress' },
    { label: 'Company Website', value: 'companyWebsite' },
    { label: 'Company Phone', value: 'companyPhone' },
    { label: 'Sender Name', value: 'senderName' },
    { label: 'Sender Email', value: 'senderEmail' },
  ]

  return (
    <div className={`rich-text-editor border rounded-md flex flex-col min-h-0 overflow-hidden h-full ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-col gap-2 p-2 border-b bg-muted/50">
        {/* Formatting Toolbar */}
        <div className="flex flex-wrap gap-1">
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
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (!showColorPicker) {
                  saveSelection()
                }
                setShowColorPicker(!showColorPicker)
              }}
              title="Text Color"
              className={`h-8 w-8 p-0 ${showColorPicker ? 'bg-muted' : ''}`}
            >
              <Palette className="h-4 w-4" />
            </Button>
            {showColorPicker && (
              <ColorPicker
                onSelect={handleColorSelect}
                onClose={() => setShowColorPicker(false)}
              />
            )}
          </div>
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
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand('justifyFull')}
            title="Justify Full"
            className="h-8 w-8 p-0"
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
          <div className="w-px h-8 bg-border mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand('insertUnorderedList')}
            title="Bullet List"
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        {/* Variables Toolbar */}
        <div className="flex flex-wrap gap-1 pt-2 border-t">
          <span className="text-xs text-muted-foreground self-center mr-2">Insert Variable:</span>
          {variables.map((variable) => (
            <Button
              key={variable.value}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertVariable(variable.value)}
              title={`Insert {{${variable.value}}}`}
              className="h-7 px-2 text-xs"
            >
              {variable.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="flex-1 overflow-y-auto p-4 focus:outline-none prose prose-sm max-w-none"
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

        .rich-text-editor .prose ul {
          list-style-type: disc;
          padding-left: 1.5em;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }

        .rich-text-editor .prose li {
          margin-top: 0.25em;
          margin-bottom: 0.25em;
        }
      `}} />
    </div>
  )
}
