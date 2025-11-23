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
  isLineBreak?: boolean // New flag to indicate forced line break
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
  
  // Flatten the DOM into a list of segments, respecting block elements
  const allSegments = parseNode(doc.body)
  
  // Group segments into lines
  const lines: ParsedLine[] = []
  let currentLineSegments: TextSegment[] = []
  let currentLineAlign: 'left' | 'center' | 'right' | undefined = undefined

  allSegments.forEach((segment, index) => {
    if (segment.isLineBreak) {
      // If we have accumulated segments, push them as a line
      if (currentLineSegments.length > 0) {
        lines.push({ 
          segments: currentLineSegments, 
          align: currentLineAlign 
        })
        currentLineSegments = []
        currentLineAlign = undefined
      } else if (lines.length > 0 || index > 0) {
        // If no segments but we hit a break (and it's not the very first thing), 
        // it means an empty line (like <br> or empty <p>)
        // But we only want to add an empty line if the previous line wasn't just created by a block end
        // This logic can be tricky. Let's simplify:
        // A line break segment means "finish current line and start new one".
        // If current line is empty, it effectively adds a vertical gap.
        lines.push({ segments: [{ text: ' ' }] })
      }
    } else {
      // It's a text segment
      currentLineSegments.push(segment)
      // Update alignment if not set (first segment usually dictates alignment)
      if (!currentLineAlign && segment.align) {
        currentLineAlign = segment.align
      }
    }
  })

  // Push any remaining segments
  if (currentLineSegments.length > 0) {
    lines.push({ 
      segments: currentLineSegments, 
      align: currentLineAlign 
    })
  }

  return lines.length > 0 ? lines : [{ segments: [{ text: ' ' }] }]
}

/**
 * Parse a DOM node and extract text segments with formatting
 */
function parseNode(node: Node, inherited: Partial<TextSegment> = {}): TextSegment[] {
  const segments: TextSegment[] = []

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || ''
    // Only add non-empty text or text that isn't just whitespace (unless it's significant?)
    // For now, let's keep all text but maybe trim newlines if they are just source code formatting
    if (text) {
      segments.push({ text, ...inherited })
    }
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement
    const tagName = element.tagName.toLowerCase()
    
    // Block elements that should trigger a new line BEFORE and AFTER
    const isBlock = ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'ul', 'ol'].includes(tagName)
    const isLineBreak = tagName === 'br'

    // If it's a block element, we might want to ensure we are on a new line
    if (isBlock) {
      segments.push({ text: '', isLineBreak: true })
    }

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

    // Headers
    if (['h1', 'h2', 'h3'].includes(tagName)) {
      formatting.bold = true
      formatting.fontSize = tagName === 'h1' ? 24 : tagName === 'h2' ? 20 : 16
    }
    if (['h4', 'h5', 'h6'].includes(tagName)) {
      formatting.bold = true
      formatting.fontSize = 14
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

    // Alignment
    const align = getAlignment(element)
    if (align) {
      formatting.align = align
    }

    if (isLineBreak) {
      segments.push({ text: '', isLineBreak: true })
    } else {
      // Traverse children
      node.childNodes.forEach(child => {
        segments.push(...parseNode(child, formatting))
      })
    }

    // If it's a block element, ensure we end the line
    if (isBlock) {
      segments.push({ text: '', isLineBreak: true })
    }
  }

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

  return undefined
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
