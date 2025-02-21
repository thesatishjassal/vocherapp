"use client";
import { useState } from "react";
import FileUploader from "./FileUploader";

const ImageUploadModal = ({ show, onClose, product, onUpload }) => {
  const [image, setImage] = useState(product?.thumbnail || "");

  const handleUpload = (uploadedImage) => {
    setImage(uploadedImage);
  };

  const handleSave = () => {
    onUpload(product.id, image);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h4>Upload Product Image</h4>
        <FileUploader onUpload={handleUpload} />
        {image && (
          <div className="preview mt-3">
            <img
              src={image}
              alt="Uploaded"
              width="100"
              height="100"
              style={{ borderRadius: "5px" }}
            />
          </div>
        )}
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;
