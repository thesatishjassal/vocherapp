"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const ImageUploadModal = ({ show, onClose, product, onUpload }) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(product?.thumbnail ? "https://api.panvic.in" + product?.thumbnail : "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile.type.startsWith("image/")) {
      toast.error("❌ Only image files are allowed!");
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("⚠️ File size exceeds 2MB. Please select a smaller image.");
      return;
    }
    setPreview(URL.createObjectURL(selectedFile));
    setFile(selectedFile);
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSave = async () => {
    if (!file) {
      toast.error("⚠️ Please select an image before uploading.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/products/${product.id}/upload`, {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.detail || "❌ Image upload failed. Please try again.");
      }

      toast.success("✅ Image uploaded successfully!");
      onUpload(product.id, responseData.thumbnail);
      onClose();
    } catch (error) {
      console.error("Error:", error.message);
      toast.error(error.message || "❌ Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1050,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div style={{ background: "white", borderRadius: "12px", padding: "24px", width: "400px", position: "relative" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600" }}>Upload Product Image</h2>
          <button onClick={onClose} style={{ border: "none", background: "transparent", fontSize: "20px" }}>
            ✕
          </button>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: dragActive ? "2px dashed #4caf50" : "2px dashed #ccc",
            borderRadius: "8px",
            padding: "32px",
            textAlign: "center",
            marginBottom: "16px",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onClick={() => document.getElementById("fileInput").click()}
        >
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleChange}
            style={{ display: "none" }}
          />
          <p style={{ margin: 0, color: dragActive ? "#4caf50" : "#888" }}>
            {dragActive ? "Drop the image here..." : "Drag & Drop image here or click to browse"}
          </p>
        </div>

        {/* Preview */}
        {preview && (
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <img
              src={preview}
              alt="Preview"
              style={{
                width: "120px",
                height: "120px",
                objectFit: "cover",
                borderRadius: "8px",
                border: "1px solid #eee",
              }}
            />
          </div>
        )}

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              background: "#ccc",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !file}
            style={{
              padding: "8px 16px",
              background: loading || !file ? "#aaa" : "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: loading || !file ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;
