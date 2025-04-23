import React, { useState } from 'react';
import axios from 'axios';

const UploadProducts = ({ apiUrl, successMessage, errorMessage }) => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatus("Please select an Excel file.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setStatus("Uploading...");
      const response = await axios.post(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setStatus(`✅ ${successMessage || response.data.message || "Uploaded successfully!"}`);
    } catch (error) {
      console.error(error);
      setStatus(`${errorMessage || "Upload failed"}: ` + (error.response?.data?.detail || "Server error"));
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h2>Upload Products Excel File</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <br /><br />
        <button type="submit">Upload</button>
      </form>
      <p>{status}</p>
    </div>
  );
};

export default UploadProducts;
