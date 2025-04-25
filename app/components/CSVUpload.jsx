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
      {/* Modal Overlay */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-200 ${
          show ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Modal Content */}
        <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-lg font-semibold text-gray-800">Upload CSV</h5>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="text-center">
            <label
              htmlFor="fileUpload"
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg py-5 px-4 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              {file ? (
                <span className="text-green-600 font-medium flex items-center gap-2">
                  <FileCheck2 size={18} /> {file.name}
                </span>
              ) : (
                <>
                  <UploadCloud size={32} className="text-blue-500 mb-2" />
                  <span className="text-gray-600 text-sm">Select a CSV file</span>
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
                className="mt-2 text-red-500 hover:text-red-600 text-sm"
              >
                Remove
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 mt-5">
            <button
              onClick={onClose}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Close
            </button>
            <button
              onClick={handleUpload}
              disabled={loading}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? 'Uploading...' : 'Upload'}
            </button>
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