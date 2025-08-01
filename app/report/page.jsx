"use client";
import { useState, useEffect } from "react";
import AddProductForm from "../components/AddProductForm";
import CategoryTable from "../components/CategoryTable";
import SubcategoryTable from "../components/SubcategoryTable";
import OutvoucherReport from "../components/outvocuherReport";
import ProductsReport from "../components/productsReport";
import InvoucherReoprt from "../components/InvoucherReoprt";
import QuotationReportsTable from "../components/QuotationReportsTable";
import Cookies from "js-cookie";

const Report = () => {
  const [showModal, setShowModal] = useState(false);
  const [showModalClientDetails, setShowModalClientDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("products");
  const [userDetails, setUserDetails] = useState(null);

  // ✅ Load user details from cookie on component mount
  useEffect(() => {
    const userDetailsCookie = Cookies.get("user_details");
    if (userDetailsCookie) {
      try {
        setUserDetails(JSON.parse(userDetailsCookie));
      } catch (error) {
        console.error("Failed to parse user details:", error);
      }
    }
  }, []);

  const role = userDetails?.role || "";
  const isSalesExecutiveOrArchitect =
    role === "Sales Executive" || role === "Architect";
  const isStockManager = role === "Stock Manager";
  const isAdmin = role === "Admin" || role === "admin";

  return (
    <>
      <div className="mini_banner reports">
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
              Products Reports
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "category" ? "active" : ""}`}
              onClick={() => setActiveTab("category")}
            >
              Invoucher Reports
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "subcategory" ? "active" : ""}`}
              onClick={() => setActiveTab("subcategory")}
            >
              Outvoucher Reports
            </button>
          </li>
            {(isAdmin || isSalesExecutiveOrArchitect) && (
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "QuotationReports" ? "active" : ""}`}
              onClick={() => setActiveTab("QuotationReports")}
            >
              Quotation Reports
            </button>
          </li>
            )}
        </ul>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "products" && (
            <div className="tab-pane fade show active">
              {(isAdmin || isStockManager) && <ProductsReport />}
            </div>
          )}
          {activeTab === "category" && (
            <div className="tab-pane fade show active">
              {(isAdmin || isStockManager) && <InvoucherReoprt />}
            </div>
          )}
          {activeTab === "subcategory" && (
            <div className="tab-pane fade show active">
              {(isAdmin || isStockManager) && <OutvoucherReport />}
            </div>
          )}
          {activeTab === "QuotationReports" && (
            <div className="tab-pane fade show active">
              {(isAdmin || isSalesExecutiveOrArchitect) && (
                <QuotationReportsTable />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Report;
