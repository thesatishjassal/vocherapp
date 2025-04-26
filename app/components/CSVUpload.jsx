import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SimpleCSVUploader = ({ show, onClose }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile?.name.endsWith('.csv')) {
      setFile(selectedFile);
      toast.success('CSV file selected');
    } else {
      toast.error('Only .csv files are allowed');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      toast.info('Uploading file...');

      const response = await fetch('https://api.panvic.in/upload-csv/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Upload failed');

      toast.success(data.message || 'Upload successful!');
      setFile(null);
      onClose();
    } catch (error) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 9999,
    }}>
      <div style={{
        backgroundColor: '#fff', padding: '30px 25px', borderRadius: '12px',
        width: '320px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', textAlign: 'center',
        animation: 'fadeIn 0.3s ease-in-out',
      }}>
        <h2 style={{ marginBottom: 20, fontSize: '20px', color: '#333' }}>Upload CSV File</h2>

        <label htmlFor="csv-upload" style={{
          display: 'inline-block', padding: '10px 20px', backgroundColor: '#f5f5f5',
          border: '1px dashed #ccc', borderRadius: '8px', cursor: 'pointer', marginBottom: '15px',
          fontSize: '14px', color: '#555', transition: 'background 0.3s',
        }}>
          {file ? 'Change File' : 'Choose CSV'}
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </label>

        {file && (
          <p style={{
            fontSize: '14px', marginTop: 8, color: '#666', wordBreak: 'break-word',
          }}>
            {file.name}
          </p>
        )}

        <div style={{ marginTop: 25, display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, marginRight: 10, padding: '10px 0', borderRadius: '8px',
              backgroundColor: '#eee', border: 'none', color: '#555', fontWeight: 500,
              cursor: 'pointer', transition: 'background 0.3s',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ddd'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#eee'}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={loading}
            style={{
              flex: 1, marginLeft: 10, padding: '10px 0', borderRadius: '8px',
              backgroundColor: loading ? '#ccc' : '#4CAF50', border: 'none',
              color: '#fff', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.3s',
            }}
            onMouseOver={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#45a049';
            }}
            onMouseOut={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#4CAF50';
            }}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
    </div>
  );
};

export default SimpleCSVUploader;
