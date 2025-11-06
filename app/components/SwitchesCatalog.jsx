"use client"
import { useState } from "react";
import CatalogueUploadModal from "./CatalogueUploadModal";
import CatalogueList from "./SwitchCatalogueList";
import axios from "axios";
import { toast } from "react-toastify";

export default function SwitchesCatalog() {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const refreshCatalogues = () => {
    // This will trigger re-fetch in CatalogueList via useEffect
    window.dispatchEvent(new CustomEvent('refreshCatalogues'));
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this catalogue?")) return;
    try {
      await axios.delete(`https://api.panvic.in/catalogues/${id}`);
      toast.success("Catalogue deleted successfully!");
      refreshCatalogues();
    } catch (error) {
      const message = error.response?.data?.detail || "Failed to delete catalogue.";
      toast.error(message);
      console.error(error);
    }
  };

  return (
    <div className="p-2 md:p-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-left text-base md:text-lg font-semibold">
          Switches Catalog
        </h4>
        <button className="btn btn-success" onClick={() => { setEditingItem(null); setShowModal(true); }}>
          + Add Catalogue
        </button>
      </div>

      <CatalogueList 
        refreshCatalogues={refreshCatalogues}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <CatalogueUploadModal
        showModal={showModal}
        setShowModal={setShowModal}
        refreshCatalogues={refreshCatalogues}
        editingItem={editingItem}
      />
    </div>
  );
}