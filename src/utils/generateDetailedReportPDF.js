import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { generateMockDetailedReport, formatDetailedReport } from './mockDetailedReports';

export const generateDetailedReportPDF = (match, source) => {
  const doc = new jsPDF();
  
  // Set document properties
  doc.setProperties({
    title: `${source} Detailed Report - ${match.name}`,
    subject: 'Individual Screening Report',
    author: 'AML Platform',
    creator: 'AML Platform'
  });

  // Generate mock detailed report
  const detailedReport = generateMockDetailedReport(match, source);
  const formattedReport = formatDetailedReport(detailedReport);

  // Header
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, 220, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`${source} DETAILED REPORT`, 105, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 105, 25, { align: 'center' });

  let currentY = 40;

  // Basic Information
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('1. BASIC INFORMATION', 14, currentY);
  currentY += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const basicInfo = [
    ['Field', 'Value'],
    ['Name', formattedReport.header.name],
    ['Report ID', formattedReport.header.id],
    ['Risk Score', formattedReport.header.score.toString()],
    ['Risk Category', formattedReport.header.riskCategory],
    ['Confidence', formattedReport.header.confidence],
    ['Status', formattedReport.header.status],
    ['Generated Date', formattedReport.header.generatedDate],
    ['Last Updated', formattedReport.header.lastUpdated]
  ];

  autoTable(doc, {
    head: [basicInfo[0]],
    body: basicInfo.slice(1),
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 15;

  // Sanctions & Watchlists
  if (formattedReport.sections.sanctions.length > 0 || formattedReport.sections.watchlists.length > 0) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('2. SANCTIONS & WATCHLISTS', 14, currentY);
    currentY += 10;

    const sanctionsData = [
      ['Type', 'List/Source']
    ];

    formattedReport.sections.sanctions.forEach(sanction => {
      sanctionsData.push(['Sanction', sanction]);
    });

    formattedReport.sections.watchlists.forEach(watchlist => {
      sanctionsData.push(['Watchlist', watchlist]);
    });

    autoTable(doc, {
      head: [sanctionsData[0]],
      body: sanctionsData.slice(1),
      startY: currentY,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [220, 53, 69], textColor: [255, 255, 255] },
      margin: { left: 14, right: 14 }
    });

    currentY = doc.lastAutoTable.finalY + 15;
  }

  // Adverse Media
  if (formattedReport.sections.adverseMedia.length > 0) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('3. ADVERSE MEDIA', 14, currentY);
    currentY += 10;

    const mediaData = [
      ['Media Item']
    ];

    formattedReport.sections.adverseMedia.forEach(media => {
      mediaData.push([media]);
    });

    autoTable(doc, {
      head: [mediaData[0]],
      body: mediaData.slice(1),
      startY: currentY,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [255, 193, 7], textColor: [0, 0, 0] },
      margin: { left: 14, right: 14 }
    });

    currentY = doc.lastAutoTable.finalY + 15;
  }

  // Violations & Legal Proceedings
  if (formattedReport.sections.violations.length > 0 || formattedReport.sections.legalProceedings.length > 0) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('4. VIOLATIONS & LEGAL PROCEEDINGS', 14, currentY);
    currentY += 10;

    const violationsData = [
      ['Type', 'Description']
    ];

    formattedReport.sections.violations.forEach(violation => {
      violationsData.push(['Violation', violation]);
    });

    formattedReport.sections.legalProceedings.forEach(proceeding => {
      violationsData.push(['Legal Proceeding', proceeding]);
    });

    autoTable(doc, {
      head: [violationsData[0]],
      body: violationsData.slice(1),
      startY: currentY,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [220, 53, 69], textColor: [255, 255, 255] },
      margin: { left: 14, right: 14 }
    });

    currentY = doc.lastAutoTable.finalY + 15;
  }

  // Business Relationships
  if (formattedReport.sections.businessRelationships.length > 0) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('5. BUSINESS RELATIONSHIPS', 14, currentY);
    currentY += 10;

    const relationshipsData = [
      ['Relationship']
    ];

    formattedReport.sections.businessRelationships.forEach(relationship => {
      relationshipsData.push([relationship]);
    });

    autoTable(doc, {
      head: [relationshipsData[0]],
      body: relationshipsData.slice(1),
      startY: currentY,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [13, 110, 253], textColor: [255, 255, 255] },
      margin: { left: 14, right: 14 }
    });

    currentY = doc.lastAutoTable.finalY + 15;
  }

  // Positive Indicators (for whitelist)
  if (formattedReport.sections.positiveIndicators.length > 0) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('6. POSITIVE INDICATORS', 14, currentY);
    currentY += 10;

    const indicatorsData = [
      ['Indicator']
    ];

    formattedReport.sections.positiveIndicators.forEach(indicator => {
      indicatorsData.push([indicator]);
    });

    autoTable(doc, {
      head: [indicatorsData[0]],
      body: indicatorsData.slice(1),
      startY: currentY,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [25, 135, 84], textColor: [255, 255, 255] },
      margin: { left: 14, right: 14 }
    });

    currentY = doc.lastAutoTable.finalY + 15;
  }

  // Business Metrics (for whitelist)
  if (Object.keys(formattedReport.sections.businessMetrics).length > 0) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('7. BUSINESS METRICS', 14, currentY);
    currentY += 10;

    const metricsData = [
      ['Metric', 'Value']
    ];

    Object.entries(formattedReport.sections.businessMetrics).forEach(([key, value]) => {
      metricsData.push([key.replace(/([A-Z])/g, ' $1').trim(), value]);
    });

    autoTable(doc, {
      head: [metricsData[0]],
      body: metricsData.slice(1),
      startY: currentY,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [108, 117, 125], textColor: [255, 255, 255] },
      margin: { left: 14, right: 14 }
    });

    currentY = doc.lastAutoTable.finalY + 15;
  }

  // Recommendations
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('8. RECOMMENDATIONS', 14, currentY);
  currentY += 10;

  const recommendationsData = [
    ['Recommendation']
  ];

  formattedReport.recommendations.forEach(recommendation => {
    recommendationsData.push([recommendation]);
  });

  autoTable(doc, {
    head: [recommendationsData[0]],
    body: recommendationsData.slice(1),
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [111, 66, 193], textColor: [255, 255, 255] },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 15;

  // Source Information
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('9. SOURCE INFORMATION', 14, currentY);
  currentY += 10;

  const sourceData = [
    ['Field', 'Value'],
    ['Database', formattedReport.sourceDetails.database],
    ['Coverage', formattedReport.sourceDetails.coverage],
    ['Update Frequency', formattedReport.sourceDetails.updateFrequency],
    ['Data Quality', formattedReport.sourceDetails.dataQuality]
  ];

  autoTable(doc, {
    head: [sourceData[0]],
    body: sourceData.slice(1),
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
    margin: { left: 14, right: 14 }
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    doc.text('AML Platform - Individual Screening Report', 105, 295, { align: 'center' });
  }

  // Convert PDF to blob and open in new window
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  
  // Open PDF in new window
  const newWindow = window.open(pdfUrl, '_blank');
  
  // Clean up the URL object after a delay
  setTimeout(() => {
    URL.revokeObjectURL(pdfUrl);
  }, 1000);
};
