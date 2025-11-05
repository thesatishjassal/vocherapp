"use client";
import { useEffect, useState } from "react";
import DynamicGreeting from "../components/getGreeting";
import axios from "axios";
import Cookies from "js-cookie";

export default function Home() {
  const [outVoucherLength, setOutVoucherLength] = useState(0);
  const [inVoucherLength, setInVoucherLength] = useState(0);
  const [productsLength, setProductsLength] = useState(0);
  const [quotationLength, setQuotationLength] = useState(0);
  const [salesorders, setSalesorder] = useState(0);
  const [clientsLength, setClientsLength] = useState(0);
  const [userDetails, setUserDetails] = useState(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    // Get user details from cookies
    const userDetailsCookie = Cookies.get("user_details");
    if (userDetailsCookie) {
      setUserDetails(JSON.parse(userDetailsCookie));
    }

    // Fetch data from APIs
    axios
      .get(`${API_URL}/clients/`)
      .then((response) => setClientsLength(response.data.length))
      .catch((error) => console.error("Error fetching clients:", error));
    axios
      .get(`${API_URL}/outvouchers/`)
      .then((response) => setOutVoucherLength(response.data.length))
      .catch((error) => console.error("Error fetching out vouchers:", error));
    axios
      .get(`${API_URL}/invouchers/`)
      .then((response) => setInVoucherLength(response.data.length))
      .catch((error) => console.error("Error fetching in vouchers:", error));
    axios
      .get(`${API_URL}/products/`)
      .then((response) => setProductsLength(response.data.length))
      .catch((error) => console.error("Error fetching products:", error));
    axios
      .get(`${API_URL}/quotation/`)
      .then((response) => setQuotationLength(response.data.length))
      .catch((error) => console.error("Error fetching quotations:", error));
    axios
      .get(`${API_URL}/salesorder/`)
      .then((response) => setSalesorder(response.data.length))
      .catch((error) => console.error("Error fetching sales orders:", error));
  }, []); // Removed userDetails from dependencies to avoid infinite loop

  // Define visibility based on role
  const role = userDetails?.role || "";
  const isSalesExecutiveOrArchitect =
    role === "Sales Executive" || role === "Architect";
  const isStockManager = role === "Stock Manager";
  const isAdmin = role === "Admin" || role === "admin";

  return (
    <>
      <div className="row welcome">
        <DynamicGreeting />
      </div>
      
      <div className="row mb-4">
        {(isAdmin || isSalesExecutiveOrArchitect || isStockManager) && (
          <div className="col-lg-2 col-md-4 col-6 mb-3">
            <a href="/addclient">
              <div className="card">
                <span className="mask opacity-10 border-radius-lg"></span>
                <div className="card-body p-3 position-relative text-center">
                  <div className="icon_wrapper">
                    <img
                      src="/assets/img/Businessman-3D-professions-icon-vector.jpg"
                      alt=""
                      className="client_img"
                    />
                  </div>
                  <h5 className="font-weight-bolder mb-0 mt-3">Add Clients</h5>
                  {/* <span className="count text-sm">{clientsLength}</span> */}
                </div>
              </div>
            </a>
          </div>
        )}


        {(isAdmin || isSalesExecutiveOrArchitect || isStockManager) && (
          <div className="col-lg-2 col-md-4 col-6 mb-3">
            <a href="/products">
              <div className="card">
                <span className="mask opacity-10 border-radius-lg"></span>
                <div className="card-body p-3 position-relative text-center">
                  <div className="icon_wrapper">
                    <img
                      src="/assets/img/tag-packages-box-marketing-advertisement-pack-branding-icons-4863042.png"
                      alt=""
                      className="client_img"
                    />
                  </div>
                  <h5 className="font-weight-bolder mb-0 mt-3">Add Stocks</h5>
                  <span className="count text-sm">{productsLength}</span>
                </div>
              </div>
            </a>
          </div>
        )}


        {(isAdmin || isStockManager) && (
          <div className="col-lg-2 col-md-4 col-6 mb-3">
            <a href="/getinvouchers">
              <div className="card">
                <span className="mask opacity-10 border-radius-lg"></span>
                <div className="card-body p-3 position-relative text-center">
                  <div className="icon_wrapper">
                    <img
                      src="/assets/img/file-formats--product-invoice-purchase-record-bill-business-pack-finance-illustrations-4280960.png"
                      alt=""
                      className="client_img"
                    />
                  </div>
                  <h5 className="font-weight-bolder mb-0 mt-3">
                    Add In Voucher
                  </h5>
                  <span className="count text-sm">{inVoucherLength}</span>
                </div>
              </div>
            </a>
          </div>
        )}

        {(isAdmin || isStockManager) && (
          <div className="col-lg-2 col-md-4 col-6 mb-3">
           <a href="/getoutvouchers">
              <div className="card">
                <span className="mask opacity-10 border-radius-lg"></span>
                <div className="card-body p-3 position-relative text-center">
                  <div className="icon_wrapper">
                    <img
                      src="/assets/img/commerce-shopping-icons-6159358.webp"
                      alt=""
                      className="client_img"
                    />
                  </div>
                  <h5 className="font-weight-bolder mb-0 mt-3">Out Voucher</h5>
                  <span className="count text-sm">{outVoucherLength}</span>
                </div>
              </div>
            </a>
          </div>
        )}

        {(isAdmin || isStockManager) && (
          <div className="col-lg-2 col-md-4 col-6 mb-3">
            <a href="/report">
              <div className="card">
                <span className="mask opacity-10 border-radius-lg"></span>
                <div className="card-body p-3 position-relative text-center">
                  <div className="icon_wrapper">
                    <img
                      src="/assets/img/business-report-3d-icon.webp"
                      alt=""
                      className="client_img"
                    />
                  </div>
                  <h5 className="font-weight-bolder mb-0 mt-3">Make Reports</h5>
                  <span className="count text-sm">
                    {clientsLength +
                      inVoucherLength +
                      outVoucherLength +
                      quotationLength +
                      productsLength}
                  </span>
                </div>
              </div>
            </a>
          </div>
        )}

        {(isAdmin || isSalesExecutiveOrArchitect) && (
          <div className="col-lg-2 col-md-4 col-6 mb-3">
            <a href="/getquotation">
              <div className="card">
                <span className="mask opacity-10 border-radius-lg"></span>
                <div className="card-body p-3 position-relative text-center">
                  <div className="icon_wrapper">
                    <img
                      src="/assets/img/transaction-payment-purchase-business.webp"
                      alt=""
                      className="client_img"
                    />
                  </div>
                  <h5 className="font-weight-bolder mb-0 mt-3">Quotation</h5>
                  <span className="count text-sm">{quotationLength}</span>
                </div>
              </div>
            </a>
          </div>
        )}

        {(isAdmin || isSalesExecutiveOrArchitect) && (
          <div className="col-lg-2 col-md-4 col-6 mb-3">
            <a href="/saleorders">
              <div className="card">
                <span className="mask opacity-10 border-radius-lg"></span>
                <div className="card-body p-3 position-relative text-center">
                  <div className="icon_wrapper">
                    <img
                      src="/assets/img/transaction-payment-purchase-business.webp"
                      alt=""
                      className="client_img"
                    />
                  </div>
                  <h5 className="font-weight-bolder mb-0 mt-3">Sale Order</h5>
                  <span className="count text-sm">{salesorders}</span>
                </div>
              </div>
            </a>
          </div>
        )}

        {(isAdmin || isSalesExecutiveOrArchitect) && (
          <div className="col-lg-2 col-md-4 col-6 mb-3">
            <a href="/purchase-orders">
              <div className="card">
                <span className="mask opacity-10 border-radius-lg"></span>
                <div className="card-body p-3 position-relative text-center">
                  <div className="icon_wrapper">
                    <img
                      src="/assets/img/purchase_order.png"
                      alt=""
                      className="client_img"
                    />
                  </div>
                  <h5 className="font-weight-bolder mb-0 mt-3">Purchase Order</h5>
                  {/* <span className="count text-sm">{salesorders}</span> */}
                </div>
              </div>
            </a>
          </div>
        )}

        {(isAdmin || isSalesExecutiveOrArchitect) && (
          <div className="col-lg-2 col-md-4 col-6 mb-3">
            <a href="/switchquotation">
              <div className="card">
                <span className="mask opacity-10 border-radius-lg"></span>
                <div className="card-body p-3 position-relative text-center">
                  <div className="icon_wrapper">
                    <img
                      src="/assets/img/transaction-payment-purchase-business.webp"
                      alt=""
                      className="client_img"
                    />
                  </div>
                  <h5 className="font-weight-bolder mb-0 mt-3">Switch Quotation</h5>
                  <span className="count text-sm">{salesorders}</span>
                </div>
              </div>
            </a>
          </div>
        )}

           <div className="col-lg-2 col-md-4 col-6 mb-3">
            <a href="/FancyLightsCatalog">
              <div className="card">
                <span className="mask opacity-10 border-radius-lg"></span>
                <div className="card-body p-3 position-relative text-center">
                  <div className="icon_wrapper">
                    <img
                      src="/assets/img/catalogue.webp"
                      alt=""
                      className="client_img"
                    />
                  </div>
                  <h5 className="font-weight-bolder mb-0 mt-3">Fancy Lights catalogs </h5>
                </div>
              </div>
            </a>
          </div>
          <div className="col-lg-2 col-md-4 col-6 mb-3">
            <a href="/switchquotation">
              <div className="card">
                <span className="mask opacity-10 border-radius-lg"></span>
                <div className="card-body p-3 position-relative text-center">
                  <div className="icon_wrapper">
                    <img
                      src="/assets/img/catalogue.webp"
                      alt=""
                      className="client_img"
                    />
                  </div>
                  <h5 className="font-weight-bolder mb-0 mt-3">All Ligthing catalogs  and Price List</h5>
                  <span className="micro_text">Ledlum, Osram, Philips etc </span>
                </div>
              </div>x
            </a>
          </div>
                    <div className="col-lg-2 col-md-4 col-6 mb-3">
            <a href="/switchquotation">
              <div className="card">
                <span className="mask opacity-10 border-radius-lg"></span>
                <div className="card-body p-3 position-relative text-center">
                  <div className="icon_wrapper">
                    <img
                      src="/assets/img/catalogue.webp"
                      alt=""
                      className="client_img"
                    />
                  </div>
                  <h5 className="font-weight-bolder mb-0 mt-3">All Switches catalogs</h5>
                  <span className="micro_text">Wipro, L&T, Philips etc </span>
                </div>
              </div>
            </a>
          </div>
          
      </div>
    </>
  );
}