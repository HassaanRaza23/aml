import React, { useState, useEffect } from "react";

const ReportGeneration = () => {
  const [reportType, setReportType] = useState("");
  const [format, setFormat] = useState("PDF");
  const [customer, setCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);

  // Dynamic Fields
  const [transactionId, setTransactionId] = useState("");
  const [suspicionReason, setSuspicionReason] = useState("");
  const [matchedEntity, setMatchedEntity] = useState("");
  const [matchDetails, setMatchDetails] = useState("");
  const [goamlType, setGoamlType] = useState("");
  const [submissionReason, setSubmissionReason] = useState("");

  useEffect(() => {
    // Fetch customers
    setCustomers([
      { id: "cust001", name: "John Doe" },
      { id: "cust002", name: "Jane Smith" }
    ]);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      customerId: customer?.id,
      customerName: customer?.name,
      reportType,
      format,
      createdAt: new Date().toISOString(),
      preparedBy: "CurrentUser", // replace with actual user
      data: {}
    };

    if (reportType === "Suspicious Transaction Report") {
      payload.data = { transactionId, suspicionReason };
    } else if (reportType === "Screening Match Report") {
      payload.data = { matchedEntity, matchDetails };
    } else if (reportType === "goAML XML Report") {
      payload.data = { goamlType, submissionReason };
    }

    console.log("Generated Report:", payload);
    alert("Report generated successfully!");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Generate Report</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Customer</label>
          <select
            className="w-full p-2 border rounded"
            value={customer?.id || ""}
            onChange={(e) => {
              const selected = customers.find((c) => c.id === e.target.value);
              setCustomer(selected);
            }}
          >
            <option value="">Select Customer</option>
            {customers.map((cust) => (
              <option key={cust.id} value={cust.id}>{cust.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium">Report Type</label>
          <select
            className="w-full p-2 border rounded"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="">Select Type</option>
            <option value="Suspicious Transaction Report">Suspicious Transaction Report</option>
            <option value="Screening Match Report">Screening Match Report</option>
            <option value="goAML XML Report">goAML XML Report</option>
          </select>
        </div>

        {reportType === "Suspicious Transaction Report" && (
          <>
            <div>
              <label className="block font-medium">Transaction ID</label>
              <input
                className="w-full p-2 border rounded"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium">Suspicion Reason</label>
              <textarea
                className="w-full p-2 border rounded"
                value={suspicionReason}
                onChange={(e) => setSuspicionReason(e.target.value)}
              ></textarea>
            </div>
          </>
        )}

        {reportType === "Screening Match Report" && (
          <>
            <div>
              <label className="block font-medium">Matched Entity</label>
              <input
                className="w-full p-2 border rounded"
                value={matchedEntity}
                onChange={(e) => setMatchedEntity(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium">Match Details</label>
              <textarea
                className="w-full p-2 border rounded"
                value={matchDetails}
                onChange={(e) => setMatchDetails(e.target.value)}
              ></textarea>
            </div>
          </>
        )}

        {reportType === "goAML XML Report" && (
          <>
            <div>
              <label className="block font-medium">goAML Report Type</label>
              <select
                className="w-full p-2 border rounded"
                value={goamlType}
                onChange={(e) => setGoamlType(e.target.value)}
              >
                <option value="">Select</option>
                <option value="STR">STR (Suspicious Transaction)</option>
                <option value="SAR">SAR (Suspicious Activity)</option>
                <option value="CTR">CTR (Cash Transaction)</option>
              </select>
            </div>
            <div>
              <label className="block font-medium">Submission Reason</label>
              <textarea
                className="w-full p-2 border rounded"
                value={submissionReason}
                onChange={(e) => setSubmissionReason(e.target.value)}
              ></textarea>
            </div>
          </>
        )}

        <div>
          <label className="block font-medium">Report Format</label>
          <select
            className="w-full p-2 border rounded"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            <option value="PDF">PDF</option>
            {reportType === "goAML XML Report" && <option value="XML">XML</option>}
            {reportType === "goAML XML Report" && <option value="Both">Both</option>}
          </select>
        </div>

        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Generate Report
        </button>
      </form>
    </div>
  );
};

export default ReportGeneration;