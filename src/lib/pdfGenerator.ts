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
  
  // Split content into lines and add to PDF
  const lines = content.split('\n');
  const lineHeight = 7; // mm
  
  for (const line of lines) {
    // Check if we need a new page
    if (yPosition + lineHeight > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
    
    // Split long lines to fit within page width
    const wrappedLines = pdf.splitTextToSize(line || ' ', maxWidth);
    
    for (const wrappedLine of wrappedLines) {
      // Check again after wrapping
      if (yPosition + lineHeight > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.text(wrappedLine, margin, yPosition);
      yPosition += lineHeight;
    }
  }

  // 3. Save PDF
  const filename = `Offer_Letter_${candidate.name.replace(/\s+/g, '_')}.pdf`;
  console.log("PDF Generator: Saving file as:", filename);
  
  // Use jsPDF's built-in save method which handles the download correctly across browsers
  pdf.save(filename);
};
