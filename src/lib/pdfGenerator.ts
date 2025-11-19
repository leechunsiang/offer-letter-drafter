import jsPDF from 'jspdf';
import { Candidate, Template, CompanySettings } from '@/store/useStore';

export const generateOfferContent = (
  candidate: Candidate, 
  template: Template, 
  companySettings: CompanySettings
) => {
  return template.content
    .replace(/{{name}}/g, candidate.name)
    .replace(/{{role}}/g, candidate.role)
    .replace(/{{offerDate}}/g, candidate.offerDate)
    .replace(/{{companyName}}/g, companySettings.info.name)
    .replace(/{{companyAddress}}/g, companySettings.info.address)
    .replace(/{{companyWebsite}}/g, companySettings.info.website)
    .replace(/{{companyPhone}}/g, companySettings.info.phone)
    .replace(/{{senderName}}/g, companySettings.emailConfig.senderName)
    .replace(/{{senderEmail}}/g, companySettings.emailConfig.senderEmail);
};



export const generateOfferPDF = async (
  candidate: Candidate, 
  template: Template, 
  companySettings: CompanySettings
) => {
  // 1. Substitute variables
  const content = generateOfferContent(candidate, template, companySettings);

  // 2. Create PDF with text (not image)
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  
  // Set font
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  
  let yPosition = margin;

  // Add logo if exists
  // Add logo if exists
  if (companySettings.branding.logoUrl) {
    console.log("PDF Generator: Found logo URL in settings. Length:", companySettings.branding.logoUrl.length);
    console.log("PDF Generator: Logo URL start:", companySettings.branding.logoUrl.substring(0, 50) + "...");
    try {
      const logoData = companySettings.branding.logoUrl;
      // Simple format detection
      const format = logoData.startsWith('data:image/png') ? 'PNG' : 'JPEG';
      console.log("PDF Generator: Detected logo format:", format);
      
      // Get image properties to calculate aspect ratio
      const imgProps = pdf.getImageProperties(logoData);
      const imgWidth = imgProps.width;
      const imgHeight = imgProps.height;
      const aspectRatio = imgWidth / imgHeight;

      // Define maximum dimensions
      const maxLogoWidth = 40; // mm
      const maxLogoHeight = 20; // mm

      let finalWidth = maxLogoWidth;
      let finalHeight = maxLogoWidth / aspectRatio;

      // If height exceeds max, scale by height instead
      if (finalHeight > maxLogoHeight) {
        finalHeight = maxLogoHeight;
        finalWidth = maxLogoHeight * aspectRatio;
      }

      console.log(`PDF Generator: Original size: ${imgWidth}x${imgHeight}, Aspect Ratio: ${aspectRatio}`);
      console.log(`PDF Generator: Final dimensions: ${finalWidth.toFixed(2)}mm x ${finalHeight.toFixed(2)}mm`);
      
      // Add logo with calculated dimensions
      pdf.addImage(logoData, format, margin, margin, finalWidth, finalHeight);
      console.log("PDF Generator: Logo added to PDF at margin:", margin);
      yPosition += 30; // Move text down (20mm height + 10mm padding)
    } catch (e) {
      console.error("PDF Generator: Error adding logo to PDF:", e);
    }
  } else {
    console.log("PDF Generator: No logo URL found in company settings");
  }
  
  
  // Split content into lines and add to PDF with formatting
  const { parseHTMLContent, parseColor } = await import('./htmlParser')
  const parsedLines = parseHTMLContent(content)
  const lineHeight = 7 // mm
  
  for (const line of parsedLines) {
    // Check if we need a new page
    if (yPosition + lineHeight > pageHeight - margin) {
      pdf.addPage()
      yPosition = margin
    }

    // Handle alignment
    const align = line.align || 'left'
    let xPosition = margin

    // Calculate line width for alignment
    if (align === 'center' || align === 'right') {
      let lineWidth = 0
      for (const segment of line.segments) {
        pdf.setFont('helvetica', segment.bold ? 'bold' : segment.italic ? 'italic' : 'normal')
        pdf.setFontSize(segment.fontSize || 12)
        lineWidth += pdf.getTextWidth(segment.text)
      }

      if (align === 'center') {
        xPosition = (pageWidth - lineWidth) / 2
      } else if (align === 'right') {
        xPosition = pageWidth - margin - lineWidth
      }
    }

    // Render each segment with its formatting
    for (const segment of line.segments) {
      // Set font style
      let fontStyle = 'normal'
      if (segment.bold && segment.italic) {
        fontStyle = 'bolditalic'
      } else if (segment.bold) {
        fontStyle = 'bold'
      } else if (segment.italic) {
        fontStyle = 'italic'
      }
      pdf.setFont('helvetica', fontStyle)

      // Set font size
      pdf.setFontSize(segment.fontSize || 12)

      // Set text color
      if (segment.color) {
        const rgb = parseColor(segment.color)
        pdf.setTextColor(rgb.r, rgb.g, rgb.b)
      } else {
        pdf.setTextColor(0, 0, 0) // Reset to black
      }

      // Handle text wrapping for long segments
      const segmentText = segment.text
      const wrappedLines = pdf.splitTextToSize(segmentText, maxWidth - (xPosition - margin))

      for (let i = 0; i < wrappedLines.length; i++) {
        const wrappedLine = wrappedLines[i]

        // Check if we need a new page after wrapping
        if (yPosition + lineHeight > pageHeight - margin) {
          pdf.addPage()
          yPosition = margin
          xPosition = margin // Reset x position on new page
        }

        // Add text
        pdf.text(wrappedLine, xPosition, yPosition)

        // Add underline if needed
        if (segment.underline) {
          const textWidth = pdf.getTextWidth(wrappedLine)
          pdf.setLineWidth(0.1)
          pdf.line(xPosition, yPosition + 0.5, xPosition + textWidth, yPosition + 0.5)
        }

        // Move x position for next segment (only on same line)
        if (i === wrappedLines.length - 1) {
          xPosition += pdf.getTextWidth(wrappedLine)
        } else {
          // If wrapped to next line, move y position and reset x
          yPosition += lineHeight
          xPosition = margin
        }
      }
    }

    // Move to next line
    yPosition += lineHeight
    
    // Reset text color for next line
    pdf.setTextColor(0, 0, 0)
  }

  // 3. Save PDF
  const filename = `Offer_Letter_${candidate.name.replace(/\s+/g, '_')}.pdf`;
  console.log("PDF Generator: Saving file as:", filename);
  
  // Use jsPDF's built-in save method which handles the download correctly across browsers
  pdf.save(filename);
};
