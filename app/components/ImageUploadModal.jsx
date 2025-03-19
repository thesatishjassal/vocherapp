"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const MIN_FILE_SIZE = 500 * 1024; // 500 KB
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 1 MB

const ImageUploadModal = ({ show, onClose, product, onUpload }) => {
  const [file, setFile] = useState(null);
  const ImageUrl = "https://api.panvic.in" + product?.thumbnail;
  const [preview, setPreview] = useState(ImageUrl);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview); // ✅ Prevent memory leaks
      }
    };
  }, [preview]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        toast.error("❌ Only image files are allowed!");
        return;
      }
      // if (selectedFile.size < MIN_FILE_SIZE) {
      //   toast.error("⚠️ File size is too small. Please select an image of at least 500KB.");
      //   return;
      // }
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast.error("⚠️ File size exceeds 2MB. Please select a smaller image.");
        return;
      }

      setPreview(URL.createObjectURL(selectedFile));
      setFile(selectedFile);
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
      formData.append("file", file); // ✅ Ensure correct field name
  
      console.log("Sending FormData:", formData.get("file")); // Debugging Line
  
      const response = await fetch(`${API_URL}/products/${product.id}/upload`, {
        method: "POST",
        body: formData,
      });
  
      console.log("Response Status:", response.status); // Debugging
      const responseData = await response.json();
      console.log("Response Data:", responseData); // Debugging
  
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
            <i class="fa-solid fa-xmark"></i>
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
