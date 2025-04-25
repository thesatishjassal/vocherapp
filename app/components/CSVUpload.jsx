import React, { useState } from 'react';
import { UploadCloud, FileCheck2, X } from 'lucide-react';
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
      {/* Bootstrap Modal */}
      <div
        className={`modal fade ${show ? 'show d-block' : ''}`}
        tabIndex="-1"
        role="dialog"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">

            {/* Modal Header */}
            <div className="modal-header">
              <h5 className="modal-title">Upload CSV</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            {/* Modal Body */}
            <div className="modal-body text-center">
              <label htmlFor="fileUpload" className="form-label w-100 border border-dashed rounded p-4 bg-light cursor-pointer">
                {file ? (
                  <div className="text-success d-flex justify-content-center align-items-center gap-2">
                    <FileCheck2 size={18} /> <span>{file.name}</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud size={32} className="text-primary mb-2" />
                    <div className="text-secondary">Select a CSV file</div>
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
                  className="btn btn-sm btn-link text-danger mt-2"
                >
                  Remove File
                </button>
              )}
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
                {loading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
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
