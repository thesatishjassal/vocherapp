"use client";
import { useState } from "react";

const ImageUploadModal = ({ show, onClose, product, onUpload }) => {
  const [image, setImage] = useState(product?.thumbnail || "");
  const [preview, setPreview] = useState(product?.thumbnail || "");

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

  const handleSave = () => {
    onUpload(product.id, image);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h4>Upload Product Image</h4>
        
        <input type="file" accept="image/*" onChange={handleFileChange} className="form-control" />
        
        {preview && (
          <div className="preview mt-3">
            <img
              src={preview}
              alt="Preview"
              width="100"
              height="100"
              style={{ borderRadius: "5px" }}
            />
          </div>
        )}

        <div className="modal-actions mt-3">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!image}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;
