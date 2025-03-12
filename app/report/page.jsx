"use client";
import { useState } from "react";
import AddProductForm from "../components/AddProductForm";
import CategoryTable from "../components/CategoryTable";
import SubcategoryTable from "../components/SubcategoryTable";
import OutvoucherReport from "../components/outvocuherReport";
import ProductsReport from '../components/productsReport';
import InvoucherReoprt from '../components/InvoucherReoprt';

const Report = () => {
  const [showModal, setShowModal] = useState(false);
  const [showModalClientDetails, setShowModalClientDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("products");

  return (
    <>
      <div className="mini_banner warehouse">
        <div className="content_box">
          <div>
            <h2 className="title">Reports</h2>
          </div>
        </div>
      </div>
      <div className="container my-4 p-0">
      {/* Nav Tabs */}
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            Products
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "category" ? "active" : ""}`}
            onClick={() => setActiveTab("category")}
          >
            Invoucher Reoprt
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "subcategory" ? "active" : ""}`}
            onClick={() => setActiveTab("subcategory")}
          >
            Outvocuher Report
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "products" && (
          <div className="tab-pane fade show active">
            <ProductsReport />
          </div>
        )}
        {activeTab === "category" && (
          <div className="tab-pane fade show active">
           <InvoucherReoprt /> 
          </div>
        )}
        {activeTab === "subcategory" && (
          <div className="tab-pane fade show active">
           <OutvoucherReport />
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Report;
