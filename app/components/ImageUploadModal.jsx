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

  return (
    <div className={`modal fade ${show ? "show d-block" : "d-none"}`} tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Upload Product Image</h5>
            <button type="button" className="close" onClick={onClose} aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <div className="modal-body">
            <input type="file" accept="image/*" onChange={handleFileChange} className="form-control" />
            {preview && (
              <div className="preview mt-3 text-center">
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
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={!image}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;
