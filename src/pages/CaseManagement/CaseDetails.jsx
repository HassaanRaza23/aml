import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const mockCaseDetails = {
  id: "CASE-001",
  customerName: "Ali Raza",
  customerId: "CUST-1023",
  type: "Transaction",
  severity: "High",
  status: "Open",
  createdAt: "2025-08-01",
  assignedTo: "Analyst A",
  description: "Suspicious transaction pattern detected on 3 consecutive days exceeding AED 500,000.",
  actionsTaken: [
    "Customer risk score recalculated",
    "Transaction flagged and temporarily held",
    "Initial review completed by Analyst A"
  ],
  relatedTransactions: [
    { id: "TXN-345", amount: "AED 600,000", date: "2025-07-29", status: "Flagged" },
    { id: "TXN-352", amount: "AED 550,000", date: "2025-07-30", status: "Flagged" },
  ]
};

const CaseDetails = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const caseData = mockCaseDetails;

  const [status, setStatus] = useState(caseData.status);
  const [comment, setComment] = useState("");
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Status updated to: ${status}\nComment: ${comment}\nFile: ${file?.name || "No file uploaded"}`);
    // In real implementation, trigger backend update here
  };

  return (
    <div className="p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Back to Case List
      </button>

      <h1 className="text-2xl font-semibold mb-2">Case Details: {caseData.id}</h1>

      <div className="bg-white p-4 rounded shadow-sm space-y-2 mb-6">
        <div><strong>Customer Name:</strong> {caseData.customerName}</div>
        <div><strong>Customer ID:</strong> {caseData.customerId}</div>
        <div><strong>Type:</strong> {caseData.type}</div>
        <div><strong>Severity:</strong> {caseData.severity}</div>
        <div><strong>Status:</strong> {caseData.status}</div>
        <div><strong>Created At:</strong> {caseData.createdAt}</div>
        <div><strong>Assigned To:</strong> {caseData.assignedTo}</div>
        <div><strong>Description:</strong> {caseData.description}</div>
      </div>

      <h2 className="text-xl font-semibold mb-2">Actions Taken</h2>
      <ul className="list-disc list-inside bg-white p-4 rounded shadow-sm mb-6">
        {caseData.actionsTaken.map((action, idx) => (
          <li key={idx}>{action}</li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mb-2">Related Transactions</h2>
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full border rounded shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Transaction ID</th>
              <th className="text-left p-3">Amount</th>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {caseData.relatedTransactions.map((txn) => (
              <tr key={txn.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{txn.id}</td>
                <td className="p-3">{txn.amount}</td>
                <td className="p-3">{txn.date}</td>
                <td className="p-3">{txn.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-xl font-semibold mb-2">Work on Case</h2>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-sm space-y-4">
        <div>
          <label className="block font-medium mb-1">Update Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="Open">Open</option>
            <option value="Under Review">Under Review</option>
            <option value="Resolved">Resolved</option>
            <option value="Escalated">Escalated</option>
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Add Internal Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="border p-2 rounded w-full"
            placeholder="Write any notes, findings, or updates here..."
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Upload Supporting Document</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="border p-2 rounded w-full"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit Updates
        </button>
      </form>
    </div>
  );
};

export default CaseDetails;
