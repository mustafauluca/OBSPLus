import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportElementToPdf(
  elementId: string,
  filename: string,
  options: {
    orientation?: 'portrait' | 'landscape';
    format?: string | [number, number];
  } = {}
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found for PDF export.`);
    window.print();
    return false;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: null,
    });

    const imgData = canvas.toDataURL('image/png');
    const orientation = options.orientation || (canvas.width > canvas.height ? 'landscape' : 'portrait');
    
    // Create PDF with element aspect ratio
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: options.format || 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Scale image to fit page with neat margin
    const margin = 10;
    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - margin * 2;

    const imgRatio = canvas.width / canvas.height;
    let renderWidth = availableWidth;
    let renderHeight = renderWidth / imgRatio;

    if (renderHeight > availableHeight) {
      renderHeight = availableHeight;
      renderWidth = renderHeight * imgRatio;
    }

    const xPos = margin + (availableWidth - renderWidth) / 2;
    const yPos = margin + (availableHeight - renderHeight) / 2;

    pdf.addImage(imgData, 'PNG', xPos, yPos, renderWidth, renderHeight, undefined, 'FAST');
    pdf.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('HTML to PDF export failed, falling back to print dialog:', error);
    window.print();
    return false;
  }
}
