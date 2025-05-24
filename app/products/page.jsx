"use client";
import { useState } from "react";
import AddProductForm from "../components/AddProductForm";
import CategoryTable from "../components/CategoryTable";
import SubcategoryTable from "../components/SubcategoryTable";
import ProductsTable from "../components/ProductsTable";


const Products = () => {
  const [showModal, setShowModal] = useState(false);
  const [showModalClientDetails, setShowModalClientDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("products");

  return (
    <>
      <div className="mini_banner warehouse no-print">
        <div className="content_box">
          <div>
            <h2 className="title">Products</h2>
            <p className="description">Add/Edit Your Products</p>
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
            Category
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "subcategory" ? "active" : ""}`}
            onClick={() => setActiveTab("subcategory")}
          >
            Subcategory
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "products" && (
          <div className="tab-pane fade show active">
            <ProductsTable />
          </div>
        )}
        {activeTab === "category" && (
          <div className="tab-pane fade show active">
           <CategoryTable /> 
          </div>
        )}
        {activeTab === "subcategory" && (
          <div className="tab-pane fade show active">
           <SubcategoryTable />
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Products;
