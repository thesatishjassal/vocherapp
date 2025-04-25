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
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 transition-all">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">📁 Upload CSV File</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={22} />
            </button>
          </div>

          {/* Body */}
          <div className="text-center space-y-3">
            <label
              htmlFor="fileUpload"
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl py-6 px-4 cursor-pointer hover:bg-gray-50 transition"
            >
              {file ? (
                <span className="text-green-600 font-medium flex items-center gap-2">
                  <FileCheck2 size={20} /> {file.name}
                </span>
              ) : (
                <>
                  <UploadCloud size={36} className="text-blue-500 mb-2" />
                  <span className="text-gray-600 text-sm">Click to select a CSV file</span>
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
                className="text-sm text-red-500 hover:text-red-600"
              >
                ❌ Remove File
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={loading}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
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
