import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UploadCloud, FileCheck2 } from "lucide-react";

const ExcelUploaderModal = ({ show, onClose }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (
      selectedFile &&
      (selectedFile.name.endsWith(".xlsx") ||
        selectedFile.name.endsWith(".xls"))
    ) {
      setFile(selectedFile);
    } else {
      toast.error(
        "Invalid file type. Please upload a valid Excel file (.xlsx, .xls)"
      );
      setFile(null);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select an Excel file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const response = await axios.post(
        "https://api.panvic.in/import-products/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success("File uploaded successfully!");
      console.log("Response:", response.data);
      setFile(null);
      onClose(); // Close modal on success
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error.response?.data?.detail || "File upload failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={`modal fade ${show ? "show" : ""}`}
        tabIndex="-1"
        aria-hidden={!show}
        style={{
          display: show ? "block" : "none",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            {/* Modal Header */}
            <div className="modal-header">
              <h5 className="modal-title">Upload Product Excel</h5>
              <button type="button" className="btn-close" onClick={onClose}>
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              <div className="mb-3 text-center">
                {/* File Input Styled */}
                <label
                  htmlFor="fileUpload"
                  className="d-flex flex-column align-items-center justify-content-center border rounded py-4 px-3 border-dashed"
                  style={{ cursor: "pointer", background: "#f9f9f9" }}
                >
                  {file ? (
                    <span className="text-success fw-semibold d-flex align-items-center gap-2">
                      <FileCheck2 size={20} /> {file.name}
                    </span>
                  ) : (
                    <>
                      <UploadCloud size={36} className="text-primary mb-2" />
                      <span className="text-muted">
                        Click to select Excel file (.xlsx, .xls)
                      </span>
                    </>
                  )}
                  <input
                    id="fileUpload"
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    className="d-none"
                  />
                </label>

                {/* Remove File Button */}
                {file && (
                  <button
                    onClick={() => setFile(null)}
                    className="btn btn-sm btn-outline-danger mt-3"
                  >
                    Remove File
                  </button>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={loading}
              >
                {loading ? "Uploading..." : "Upload File"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
    </>
  );
};

export default ExcelUploaderModal;
