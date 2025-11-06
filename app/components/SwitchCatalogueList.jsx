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
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogues();
  }, [refreshCatalogues]);

  // Extract unique categories and brands
  const categories = ["All", ...new Set(data.map((item) => item.category))];
  const brands = ["All", ...new Set(data.map((item) => item.brand))];

  // Filter logic
  useEffect(() => {
    let filtered = data;

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    if (selectedBrand !== "All") {
      filtered = filtered.filter((item) => item.brand === selectedBrand);
    }

    setFilteredData(filtered);
  }, [searchTerm, selectedCategory, selectedBrand, data]);

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
      <div className="d-flex justify-content-center align-items-center py-2">
        <p className="text-dark mb-0">Loading catalogues...</p>
      </div>
    );

  if (error)
    return (
      <div className="d-flex justify-content-center align-items-center py-2">
        <p className="text-danger mb-0 me-2">{error}</p>
        <button onClick={fetchCatalogues} className="btn btn-dark btn-sm">
          Retry
        </button>
      </div>
    );

  return (
    <>
      <div className="card shadow-sm border-0">
        <div className="card-body p-2">
          {/* 🔍 Search & Filter Bar */}
          <div className="row g-2 mb-2 align-items-center">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <select
                className="form-select form-select-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <select
                className="form-select form-select-sm"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
              >
                {brands.map((brand, index) => (
                  <option key={index} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 📄 Table */}
          <div className="table-responsive">
            <table
              className="table table-bordered table-hover table-sm mb-0 text-dark align-middle"
              style={{ fontSize: "0.85rem" }}
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
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.brand}</td>
                    <td>{item.createdBy}</td>
                    <td>{item.createdAt}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-outline-success btn-sm py-0 px-1"
                        style={{ fontSize: "0.75rem" }}
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
                        className="btn btn-outline-dark btn-sm py-0 px-1"
                        style={{ fontSize: "0.75rem" }}
                      >
                        View
                      </a>
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => onEdit(item)}
                        className="btn btn-outline-primary btn-sm py-0 px-1 me-1"
                        style={{ fontSize: "0.75rem" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="btn btn-outline-danger btn-sm py-0 px-1"
                        style={{ fontSize: "0.75rem" }}
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
                className="text-center text-secondary py-2 mb-0"
                style={{ fontSize: "0.85rem" }}
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
                <label className="form-label" style={{ fontSize: "0.9rem" }}>
                  Enter Client’s Mobile Number (with country code):
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
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
