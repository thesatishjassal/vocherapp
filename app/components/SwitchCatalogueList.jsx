"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const CatalogueList = ({ refreshCatalogues, onEdit, onDelete }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCatalogue, setSelectedCatalogue] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [clientNumber, setClientNumber] = useState("");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);

  const fetchCatalogues = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://api.panvic.in/catalogues/list");
      const formattedData = response.data.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category || "N/A",
        brand: item.brand || "N/A",
        createdBy: item.created_by,
        createdAt: new Date(item.created_at).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        googleDriveUrl: item.google_drive_url,
      }));
      setData(formattedData);
      setFilteredData(formattedData);
      setError(null);
    } catch (err) {
      const message = err.response?.data?.detail || "Failed to fetch catalogues.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogues();
  }, [refreshCatalogues]);

  // Unique lists
  const categories = [...new Set(data.map((item) => item.category))];
  const brands = [...new Set(data.map((item) => item.brand))];

  // Filtering Logic
  useEffect(() => {
    let filtered = data;

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((item) =>
        selectedCategories.includes(item.category)
      );
    }

    if (selectedBrands.length > 0) {
      filtered = filtered.filter((item) =>
        selectedBrands.includes(item.brand)
      );
    }

    setFilteredData(filtered);
  }, [searchTerm, selectedCategories, selectedBrands, data]);

  const toggleSelection = (value, setFunction, selectedList) => {
    if (selectedList.includes(value)) {
      setFunction(selectedList.filter((v) => v !== value));
    } else {
      setFunction([...selectedList, value]);
    }
  };

  const openWhatsAppModal = (catalogue) => {
    setSelectedCatalogue(catalogue);
    setShowModal(true);
    setClientNumber("");
  };

  const sendWhatsAppMessage = () => {
    if (!clientNumber || clientNumber.length < 10) {
      toast.error("Please enter a valid mobile number.");
      return;
    }

    const message = `Hello! 👋
I'm sharing a catalogue with you from *Panvik Lighting*.

📘 *Catalogue Name:* ${selectedCatalogue.name}
🏷️ *Category:* ${selectedCatalogue.category}
🔗 View it here: ${selectedCatalogue.googleDriveUrl}

If you’d like more information or a custom design, feel free to reply on WhatsApp.`;

    const whatsappLink = `https://wa.me/${clientNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, "_blank");
    setShowModal(false);
    toast.success("Redirecting to WhatsApp...");
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center py-3">
        <p className="text-dark fs-6 mb-0">Loading catalogues...</p>
      </div>
    );

  if (error)
    return (
      <div className="d-flex justify-content-center align-items-center py-3">
        <p className="text-danger mb-0 me-2 fs-6">{error}</p>
        <button onClick={fetchCatalogues} className="btn btn-dark btn-sm">
          Retry
        </button>
      </div>
    );

  return (
    <>
      <div className="card shadow-sm border-0">
        <div className="card-body p-3">
          {/* 🔍 Search & Filter Bar */}
          <div className="mb-3">
            <div className="row g-3 align-items-start">
              {/* Search */}
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="🔍 Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Category Filters */}
              <div className="col-md-4">
                <div>
                  <strong className="d-block mb-1 fs-6 text-dark">
                    Filter by Category:
                  </strong>
                  <div className="d-flex flex-wrap gap-2">
                    {categories.map((cat, i) => (
                      <div key={i} className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`cat-${i}`}
                          checked={selectedCategories.includes(cat)}
                          onChange={() =>
                            toggleSelection(cat, setSelectedCategories, selectedCategories)
                          }
                        />
                        <label
                          className="form-check-label fs-6 text-dark"
                          htmlFor={`cat-${i}`}
                        >
                          {cat}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Brand Filters */}
              <div className="col-md-4">
                <div>
                  <strong className="d-block mb-1 fs-6 text-dark">
                    Filter by Brand:
                  </strong>
                  <div className="d-flex flex-wrap gap-2">
                    {brands.map((brand, i) => (
                      <div key={i} className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`brand-${i}`}
                          checked={selectedBrands.includes(brand)}
                          onChange={() =>
                            toggleSelection(brand, setSelectedBrands, selectedBrands)
                          }
                        />
                        <label
                          className="form-check-label fs-6 text-dark"
                          htmlFor={`brand-${i}`}
                        >
                          {brand}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 📄 Table */}
          <div className="table-responsive">
            <table
              className="table table-bordered table-hover mb-0 text-dark align-middle"
              style={{ fontSize: "0.95rem" }}
            >
              <thead className="table-light">
                <tr>
                  <th>SR</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Created By</th>
                  <th>Created At</th>
                  <th className="text-center">Share</th>
                  <th className="text-center">File</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, i) => (
                  <tr key={item.id}>
                    <td>{i + 1}</td>
                    <td className="fw-semibold">{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.brand}</td>
                    <td>{item.createdBy}</td>
                    <td>{item.createdAt}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-outline-success btn-sm py-1 px-2"
                        onClick={() => openWhatsAppModal(item)}
                      >
                        WhatsApp
                      </button>
                    </td>
                    <td className="text-center">
                      <a
                        href={item.googleDriveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-dark btn-sm py-1 px-2"
                      >
                        View
                      </a>
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => onEdit(item)}
                        className="btn btn-outline-primary btn-sm py-1 px-2 me-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="btn btn-outline-danger btn-sm py-1 px-2"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredData.length === 0 && (
              <p
                className="text-center text-secondary py-3 mb-0"
                style={{ fontSize: "0.95rem" }}
              >
                No catalogues found.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 📱 WhatsApp Share Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header py-2">
                <h6 className="modal-title">Share Catalogue on WhatsApp</h6>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <label className="form-label fs-6">
                  Enter Client’s Mobile Number (with country code):
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="e.g. 919876543210"
                  value={clientNumber}
                  onChange={(e) => setClientNumber(e.target.value)}
                />
              </div>
              <div className="modal-footer py-2">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  onClick={sendWhatsAppMessage}
                >
                  Send on WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CatalogueList;
