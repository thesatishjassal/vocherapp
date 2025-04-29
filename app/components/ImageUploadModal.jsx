"use client";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const ImageUploadModal = ({ show, onClose, product, onUpload, products, currentProductId }) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Calculate current product index for navigation
  const currentProductIndex = products?.findIndex((p) => p.id === currentProductId) ?? -1;
  const isFirstProduct = currentProductIndex <= 0;
  const isLastProduct = currentProductIndex >= (products?.length ?? 0) - 1;

  // Update preview when product changes
  useEffect(() => {
    if (product?.thumbnail) {
      setPreview(`${API_URL}${product.thumbnail}`);
    } else {
      setPreview("");
    }
    setFile(null); // Reset file when product changes
  }, [product]);

  // Clean up blob URLs
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) {
      toast.error("❌ No file selected!");
      return;
    }
    if (!selectedFile.type.startsWith("image/")) {
      toast.error("❌ Only image files are allowed!");
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("⚠️ File size exceeds 2MB. Please select a smaller image.");
      return;
    }
    console.log("Selected file:", selectedFile); // Debug
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleChange = (e) => {
    e.preventDefault();
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      console.log("File selected via input:", selectedFile); // Debug
      handleFileSelect(selectedFile);
    } else {
      console.log("No file selected via input"); // Debug
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
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      console.log("File dropped:", droppedFile); // Debug
      handleFileSelect(droppedFile);
    } else {
      toast.error("❌ No valid file dropped!");
      console.log("Drop event: No files found"); // Debug
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      console.log("Triggering file input click"); // Debug
      fileInputRef.current.value = null; // Clear previous file
      fileInputRef.current.click();
    } else {
      console.error("File input ref not found"); // Debug
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
      setFile(null);
      setPreview(`${API_URL}${responseData.thumbnail}`);
    } catch (error) {
      console.error("Upload error:", error.message);
      toast.error(error.message || "❌ Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (!isFirstProduct && products?.length > 0) {
      const previousProduct = products[currentProductIndex - 1];
      console.log("Navigating to previous product:", previousProduct); // Debug
      window.dispatchEvent(new CustomEvent("openImageModal", { detail: previousProduct }));
    }
  };

  const handleNext = () => {
    if (!isLastProduct && products?.length > 0) {
      const nextProduct = products[currentProductIndex + 1];
      console.log("Navigating to next product:", nextProduct); // Debug
      window.dispatchEvent(new CustomEvent("openImageModal", { detail: nextProduct }));
    }
  };

  if (!show || !product) return null;

  return (
    <div
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1100, // Increased zIndex to avoid overlap
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          width: "400px",
          position: "relative",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: "100" }}>
            Upload Image for <strong>{product?.itemcode || "Product"}</strong>
          </h1>
          <button
            onClick={onClose}
            style={{ border: "none", background: "transparent", fontSize: "20px" }}
          >
            ✕
          </button>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          style={{
            border: dragActive ? "2px dashed #4caf50" : "2px dashed #ccc",
            borderRadius: "8px",
            padding: "32px",
            textAlign: "center",
            marginBottom: "16px",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
        >
          <input
            ref={fileInputRef}
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
              onError={() => {
                console.error("Failed to load preview image:", preview); // Debug
                setPreview("");
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

        {/* Navigation Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "16px",
          }}
        >
          <button
            onClick={handlePrevious}
            disabled={isFirstProduct || !products?.length}
            style={{
              padding: "8px 16px",
              background: isFirstProduct || !products?.length ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: isFirstProduct || !products?.length ? "not-allowed" : "pointer",
            }}
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={isLastProduct || !products?.length}
            style={{
              padding: "8px 16px",
              background: isLastProduct || !products?.length ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: isLastProduct || !products?.length ? "not-allowed" : "pointer",
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;