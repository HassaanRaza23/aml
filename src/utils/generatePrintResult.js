import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePrintResultPDF = (results) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Instant Screening - Print Result", 14, 20);

  let currentY = 30;

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

  Object.entries(results).forEach(([section, list]) => {
    if (Array.isArray(list) && list.length > 0) {
      // Add section heading
      doc.setFontSize(13);
      doc.text(section, 14, currentY);
      currentY += 6;

      // Prepare table rows
      const tableRows = list.map((item, index) => [
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
        startY: currentY,
        theme: "grid",
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 }
      });

      // Update currentY for next section
      currentY = doc.lastAutoTable.finalY + 10;
    }
  });

  doc.save("print_result.pdf");
};