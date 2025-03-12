"use client";
import { useEffect, useState } from "react";
import DynamicGreeting from "../components/getGreeting";
import axios from "axios";

export default function Home() {
  const [outVoucherLength, setOutVoucherLength] = useState(0);
  const [inVoucherLength, setInVoucherLength] = useState(0);
  const [productsLength, setProductsLength] = useState(0);
  const [quotationLength, setQuotationLength] = useState(0);
  const [clientsLength, setClientsLength] = useState(0);

  useEffect(() => {
    // Fetch Out Vouchers
    axios
      .get("https://api.panvic.in/clients/")
      .then((response) => {
        setClientsLength(response.data.length);
      })
      .catch((error) => {
        console.error("Error fetching out vouchers:", error);
      });

    axios
      .get("https://api.panvic.in/outvouchers/")
      .then((response) => {
        setOutVoucherLength(response.data.length);
      })
      .catch((error) => {
        console.error("Error fetching out vouchers:", error);
      });

    // Fetch In Vouchers
    axios
      .get("https://api.panvic.in/invouchers/")
      .then((response) => {
        setInVoucherLength(response.data.length);
      })
      .catch((error) => {
        console.error("Error fetching in vouchers:", error);
      });

    // Fetch Products
    axios
      .get("https://api.panvic.in/products/")
      .then((response) => {
        setProductsLength(response.data.length);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });

    // Fetch Quotations
    axios
      .get("https://api.panvic.in/quotation/")
      .then((response) => {
        setQuotationLength(response.data.length);
      })
      .catch((error) => {
        console.error("Error fetching quotations:", error);
      });
  }, []);

  return (
    <>
      <div className="row welcome">
        <DynamicGreeting />
        <p className="text-sm mb-0">Let’s make today amazing! 🚀</p>
      </div>
      <div className="row mb-4">
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
                <span className="count text-sm">{clientsLength}</span>
              </div>
            </div>
          </a>
        </div>

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
                <h5 className="font-weight-bolder mb-0 mt-3">Add In Voucher</h5>
                <span className="count text-sm">{inVoucherLength}</span>
              </div>
            </div>
          </a>
        </div>

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
      </div>

      <div className="row my-4 ">
        <div className="col-lg-12 col-md-12 mb-md-0 mb-4">
          <div className="card">
            <div className="card-header pb-0">
              <div className="row">
                <div className="col-lg-6 col-7">
                  <h6>Stocks</h6>
                </div>
              </div>
            </div>
            <div className="card-body pb-2">
              <div className="table-responsive"></div>
            </div>
          </div>
        </div>
        {/* <div className="col-lg-4 col-md-6">
          <div className="card h-100">
            <div className="card-header pb-0">
              <h6>Daily Activity</h6>
              <p className="text-sm">
                <span className="font-weight-bold">By</span> Users
              </p>
            </div>
            <div className="card-body p-3">
              <div className="timeline timeline-one-side mb-4">
                <div className="timeline-block">
                  <span className="timeline-step">
                    <i className="fa fa-file-invoice text-success"></i>
                  </span>
                  <div className="timeline-content">
                    <h6 className="text-primary text-sm mb-1">Voucher</h6>

                    <h6 className="text-dark text-sm font-weight-bold mb-0">
                      $2400, Design changes
                    </h6>
                    <p className="text-secondary font-weight-bold text-xs mt-1 mb-0">
                      Added by: <span className="text-dark">John Doe</span> |
                      <span className="text-dark">22 DEC 2024</span> |
                      <span className="text-dark">7:20 PM</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="timeline timeline-one-side mb-4">
                <div className="timeline-block">
                  <span className="timeline-step">
                    <i className="fa fa-box-open text-info"></i>
                  </span>
                  <div className="timeline-content">
                    <h6 className="text-primary text-sm mb-1">Stock Item</h6>
                    <h6 className="text-dark text-sm font-weight-bold mb-0">
                      Stock replenished
                    </h6>
                    <p className="text-secondary font-weight-bold text-xs mt-1 mb-0">
                      Added by: <span className="text-dark">Jane Smith</span> |
                      <span className="text-dark">21 DEC 2024</span> | Time:{" "}
                      <span className="text-dark">9:34 PM</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="timeline timeline-one-side mb-4">
                <div className="timeline-block">
                  <span className="timeline-step">
                    <i className="fa fa-user-plus text-primary"></i>
                  </span>
                  <div className="timeline-content">
                    <h6 className="text-primary text-sm mb-1">Client</h6>
                    <h6 className="text-dark text-sm font-weight-bold mb-0">
                      New client added
                    </h6>
                    <p className="text-secondary font-weight-bold text-xs mt-1 mb-0">
                      Added by: <span className="text-dark">Michael Brown</span>{" "}
                      | <span className="text-dark">18 DEC 2024</span> | Time:{" "}
                      <span className="text-dark">4:54 AM</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </>
  );
}
