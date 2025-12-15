import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { customerService } from "../../services";

const DocumentUpload = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [customer, setCustomer] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load customer info
        const customerResult = await customerService.getCustomerById(customerId);
        if (customerResult.success) {
          setCustomer(customerResult.data);
        }
        
        // Load documents
        const docsResult = await customerService.getCustomerDocuments(customerId);
        if (docsResult.success) {
          setDocuments(docsResult.data || []);
        } else {
          toast.error(docsResult.error || "Failed to load documents");
        }
      } catch (e) {
        console.error("Error loading data:", e);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      loadData();
    }
  }, [customerId]);

  const getFileIcon = (fileType) => {
    if (!fileType) return "📄";
    if (fileType.includes("pdf")) return "📕";
    if (fileType.includes("image")) return "🖼️";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    if (fileType.includes("excel") || fileType.includes("spreadsheet")) return "📊";
    return "📄";
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/customer/list")}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Customer List
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Document Management</h1>
        </div>

        {/* Customer Info */}
        {customer && (
          <div className="bg-white rounded-xl shadow border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Customer</p>
                <p className="text-lg font-semibold text-gray-800">
                  {customer.full_name || customer.company_name || customer.name || "N/A"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Type: <span className="font-medium">{customer.customer_type || "N/A"}</span>
                  {customerId && (
                    <>
                      {" • "}
                      ID: <span className="font-mono">{customerId.slice(0, 8)}...</span>
                    </>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Documents</p>
                <p className="text-2xl font-bold text-blue-600">{documents.length}</p>
                <p className="text-xs text-gray-500">Total uploaded</p>
              </div>
            </div>
          </div>
        )}

        {/* Upload form */}
        <div className="bg-white rounded-xl shadow border p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Upload New Document</h2>
            <p className="text-sm text-gray-600">
              Upload and manage KYC / AML supporting documents for this customer.
            </p>
          </div>

          {/* Drag and drop area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input
              type="file"
              id="file-upload"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex flex-col items-center">
                <svg
                  className="w-12 h-12 text-gray-400 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {file ? file.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-gray-500">
                  {file
                    ? `${formatFileSize(file.size)} • ${file.type || "Unknown type"}`
                    : "PDF, DOC, DOCX, JPG, PNG (Max 50MB)"}
                </p>
              </div>
            </label>
          </div>

          {/* File details and form */}
          {file && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{getFileIcon(file.type)}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFileSize(file.size)} • {file.type || "Unknown type"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select category</option>
                    <option value="ID">ID / Passport</option>
                    <option value="License">Trade / Business License</option>
                    <option value="Proof of Address">Proof of Address</option>
                    <option value="Corporate Docs">Corporate Documents</option>
                    <option value="Source of Funds">Source of Funds / Wealth</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add notes about this document"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={async () => {
                    if (!file) return;

                    try {
                      setUploading(true);
                      const result = await customerService.uploadCustomerDocument(customerId, file, {
                        category,
                        description,
                      });

                      if (!result.success) {
                        throw new Error(result.error || "Failed to upload document");
                      }

                      toast.success("Document uploaded successfully.");
                      setFile(null);
                      setCategory("");
                      setDescription("");

                      const refresh = await customerService.getCustomerDocuments(customerId);
                      if (refresh.success) {
                        setDocuments(refresh.data || []);
                      }
                    } catch (e) {
                      console.error("Error uploading document:", e);
                      toast.error(e.message || "Failed to upload document");
                    } finally {
                      setUploading(false);
                    }
                  }}
                  className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      Upload Document
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Documents list */}
        <div className="bg-white rounded-xl shadow border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Uploaded Documents</h2>
            <span className="text-sm text-gray-500">
              {documents.length} document{documents.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <svg
                  className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <p className="text-sm text-gray-500">Loading documents...</p>
              </div>
            </div>
          ) : documents.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-500 font-medium mb-1">No documents uploaded yet</p>
              <p className="text-sm text-gray-400">Upload your first document using the form above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <span className="text-3xl flex-shrink-0">{getFileIcon(doc.file_type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate" title={doc.file_name}>
                          {doc.file_name}
                        </p>
                        {doc.category && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                            {doc.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {doc.description && (
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{doc.description}</p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>{formatFileSize(doc.file_size_bytes)}</span>
                    <span>
                      {doc.created_at
                        ? new Date(doc.created_at).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    {doc.publicUrl && (
                      <a
                        href={doc.publicUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        View
                      </a>
                    )}
                    <button
                      type="button"
                      className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
                      onClick={async () => {
                        if (
                          !window.confirm(
                            `Delete document "${doc.file_name}"? This cannot be undone.`
                          )
                        ) {
                          return;
                        }
                        try {
                          const result = await customerService.deleteCustomerDocument(doc.id);
                          if (!result.success) {
                            throw new Error(result.error || "Failed to delete document");
                          }
                          toast.success("Document deleted.");
                          setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
                        } catch (e) {
                          console.error("Error deleting document:", e);
                          toast.error(e.message || "Failed to delete document");
                        }
                      }}
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;


