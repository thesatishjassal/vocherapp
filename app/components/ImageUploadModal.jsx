"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const ImageUploadModal = ({ show, onClose, product, onUpload, products, currentProductId }) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Memoized current product index
  const currentProductIndex = useMemo(() => {
    return products?.findIndex((p) => p.id === currentProductId) ?? -1;
  }, [products, currentProductId]);
  const totalProducts = products?.length ?? 0;
  const isFirstProduct = currentProductIndex <= 0;
  const isLastProduct = currentProductIndex >= totalProducts - 1;

  // Update preview when product changes
  useEffect(() => {
    setPreview(product?.thumbnail ? `${API_URL}${product.thumbnail}` : "");
    setFile(null);
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
      toast.error("No file selected.", { autoClose: 3000 });
      return;
    }
    if (!selectedFile.type.match(/^image\/(jpeg|png|gif)$/)) {
      toast.error("Only JPG, PNG, or GIF files are allowed.", { autoClose: 3000 });
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 2MB. Please select a smaller image.", {
        autoClose: 3000,
      });
      return;
    }
    console.log("Selected file:", selectedFile);
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    toast.info("Image selected successfully.", { autoClose: 2000 });
  };

  const handleChange = (e) => {
    e.preventDefault();
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      console.log("File selected via input:", selectedFile);
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
      console.log("File dropped:", droppedFile);
      handleFileSelect(droppedFile);
    } else {
      toast.error("No valid file dropped.", { autoClose: 3000 });
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      console.log("Triggering file input click");
      fileInputRef.current.value = null;
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
      toast.error("Please select an image to upload.", { autoClose: 3000 });
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    // Simulate progress for demo purposes
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/products/${product.id}/upload`, {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.detail || "Failed to upload image.");
      }

      toast.success("Image uploaded successfully.", { autoClose: 2000 });
      onUpload(product.id, responseData.thumbnail);
      setFile(null);
      setPreview(`${API_URL}${responseData.thumbnail}`);
    } catch (error) {
      console.error("Upload error:", error.message);
      toast.error(`Upload failed: ${error.message}. Please try again.`, {
        autoClose: 3000,
      });
    } finally {
      clearInterval(interval);
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handlePrevious = () => {
    if (!isFirstProduct && totalProducts > 0) {
      const previousProduct = products[currentProductIndex - 1];
      console.log("Navigating to previous:", previousProduct);
      window.dispatchEvent(new CustomEvent("openImageModal", { detail: previousProduct }));
      toast.info(`Viewing ${previousProduct.itemcode}`, { autoClose: 2000 });
    }
  };

  const handleNext = () => {
    if (!isLastProduct && totalProducts > 0) {
      const nextProduct = products[currentProductIndex + 1];
      console.log("Navigating to next:", nextProduct);
      window.dispatchEvent(new CustomEvent("openImageModal", { detail: nextProduct }));
      toast.info(
        <span>
          Viewing <strong>{nextProduct.itemcode}</strong>
        </span>,
        { autoClose: 2000 }
      );
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
        transition: "opacity 0.3s ease-in",
        opacity: show ? 1 : 0,
      }}
      role="dialog"
      aria-labelledby="upload-modal-title"
      aria-modal="true"
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          padding: "24px",
          width: "100%",
          maxWidth: "480px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          transition: "transform 0.3s ease-out",
          transform: show ? "translateY(0)" : "translateY(-20px)",
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
            style={{
              fontSize: "1.5rem",
              fontWeight: 100,
              color: "#1a202c",
              margin: 0,
            }}
          >
            Upload Image For : <strong>{product.itemcode}</strong>
          </h1>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.25rem",
              color: "#4a5568",
              cursor: "pointer",
              padding: "4px",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#2d3748")}
            onMouseOut={(e) => (e.currentTarget.style.color = "#4a5568")}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Navigation Info */}
        {totalProducts > 1 && (
          <div
            style={{
              textAlign: "center",
              marginBottom: "16px",
              color: "#4a5568",
              fontSize: "0.875rem",
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
          aria-label="Select or drop an image to upload"
          style={{
            border: dragActive ? "2px dashed #3182ce" : "2px dashed #e2e8f0",
            borderRadius: "8px",
            padding: "24px",
            textAlign: "center",
            background: dragActive ? "rgba(49, 130, 206, 0.05)" : "#fff",
            cursor: "pointer",
            transition: "border-color 0.2s, background 0.2s",
            marginBottom: "20px",
          }}
          onMouseOver={(e) => {
            if (!dragActive) e.currentTarget.style.borderColor = "#90cdf4";
          }}
          onMouseOut={(e) => {
            if (!dragActive) e.currentTarget.style.borderColor = "#e2e8f0";
          }}
          onFocus={(e) => {
            if (!dragActive) e.currentTarget.style.borderColor = "#3182ce";
          }}
          onBlur={(e) => {
            if (!dragActive) e.currentTarget.style.borderColor = "#e2e8f0";
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
              color: dragActive ? "#3182ce" : "#4a5568",
              fontSize: "1rem",
              fontWeight: 500,
            }}
          >
            {dragActive
              ? "Drop your image here"
              : "Drag and drop or click to select an image"}
          </p>
          <p
            style={{
              margin: "8px 0 0",
              color: "#718096",
              fontSize: "0.875rem",
            }}
          >
            Supported formats: JPG, PNG, GIF | Max size: 2MB
          </p>
        </div>

        {/* Preview */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "20px",
            minHeight: "128px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {preview ? (
            <img
              src={preview}
              alt="Selected image preview"
              style={{
                width: "128px",
                height: "128px",
                objectFit: "cover",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                transition: "opacity 0.2s ease",
              }}
              onError={() => {
                console.error("Failed to load preview:", preview);
                toast.error("Failed to load image preview.", { autoClose: 3000 });
                setPreview("");
              }}
            />
          ) : (
            <div
              style={{
                width: "128px",
                height: "128px",
                background: "#edf2f7",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#718096",
                fontSize: "0.875rem",
                border: "1px solid #e2e8f0",
              }}
            >
              No Image
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginBottom: "20px",
            position: "relative",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              background: "#edf2f7",
              border: "none",
              borderRadius: "6px",
              color: "#4a5568",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#e2e8f0";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#edf2f7";
            }}
            onFocus={(e) => {
              e.currentTarget.style.background = "#e2e8f0";
            }}
            onBlur={(e) => {
              e.currentTarget.style.background = "#edf2f7";
            }}
            aria-label="Cancel upload"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !file}
            style={{
              padding: "10px 20px",
              background: loading || !file ? "#e2e8f0" : "#3182ce",
              color: loading || !file ? "#a0aec0" : "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: loading || !file ? "not-allowed" : "pointer",
              transition: "background 0.2s",
              position: "relative",
            }}
            onMouseOver={(e) => {
              if (!loading && file) e.currentTarget.style.background = "#2b6cb0";
            }}
            onMouseOut={(e) => {
              if (!loading && file) e.currentTarget.style.background = "#3182ce";
            }}
            onFocus={(e) => {
              if (!loading && file) e.currentTarget.style.background = "#2b6cb0";
            }}
            onBlur={(e) => {
              if (!loading && file) e.currentTarget.style.background = "#3182ce";
            }}
            aria-label="Upload image"
          >
            {loading ? (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "24px",
                  height: "24px",
                }}
              >
                <svg viewBox="0 0 24 24" style={{ width: "100%", height: "100%" }}>
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="#a0aec0"
                    strokeWidth="3"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="#3182ce"
                    strokeWidth="3"
                    strokeDasharray={`${(uploadProgress / 100) * 62.8} 62.8`}
                    transform="rotate(-90 12 12)"
                  />
                </svg>
                <span
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    fontSize: "0.75rem",
                    color: "#4a5568",
                  }}
                >
                  {uploadProgress}%
                </span>
              </div>
            ) : (
              "Upload"
            )}
          </button>
        </div>

        {/* Navigation Buttons */}
        {totalProducts > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <button
              onClick={handlePrevious}
              disabled={isFirstProduct || !totalProducts}
              style={{
                flex: 1,
                padding: "10px 20px",
                background: isFirstProduct || !totalProducts ? "#e2e8f0" : "#3182ce",
                color: isFirstProduct || !totalProducts ? "#a0aec0" : "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: isFirstProduct || !totalProducts ? "not-allowed" : "pointer",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) => {
                if (!isFirstProduct && totalProducts) {
                  e.currentTarget.style.background = "#2b6cb0";
                }
              }}
              onMouseOut={(e) => {
                if (!isFirstProduct && totalProducts) {
                  e.currentTarget.style.background = "#3182ce";
                }
              }}
              onFocus={(e) => {
                if (!isFirstProduct && totalProducts) {
                  e.currentTarget.style.background = "#2b6cb0";
                }
              }}
              onBlur={(e) => {
                if (!isFirstProduct && totalProducts) {
                  e.currentTarget.style.background = "#3182ce";
                }
              }}
              aria-label="View previous product"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={isLastProduct || !totalProducts}
              style={{
                flex: 1,
                padding: "10px 20px",
                background: isLastProduct || !totalProducts ? "#e2e8f0" : "#3182ce",
                color: isLastProduct || !totalProducts ? "#a0aec0" : "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: isLastProduct || !totalProducts ? "not-allowed" : "pointer",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) => {
                if (!isLastProduct && totalProducts) {
                  e.currentTarget.style.background = "#2b6cb0";
                }
              }}
              onMouseOut={(e) => {
                if (!isLastProduct && totalProducts) {
                  e.currentTarget.style.background = "#3182ce";
                }
              }}
              onFocus={(e) => {
                if (!isLastProduct && totalProducts) {
                  e.currentTarget.style.background = "#2b6cb0";
                }
              }}
              onBlur={(e) => {
                if (!isLastProduct && totalProducts) {
                  e.currentTarget.style.background = "#3182ce";
                }
              }}
              aria-label="View next product"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <style>
        {`
          @media (max-width: 520px) {
            div[role="dialog"] > div {
              width: 90%;
              padding: 16px;
            }
            h2 {
              font-size: 1.25rem;
            }
            button {
              padding: 8px 16px;
              font-size: 0.875rem;
            }
            div[role="button"] {
              padding: 16px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ImageUploadModal;