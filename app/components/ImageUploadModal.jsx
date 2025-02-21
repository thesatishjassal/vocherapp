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
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setImage(reader.result); // Store base64 string
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
        method: "PUT",
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
      className={`modal fade ${show ? "show" : ""}`}
      tabIndex="-1"
      aria-hidden={!show}
      style={{
        display: show ? "block" : "none",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Upload Product Image</h5>
            <button type="button" className="btn-close" onClick={onClose}>
              ×
            </button>
          </div>

          <div className="modal-body">
            {/* File Input */}
            <div className="mb-3">
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={handleFileChange}
              />
            </div>

            {/* Image Preview */}
            {preview && (
              <div className="text-center">
                <img
                  src={preview}
                  alt="Preview"
                  width="100"
                  height="100"
                  className="rounded"
                />
              </div>
            )}
          </div>

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
