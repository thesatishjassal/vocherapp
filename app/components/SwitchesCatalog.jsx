"use client"
import { useState } from "react";
import CatalogueUploadModal from "./CatalogueUploadModal";
import CatalogueList from "./SwitchCatalogueList";

export default function SwitchesCatalog() {
  const [showModal, setShowModal] = useState(false);

  const refreshCatalogues = () => {
    // Fetch updated catalogues again
  };

  return (
    <div className="p-2 md:p-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-left text-base md:text-lg font-semibold">
          All catalogue
        </h4>
        <button className="btn btn-success" onClick={() => setShowModal(true)}>
          + Add Catalogue
        </button>
      </div>

      <CatalogueList />

      <CatalogueUploadModal
        showModal={showModal}
        setShowModal={setShowModal}
        refreshCatalogues={refreshCatalogues}
      />
    </div>
  );
} 
