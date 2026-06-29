import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportReportToPdf(elementId: string, companyName: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error("[PDF Export] Target element not found:", elementId);
    return false;
  }

  try {
    // Hide print-excluded buttons temporarily
    const exclusions = document.querySelectorAll(".no-print");
    exclusions.forEach((el: any) => { el.style.opacity = "0"; });

    const canvas = await html2canvas(element, {
      scale: 1.5, // Balance quality and file size
      useCORS: true,
      backgroundColor: "#030303",
      logging: false,
    });

    // Restore print-excluded buttons
    exclusions.forEach((el: any) => { el.style.opacity = "1"; });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
    heightLeft -= pageHeight;

    // Subsequent pages
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= pageHeight;
    }

    const fileName = `Investment_Research_${companyName.toUpperCase().replace(/\s+/g, "_")}.pdf`;
    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error("[PDF Export] Failed to export:", error);
    return false;
  }
}
