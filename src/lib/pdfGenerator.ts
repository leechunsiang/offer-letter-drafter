import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Candidate, Template, CompanySettings } from '@/store/useStore';

export const generateOfferContent = (
  candidate: Candidate, 
  template: Template, 
  companySettings: CompanySettings
) => {
  if (candidate.customContent) {
    return candidate.customContent;
  }
  
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

  // 2. Create a temporary container for rendering
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '210mm'; // A4 width
  container.style.minHeight = '297mm'; // A4 height
  container.style.padding = '20mm'; // Margins
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#000000';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#000000';
  container.style.fontFamily = 'serif'; // Match the preview font
  container.style.boxSizing = 'border-box'; // Ensure padding is included in width/height
  
  // Add specific classes to match the preview styling if needed
  // We can also inline some styles to be safe
  
  // Construct the HTML structure
  let htmlStructure = `
    <style>
      ul {
        list-style-type: disc;
        padding-left: 1.5em;
        margin-top: 0.5em;
        margin-bottom: 0.5em;
      }
      li {
        margin-top: 0.25em;
        margin-bottom: 0.25em;
      }
    </style>
  `;
  
  // Add logo if exists
  if (companySettings.branding.logoUrl) {
    htmlStructure += `
      <div style="margin-bottom: 2rem;">
        <img 
          src="${companySettings.branding.logoUrl}" 
          alt="Company Logo" 
          style="height: 4rem; object-fit: contain;"
        />
      </div>
    `;
  }
  
  // Add content
  // We wrap it in a div with 'prose' like styles to ensure it looks good
  htmlStructure += `
    <div style="font-size: 12pt; line-height: 1.5;">
      ${content}
    </div>
  `;
  
  container.innerHTML = htmlStructure;
  document.body.appendChild(container);

  try {
    // 3. Capture the container using html2canvas
    const canvas = await html2canvas(container, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Allow loading cross-origin images (like logos)
      logging: false,
      windowWidth: container.scrollWidth,
      windowHeight: container.scrollHeight
    });

    // 4. Generate PDF from canvas
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add subsequent pages if content overflows
    // Use a small epsilon (1mm) to avoid blank pages due to rounding errors
    while (heightLeft > 1) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // 5. Save PDF
    const filename = `Offer_Letter_${candidate.name.replace(/\s+/g, '_')}.pdf`;
    pdf.save(filename);

  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please check the console for details.');
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
};
