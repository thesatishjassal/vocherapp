// components/SimpleCSVUploader.js
"use client";

import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const SimpleCSVUploader = ({ show, onClose }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile?.name.endsWith(".csv")) {
      setFile(selectedFile);
      toast.success("CSV file selected");
    } else {
      toast.error("Only .csv files are allowed");
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setProgress(0);
      toast.info("Uploading file...");

      const response = await axios.post(`${API_URL}/products/update-csv`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        },
      });

      toast.success(response.data.message || "Upload successful!");
      setFile(null);
      setProgress(0);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.detail || error.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "30px 25px",
          borderRadius: "12px",
          width: "350px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          textAlign: "center",
          animation: "fadeIn 0.3s ease-in-out",
        }}
      >
        <h2 style={{ marginBottom: 20, fontSize: "20px", color: "#333" }}>Upload CSV File</h2>

        <label
          htmlFor="csv-upload"
          style={{
            display: "inline-block",
            padding: "10px 20px",
            backgroundColor: "#f5f5f5",
            border: "1px dashed #ccc",
            borderRadius: "8px",
            cursor: "pointer",
            marginBottom: "15px",
            fontSize: "14px",
            color: "#555",
            transition: "background 0.3s",
          }}
        >
          {file ? "Change File" : "Choose CSV"}
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </label>

        {file && (
          <p style={{ fontSize: "14px", marginTop: 8, color: "#666", wordBreak: "break-word" }}>
            {file.name}
          </p>
        )}

        {loading && (
          <div style={{ marginTop: 15 }}>
            <div
              style={{
                width: "100%",
                height: 10,
                backgroundColor: "#eee",
                borderRadius: 5,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  backgroundColor: "#4CAF50",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <p style={{ fontSize: 12, color: "#555", marginTop: 5 }}>{progress}% uploaded</p>
          </div>
        )}

        <div style={{ marginTop: 25, display: "flex", justifyContent: "space-between" }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              flex: 1,
              marginRight: 10,
              padding: "10px 0",
              borderRadius: "8px",
              backgroundColor: "#eee",
              border: "none",
              color: "#555",
              fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.3s",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={loading}
            style={{
              flex: 1,
              marginLeft: 10,
              padding: "10px 0",
              borderRadius: "8px",
              backgroundColor: loading ? "#ccc" : "#4CAF50",
              border: "none",
              color: "#fff",
              fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.3s",
            }}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2500} hideProgressBar />
    </div>
  );
};

export default SimpleCSVUploader;
