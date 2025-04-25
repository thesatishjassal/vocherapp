import React, { useState } from 'react';
import { UploadCloud, FileCheck2 } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CSVUploadModal = ({ show, onClose }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile?.name.endsWith('.csv')) {
      setFile(selectedFile);
    } else {
      toast.error('Please upload a valid CSV file (.csv)');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a CSV file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const response = await fetch('https://api.panvic.in/upload-csv/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Upload failed');

      toast.success(data.message || 'CSV uploaded successfully!');
      setFile(null);
      onClose();
    } catch (error) {
      toast.error(error.message || 'Upload failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={`modal fade ${show ? 'show d-block' : ''}`}
        tabIndex="-1"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        aria-hidden={!show}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">

            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title">Upload CSV</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>

            {/* Body */}
            <div className="modal-body text-center">
              <label
                htmlFor="fileUpload"
                className="d-flex flex-column align-items-center justify-content-center border rounded py-4 px-3 border-dashed"
                style={{ cursor: 'pointer', background: '#f9f9f9' }}
              >
                {file ? (
                  <span className="text-success fw-semibold d-flex align-items-center gap-2">
                    <FileCheck2 size={20} /> {file.name}
                  </span>
                ) : (
                  <>
                    <UploadCloud size={36} className="text-primary mb-2" />
                    <span className="text-muted">Click to select CSV file</span>
                  </>
                )}
                <input
                  id="fileUpload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="d-none"
                />
              </label>

              {file && (
                <button
                  onClick={() => setFile(null)}
                  className="btn btn-sm btn-outline-danger mt-3"
                >
                  Remove File
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
              <button
                type="button"
                className="btn btn-success btn-md"
                onClick={handleUpload}
                disabled={loading}
              >
                {loading ? 'Uploading...' : 'Upload CSV'}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Toast */}
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar
        closeOnClick
        pauseOnHover
      />
    </>
  );
};

export default CSVUploadModal;
