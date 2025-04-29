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
  const totalProducts = products?.length ?? 0;

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
      toast.error("❌ No file selected!", { autoClose: 3000 });
      return;
    }
    if (!selectedFile.type.startsWith("image/")) {
      toast.error("❌ Only JPG, PNG, or GIF files are allowed!", { autoClose: 3000 });
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("⚠️ File size exceeds 2MB. Please select a smaller image.", {
        autoClose: 3000,
      });
      return;
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    toast.success("Image selected successfully!", { autoClose: 2000 });
  };

  const handleChange = (e) => {
    e.preventDefault();
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
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
      handleFileSelect(droppedFile);
    } else {
      toast.error("❌ No valid file dropped!", { autoClose: 3000 });
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null; // Clear previous file
      fileInputRef.current.click();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  const handleSave = async () => {
    if (!file) {
      toast.error("⚠️ Please select an image before uploading.", { autoClose: 3000 });
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
        throw new Error(responseData.detail || "Failed to upload image. Please try again.");
      }

      toast.success("Image uploaded successfully!", { autoClose: 2000 });
      onUpload(product.id, responseData.thumbnail);
      setFile(null);
      setPreview(`${API_URL}${responseData.thumbnail}`);
    } catch (error) {
      toast.error(`❌ ${error.message || "Upload failed. Check your network and try again."}`, {
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (!isFirstProduct && totalProducts > 0) {
      const previousProduct = products[currentProductIndex - 1];
      window.dispatchEvent(new CustomEvent("openImageModal", { detail: previousProduct }));
      toast.info(`Navigated to ${previousProduct.itemcode}`, { autoClose: 2000 });
    }
  };

  const handleNext = () => {
    if (!isLastProduct && totalProducts > 0) {
      const nextProduct = products[currentProductIndex + 1];
      window.dispatchEvent(new CustomEvent("openImageModal", { detail: nextProduct }));
      toast.info(`Navigated to ${nextProduct.itemcode}`, { autoClose: 2000 });
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
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn 0.3s ease-in",
      }}
      role="dialog"
      aria-labelledby="upload-modal-title"
      aria-modal="true"
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "24px",
          width: "100%",
          maxWidth: "450px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          position: "relative",
          animation: "slideIn 0.3s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h1
            id="upload-modal-title"
            style={{ fontSize: "1.5rem", fontWeight: "100", color: "#333" }}
          >
            Upload Image for <strong>{product.itemcode}</strong>
          </h1>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "24px",
              color: "#666",
              cursor: "pointer",
              transition: "color 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#333")}
            onMouseOut={(e) => (e.currentTarget.style.color = "#666")}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Product Navigation Info */}
        {totalProducts > 1 && (
          <div
            style={{
              textAlign: "center",
              marginBottom: "16px",
              color: "#666",
              fontSize: "0.9rem",
            }}
          >
            Product {currentProductIndex + 1} of {totalProducts}
          </div>
        )}

        {/* Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="button"
          aria-label="Drag and drop or click to upload an image"
          style={{
            border: dragActive ? "2px dashed #4caf50" : "2px dashed #ccc",
            borderRadius: "12px",
            padding: "24px",
            textAlign: "center",
            marginBottom: "20px",
            cursor: "pointer",
            background: dragActive ? "rgba(76, 175, 80, 0.05)" : "transparent",
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) => {
            if (!dragActive) e.currentTarget.style.borderColor = "#4caf50";
          }}
          onMouseOut={(e) => {
            if (!dragActive) e.currentTarget.style.borderColor = "#ccc";
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif"
            onChange={handleChange}
            style={{ display: "none" }}
            aria-hidden="true"
          />
          <p
            style={{
              margin: 0,
              color: dragActive ? "#4caf50" : "#666",
              fontSize: "1rem",
            }}
          >
            {dragActive
              ? "Drop the image here..."
              : "Drag & drop or click to upload"}
          </p>
          <p
            style={{
              margin: "8px 0 0",
              color: "#888",
              fontSize: "0.85rem",
            }}
          >
            Supported formats: JPG, PNG, GIF (Max 2MB)
          </p>
        </div>

        {/* Preview */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "20px",
            minHeight: "120px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {preview ? (
            <img
              src={preview}
              alt="Image preview"
              style={{
                width: "120px",
                height: "120px",
                objectFit: "cover",
                borderRadius: "8px",
                border: "1px solid #eee",
                transition: "opacity 0.3s ease",
              }}
              onError={() => {
                toast.error("❌ Failed to load image preview.", { autoClose: 3000 });
                setPreview("");
              }}
            />
          ) : (
            <div
              style={{
                width: "120px",
                height: "120px",
                background: "#f5f5f5",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#888",
                fontSize: "0.9rem",
                border: "1px solid #eee",
              }}
            >
              No Image Selected
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              background: "#e0e0e0",
              border: "none",
              borderRadius: "8px",
              color: "#333",
              cursor: "pointer",
              fontWeight: "500",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#d0d0d0")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#e0e0e0")}
            aria-label="Cancel upload"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !file}
            style={{
              padding: "10px 20px",
              background: loading || !file ? "#ccc" : "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: loading || !file ? "not-allowed" : "pointer",
              fontWeight: "500",
              transition: "background 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onMouseOver={(e) => {
              if (!loading && file) e.currentTarget.style.background = "#45a049";
            }}
            onMouseOut={(e) => {
              if (!loading && file) e.currentTarget.style.background = "#4caf50";
            }}
            aria-label="Upload image"
          >
            {loading && (
              <span
                style={{
                  border: "2px solid #fff",
                  borderTop: "2px solid transparent",
                  borderRadius: "50%",
                  width: "16px",
                  height: "16px",
                  animation: "spin 1s linear infinite",
                }}
              />
            )}
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {/* Navigation Buttons */}
        {totalProducts > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "20px",
            }}
          >
            <button
              onClick={handlePrevious}
              disabled={isFirstProduct || !totalProducts}
              style={{
                padding: "10px 20px",
                background: isFirstProduct || !totalProducts ? "#ccc" : "#007bff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: isFirstProduct || !totalProducts ? "not-allowed" : "pointer",
                fontWeight: "500",
                transition: "background 0.2s",
                position: "relative",
              }}
              onMouseOver={(e) => {
                if (!isFirstProduct && totalProducts)
                  e.currentTarget.style.background = "#0056b3";
              }}
              onMouseOut={(e) => {
                if (!isFirstProduct && totalProducts)
                  e.currentTarget.style.background = "#007bff";
              }}
              aria-label="Previous product"
              title="Go to previous product"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={isLastProduct || !totalProducts}
              style={{
                padding: "10px 20px",
                background: isLastProduct || !totalProducts ? "#ccc" : "#007bff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: isLastProduct || !totalProducts ? "not-allowed" : "pointer",
                fontWeight: "500",
                transition: "background 0.2s",
                position: "relative",
              }}
              onMouseOver={(e) => {
                if (!isLastProduct && totalProducts)
                  e.currentTarget.style.background = "#0056b3";
              }}
              onMouseOut={(e) => {
                if (!isLastProduct && totalProducts)
                  e.currentTarget.style.background = "#007bff";
              }}
              aria-label="Next product"
              title="Go to next product"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Inline Styles */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideIn {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @media (max-width: 500px) {
            div[role="dialog"] > div {
              width: 90%;
              padding: 16px;
            }
            h2 {
              font-size: 1.25rem;
            }
            button {
              padding: 8px 16px;
              font-size: 0.9rem;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ImageUploadModal;