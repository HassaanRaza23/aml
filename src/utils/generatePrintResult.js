// utils/generatePrintResult.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePrintResultPDF = (results) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Instant Screening - Print Result", 14, 20);

  const tableColumn = [
    "ID",
    "Record Type",
    "Name",
    "Score",
    "Search Type",
    "Primary Name",
    "Search List",
    "DOB",
    "Country",
    "Gender",
    "Subsidiary",
    "Title"
  ];

  const tableRows = results.map((item, index) => [
    item.id || index + 1,
    item.recordType || "-",
    item.name || "-",
    item.score || "-",
    item.searchType || "-",
    item.primaryName || "-",
    item.searchList || "-",
    item.dateOfBirth || "-",
    item.countryTerritoryName || "-",
    item.gender || "-",
    item.isSubsidiary ? "Yes" : "No",
    item.title || "-"
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 30,
  });

  doc.save("print_result.pdf");
};
