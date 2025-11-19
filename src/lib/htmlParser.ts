/**
 * HTML Parser for PDF Generation
 * Parses HTML content from Quill editor and extracts text with formatting
 */

export interface TextSegment {
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  fontSize?: number
  color?: string
  align?: 'left' | 'center' | 'right'
}

export interface ParsedLine {
  segments: TextSegment[]
  align?: 'left' | 'center' | 'right'
}

/**
 * Parse HTML content and extract formatted text segments
 */
export function parseHTMLContent(html: string): ParsedLine[] {
  // If content is plain text (no HTML tags), wrap in paragraph
  if (!html.includes('<')) {
    return html.split('\n').map(line => ({
      segments: [{ text: line || ' ' }]
    }))
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const lines: ParsedLine[] = []

  // Process each paragraph
  const paragraphs = doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6')
  
  if (paragraphs.length === 0) {
    // No paragraphs found, treat as single line
    const segments = parseNode(doc.body)
    if (segments.length > 0) {
      lines.push({ segments })
    }
  } else {
    paragraphs.forEach(p => {
      const segments = parseNode(p)
      const align = getAlignment(p as HTMLElement)
      
      if (segments.length > 0) {
        lines.push({ segments, align })
      } else {
        // Empty paragraph - add blank line
        lines.push({ segments: [{ text: ' ' }] })
      }
    })
  }

  return lines.length > 0 ? lines : [{ segments: [{ text: ' ' }] }]
}

/**
 * Parse a DOM node and extract text segments with formatting
 */
function parseNode(node: Node): TextSegment[] {
  const segments: TextSegment[] = []

  function traverse(n: Node, inherited: Partial<TextSegment> = {}) {
    if (n.nodeType === Node.TEXT_NODE) {
      const text = n.textContent || ''
      if (text) {
        segments.push({ text, ...inherited })
      }
    } else if (n.nodeType === Node.ELEMENT_NODE) {
      const element = n as HTMLElement
      const tagName = element.tagName.toLowerCase()
      
      // Build formatting for this element
      const formatting: Partial<TextSegment> = { ...inherited }

      // Text formatting
      if (tagName === 'strong' || tagName === 'b') {
        formatting.bold = true
      }
      if (tagName === 'em' || tagName === 'i') {
        formatting.italic = true
      }
      if (tagName === 'u') {
        formatting.underline = true
      }

      // Font size from Quill classes
      if (element.classList.contains('ql-size-small')) {
        formatting.fontSize = 10
      } else if (element.classList.contains('ql-size-large')) {
        formatting.fontSize = 16
      } else if (element.classList.contains('ql-size-huge')) {
        formatting.fontSize = 20
      }

      // Inline styles
      const style = element.getAttribute('style')
      if (style) {
        // Font size
        const fontSizeMatch = style.match(/font-size:\s*(\d+)px/)
        if (fontSizeMatch) {
          formatting.fontSize = parseInt(fontSizeMatch[1])
        }

        // Color
        const colorMatch = style.match(/color:\s*(#[0-9a-fA-F]{6}|rgb\([^)]+\))/)
        if (colorMatch) {
          formatting.color = colorMatch[1]
        }
      }

      // Color from Quill classes
      const colorClass = Array.from(element.classList).find(c => c.startsWith('ql-color-'))
      if (colorClass) {
        const color = colorClass.replace('ql-color-', '#')
        formatting.color = color
      }

      // Traverse children
      n.childNodes.forEach(child => traverse(child, formatting))
    }
  }

  traverse(node)
  return segments
}

/**
 * Get text alignment from element
 */
function getAlignment(element: HTMLElement): 'left' | 'center' | 'right' | undefined {
  // Check Quill alignment classes
  if (element.classList.contains('ql-align-center')) {
    return 'center'
  }
  if (element.classList.contains('ql-align-right')) {
    return 'right'
  }
  
  // Check inline styles
  const style = element.getAttribute('style')
  if (style) {
    if (style.includes('text-align: center')) {
      return 'center'
    }
    if (style.includes('text-align: right')) {
      return 'right'
    }
  }

  return 'left'
}

/**
 * Convert CSS color to RGB values for jsPDF
 */
export function parseColor(color: string): { r: number; g: number; b: number } {
  // Default to black
  const defaultColor = { r: 0, g: 0, b: 0 }

  if (!color) return defaultColor

  // Hex color
  if (color.startsWith('#')) {
    const hex = color.substring(1)
    if (hex.length === 6) {
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16)
      }
    }
  }

  // RGB color
  if (color.startsWith('rgb')) {
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3])
      }
    }
  }

  return defaultColor
}
