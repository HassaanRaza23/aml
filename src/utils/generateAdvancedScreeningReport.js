import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateAdvancedScreeningReport = (screeningData, results) => {
  try {
    const doc = new jsPDF();
  
  // Set document properties
  doc.setProperties({
    title: 'Advanced Screening Report',
    subject: 'Comprehensive Screening Analysis',
    author: 'AML Platform',
    creator: 'AML Platform'
  });

  // Header
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, 220, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ADVANCED SCREENING REPORT', 105, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 105, 25, { align: 'center' });

  let currentY = 40;

  // Customer Information Section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('1. CUSTOMER INFORMATION', 14, currentY);
  currentY += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const customerInfo = [
    ['Field', 'Value'],
    ['Full Name', screeningData.fullName || 'Not Provided'],
    ['Entity Type', screeningData.entityType || 'Not Specified'],
    ['Nationality', screeningData.nationality || 'Not Provided'],
    ['Gender', screeningData.gender || 'Not Provided'],
    ['Date of Birth', screeningData.dob || 'Not Provided']
  ];

  autoTable(doc, {
    head: [customerInfo[0]],
    body: customerInfo.slice(1),
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 15;

  // Screening Criteria Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('2. SCREENING CRITERIA', 14, currentY);
  currentY += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const screeningCriteria = [
    ['Parameter', 'Value'],
    ['Screening List', screeningData.screeningList || 'All'],
    ['Match Type', screeningData.matchType || 'Broad'],
    ['Remarks', screeningData.remarks || 'None']
  ];

  autoTable(doc, {
    head: [screeningCriteria[0]],
    body: screeningCriteria.slice(1),
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 15;

  // Results Summary Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('3. RESULTS SUMMARY', 14, currentY);
  currentY += 10;

  // Calculate summary statistics
  const allMatches = [
    ...(results.dowjones || []),
    ...(results.freeSource || []),
    ...(results.centralBank || []),
    ...(results.companyWhitelist || []),
    ...(results.companyBlacklist || []),
    ...(results.uaeList || [])
  ];

  const totalMatches = allMatches.length;
  const highRiskMatches = allMatches.filter(m => (m.score || 0) >= 70).length;
  const mediumRiskMatches = allMatches.filter(m => (m.score || 0) >= 40 && (m.score || 0) < 70).length;
  const lowRiskMatches = allMatches.filter(m => (m.score || 0) < 40).length;
  const maxScore = Math.max(...allMatches.map(m => m.score || 0), 0);
  const riskLevel = maxScore >= 70 ? 'High' : maxScore >= 40 ? 'Medium' : 'Low';

  const summaryData = [
    ['Metric', 'Count'],
    ['Total Matches', totalMatches.toString()],
    ['High Risk Matches (70+)', highRiskMatches.toString()],
    ['Medium Risk Matches (40-69)', mediumRiskMatches.toString()],
    ['Low Risk Matches (<40)', lowRiskMatches.toString()],
    ['Highest Risk Score', maxScore.toString()],
    ['Overall Risk Level', riskLevel]
  ];

  autoTable(doc, {
    head: [summaryData[0]],
    body: summaryData.slice(1),
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 15;

  // Sources Checked Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('4. SOURCES CHECKED', 14, currentY);
  currentY += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const sourcesData = [
    ['Source', 'Status', 'Matches Found'],
    ['Dow Jones', 'Completed', ((results.dowjones || []).length || 0).toString()],
    ['Free Sources (OFAC, UN, Interpol, EU)', 'Completed', ((results.freeSource || []).length || 0).toString()],
    ['Central Banks', 'Completed', ((results.centralBank || []).length || 0).toString()],
    ['Company Whitelist', 'Completed', ((results.companyWhitelist || []).length || 0).toString()],
    ['Company Blacklist', 'Completed', ((results.companyBlacklist || []).length || 0).toString()],
    ['UAE Lists', 'Completed', ((results.uaeList || []).length || 0).toString()]
  ];

  autoTable(doc, {
    head: [sourcesData[0]],
    body: sourcesData.slice(1),
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 15;

  // Risk Assessment Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('5. RISK ASSESSMENT', 14, currentY);
  currentY += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  let recommendations = [];
  if (maxScore >= 70) {
    recommendations = [
      'Immediate investigation required',
      'Enhanced due diligence recommended',
      'Consider case creation',
      'Monitor for additional risks'
    ];
  } else if (maxScore >= 40) {
    recommendations = [
      'Additional verification recommended',
      'Monitor for changes',
      'Standard due diligence',
      'Regular review required'
    ];
  } else {
    recommendations = [
      'Standard procedures',
      'Routine monitoring',
      'No immediate action required',
      'Continue normal operations'
    ];
  }

  const riskAssessmentData = [
    ['Risk Level', riskLevel],
    ['Highest Score', maxScore.toString()],
    ['Total Matches', totalMatches.toString()],
    ['Assessment Date', new Date().toLocaleDateString()]
  ];

  autoTable(doc, {
    head: [['Risk Assessment', 'Value']],
    body: riskAssessmentData,
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 10;

  // Recommendations
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Recommendations:', 14, currentY);
  currentY += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  recommendations.forEach((rec, index) => {
    doc.text(`${index + 1}. ${rec}`, 20, currentY);
    currentY += 6;
  });

  currentY += 10;

  // Detailed Results Section
  if (totalMatches > 0) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('6. DETAILED RESULTS', 14, currentY);
    currentY += 10;

    // Create detailed results table
    const detailedResults = allMatches.map(match => [
      (match.id || 'N/A').toString(),
      (match.name || 'N/A').toString(),
      (match.score || 'N/A').toString(),
      (match.searchType || 'N/A').toString(),
      (match.searchList || 'N/A').toString(),
      (match.country || 'N/A').toString(),
      (match.title || 'N/A').toString(),
      (match.source || 'N/A').toString()
    ]);

    autoTable(doc, {
      head: [['ID', 'Name', 'Score', 'Search Type', 'List', 'Country', 'Title', 'Source']],
      body: detailedResults,
      startY: currentY,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
      margin: { left: 14, right: 14 },
      pageBreak: 'auto'
    });
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    doc.text('AML Platform - Advanced Screening Report', 105, 295, { align: 'center' });
  }

    // Save the document
    const fileName = `advanced_screening_report_${screeningData.fullName || 'unknown'}_${Date.now()}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generating advanced screening report:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};
