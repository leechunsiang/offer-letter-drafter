/**
 * HTML Parser for PDF Generation
 * Parses HTML content from Quill editor and extracts text with formatting
 */
export interface TextSegment {
    text: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    fontSize?: number;
    color?: string;
    align?: 'left' | 'center' | 'right';
    isLineBreak?: boolean;
}
export interface ParsedLine {
    segments: TextSegment[];
    align?: 'left' | 'center' | 'right';
}
/**
 * Parse HTML content and extract formatted text segments
 */
export declare function parseHTMLContent(html: string): ParsedLine[];
/**
 * Convert CSS color to RGB values for jsPDF
 */
export declare function parseColor(color: string): {
    r: number;
    g: number;
    b: number;
};
