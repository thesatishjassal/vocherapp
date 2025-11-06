"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

const CatalogueUploadModal = ({ showModal, setShowModal, refreshCatalogues, editingItem }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    google_drive_url: "",
    created_by: "",
  });
  const [mode, setMode] = useState("add");  // "add" or "edit"

  useEffect(() => {
    // Try to get the user_details cookie
    const userDetailsCookie = Cookies.get("user_details");
    if (userDetailsCookie) {
      const parsedUser = JSON.parse(userDetailsCookie);
      setUserDetails(parsedUser);
    }
  }, []);

  useEffect(() => {
    if (editingItem) {
      // Populate form for edit
      setFormData({
        name: editingItem.name,
        category: editingItem.category,
        brand: editingItem.brand,
        google_drive_url: editingItem.googleDriveUrl,
        created_by: editingItem.createdBy,
      });
      setMode("edit");
    } else {
      // Reset for add
      setFormData({
        name: "",
        category: "",
        brand: "",
        google_drive_url: "",
        created_by: userDetails?.name || "",
      });
      setMode("add");
    }
  }, [editingItem, userDetails]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.google_drive_url) {
      toast.error("Please fill all required fields");
      return;
    }

    // Basic URL validation
    if (!formData.google_drive_url.startsWith("https://drive.google.com")) {
      toast.error("Please enter a valid Google Drive URL");
      return;
    }

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("category", formData.category);
    submitData.append("brand", formData.brand);
    submitData.append("google_drive_url", formData.google_drive_url);
    if (formData.created_by) {
      submitData.append("created_by", formData.created_by);
    }

    try {
      setIsSubmitting(true);
      let response;
      if (mode === "edit" && editingItem?.id) {
        response = await axios.put(`https://api.panvic.in/catalogues/${editingItem.id}`, submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Catalogue updated successfully!");
      } else {
        response = await axios.post("https://api.panvic.in/catalogues/upload", submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Catalogue added successfully!");
      }
      setShowModal(false);
      refreshCatalogues && refreshCatalogues();
    } catch (error) {
      const message = error.response?.data?.detail || "Failed to save catalogue. Try again.";
      toast.error(message);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {showModal && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            transition: "opacity 0.3s",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4">
              <div className="modal-header border-0 p-4">
                <h1 className="modal-title fs-5">{mode === "edit" ? "Edit Catalogue" : "Add Catalogue"}</h1>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div className="modal-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Name *</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter catalogue name"
                      required
                    />
                  </div>
                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label className="form-label fw-semibold">Category</label>
                      <select
                        name="category"
                        className="form-select"
                        value={formData.category}
                        onChange={handleChange}
                      >
                        <option value="">Select a category</option>
                        <option value="Switches">Switches</option>
                        <option value="Fancy Lights">Fancy Lights</option>
                        <option value="Lights">Lights</option>
                        <option value="Fans">Fans</option>
                      </select>
                    </div>

                    <div className="mb-3 col-md-6">
                      <label className="form-label fw-semibold">Brand</label>
                      <input
                        type="text"
                        name="brand"
                        className="form-control"
                        value={formData.brand}
                        onChange={handleChange}
                        placeholder="e.g. Wipro"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Google Drive URL *</label>
                    <input
                      type="url"
                      name="google_drive_url"
                      className="form-control"
                      value={formData.google_drive_url}
                      onChange={handleChange}
                      placeholder="https://drive.google.com/file/d/..."
                      required
                    />
                    <div className="form-text">Paste the shareable link to your PDF on Google Drive (must be public or shared).</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Created By</label>
                    <input
                      type="text"
                      name="created_by"
                      className="form-control"
                      value={formData.created_by}
                      onChange={handleChange}
                      placeholder="e.g. John Doe or admin@company.com"
                      disabled  // Disabled but still in form for submission
                    />
                    <div className="form-text">Auto-filled from your account. {formData.created_by ? `Current: ${formData.created_by}` : "No user detected—please log in."}</div>
                  </div>

                  <div className="d-flex justify-content-end mt-4">
                    <button
                      type="button"
                      className="btn btn-light me-2"
                      onClick={() => setShowModal(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary px-4"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (mode === "edit" ? "Updating..." : "Adding...") : (mode === "edit" ? "Update Catalogue" : "Add Catalogue")}
                    </button>
                  </div>
                </form>
              </div>
            </div> 
          </div>
        </div>
      )}
    </>
  );
};

export default CatalogueUploadModal;