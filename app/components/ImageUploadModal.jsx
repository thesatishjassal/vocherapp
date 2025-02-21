"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const ImageUploadModal = ({ show, onClose, product, onUpload }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(product?.thumbnail || "");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed!");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be under 2MB!");
        return;
      }

      setPreview(URL.createObjectURL(file)); // ✅ Better performance
      setFile(file); // ✅ Store the file
    }
  };

  const handleSave = async () => {
    if (!file) {
      toast.error("Please select an image!");
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

      if (!response.ok) {
        throw new Error("Failed to upload image!");
      }

      const updatedData = await response.json();
      toast.success("Image uploaded successfully!");

      onUpload(product.id, updatedData.thumbnail);
      onClose();
    } catch (error) {
      console.error("Error:", error.message);
      toast.error(error.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`modal ${show ? "d-block" : "d-none"}`}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1050,
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          {/* Modal Header */}
          <div className="modal-header">
            <h5 className="modal-title">Upload Product Image</h5>
            <button type="button" className="btn-close" onClick={onClose}>
              ×
            </button>
          </div>

          {/* Modal Body */}
          <div className="modal-body">
            <div className="mb-3">
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={handleFileChange}
              />
            </div>

            {preview && (
              <div className="text-center">
                <img
                  src={preview}
                  alt="Preview"
                  width="120"
                  height="120"
                  className="rounded border p-1"
                />
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleSave}
              disabled={loading || !file}
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;
