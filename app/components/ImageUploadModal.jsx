"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ImageUploadModal = ({ show, onClose, product, onUpload }) => {
  const [image, setImage] = useState(product?.thumbnail || "");
  const [preview, setPreview] = useState(product?.thumbnail || "");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      // Validate file type and size (limit to 2MB)
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed!");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be under 2MB!");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!image) {
      toast.error("Please select an image!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/products/${product.id}`, {
        method: "PATCH", // Use PATCH for updating a single field
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ thumbnail: image }),
      });

      if (!response.ok) {
        throw new Error("Failed to update image!");
      }

      toast.success("Image updated successfully!");
      onUpload(product.id, image); // Update parent state
      onClose();
    } catch (error) {
      toast.error(error.message);
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
              disabled={loading || !image}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;
