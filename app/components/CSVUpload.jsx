import React, { useState } from 'react';
import { UploadCloud, FileCheck2 } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CSVUploadModal = ({ show, onClose }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
    } else {
      toast.error('Invalid file type. Please upload a valid CSV file (.csv)');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a CSV file to upload');
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

      if (!response.ok) {
        throw new Error(data.detail || 'Upload failed');
      }

      toast.success(data.message || 'CSV uploaded successfully!');
      setFile(null);
      onClose(); // Close modal on success
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'File upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Modal Overlay */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
          show ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        {/* Modal Content */}
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h5 className="text-lg font-semibold text-gray-800">Upload CSV File</h5>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6">
            <div className="text-center">
              <label
                htmlFor="fileUpload"
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg py-6 px-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {file ? (
                  <span className="text-green-600 font-medium flex items-center gap-2">
                    <FileCheck2 size={20} /> {file.name}
                  </span>
                ) : (
                  <>
                    <UploadCloud size={36} className="text-blue-500 mb-2" />
                    <span className="text-gray-600 text-sm">
                      Click to select a CSV file
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      Only .csv files are supported
                    </span>
                  </>
                )}
                <input
                  id="fileUpload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {file && (
                <button
                  onClick={() => setFile(null)}
                  className="mt-3 text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                >
                  Remove File
                </button>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleUpload}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed focus:outline-none transition-colors"
            >
              {loading ? 'Uploading...' : 'Upload File'}
            </button>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
    </>
  );
};

export default CSVUploadModal;