"use client";
import React, { useState } from "react";
import ClientDetailsModal from "../components/ClientDetailsModal";

const AddClientForm = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState({
    clientName: "",
    address: "",
    gstNumber: "",
    contactNumber: "",
    emailAddress: "",
    clientType: "Retail",
    businessName: "", // New field for Business Name
    pincode: "", // New field for Pincode
    city: "", // New field for City
    state: "", // New field for State
  });
  const [showModal, setShowModal] = useState(false);
  const [showModalClientDetails, setShowModalClientDetails] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const invoices = [
    {
      clientName: "ABC Electronics",
      businessName: "ABC Electronics Shop",
      city: "New York",
      state: "NY",
      gstNo: "NY12345GST",
      id: "INV001",
      project: "Fan Supply",
      status: "Paid",
    },
    {
      clientName: "XYZ Electronics",
      businessName: "XYZ Home Appliances",
      city: "Los Angeles",
      state: "CA",
      gstNo: "CA67890GST",
      id: "INV002",
      project: "LED Light Installation",
      status: "Pending",
    },
    {
      clientName: "LMN Electricals",
      businessName: "LMN Electronics",
      city: "Chicago",
      state: "IL",
      gstNo: "IL11223GST",
      id: "INV003",
      project: "Washing Machine Supply",
      status: "Overdue",
    },
    {
      clientName: "PQR Electronics",
      businessName: "PQR Electronics & Appliances",
      city: "San Francisco",
      state: "CA",
      gstNo: "CA44556GST",
      id: "INV004",
      project: "Air Conditioner Installation",
      status: "Paid",
    },
    {
      clientName: "DEF Appliances",
      businessName: "DEF Home Electronics",
      city: "Miami",
      state: "FL",
      gstNo: "FL78901GST",
      id: "INV005",
      project: "Refrigerator Supply",
    },
  ];

  const handleViewClick = (client) => {
    setSelectedClient(client);
    setShowModalClientDetails(true);
  };

  const closeModal = () => {
    setShowModalClientDetails(false);
    setSelectedClient(null);
  };
  // Filter, Search, and Sort Logic
  const filteredInvoices = invoices
    .filter(
      (invoice) =>
        // Check if invoice.name and invoice.project are defined before calling toLowerCase
        ((invoice.name &&
          invoice.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (invoice.project &&
            invoice.project
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))) &&
        // Check if filterStatus is "All" or matches the invoice status
        (filterStatus === "All" || invoice.status === filterStatus)
    )

    .sort((a, b) => {
      if (!sortField) return 0;
      const isAscending = sortOrder === "asc" ? 1 : -1;
      if (typeof a[sortField] === "string") {
        return isAscending * a[sortField].localeCompare(b[sortField]);
      }
      return isAscending * (a[sortField] - b[sortField]);
    });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setClients((prevClients) => [...prevClients, formData]);
    setFormData({
      clientName: "",
      address: "",
      gstNumber: "",
      contactNumber: "",
      emailAddress: "",
      clientType: "Retail",
      businessName: "", // Resetting new fields
      pincode: "", // Resetting new fields
      city: "", // Resetting new fields
      state: "", // Resetting new fields
    });
    setShowModal(false);
  };

  return (
    <div className="container mt-4">
      {/* Table Section */}
      <div className="row container mx-auto my-3">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-3">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search by Client or Project"
              className="form-control w-25"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/* Filter Dropdown */}
            <select
              className="form-select w-25"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>{" "}
            <button
              className="btn btn-primary my-3 addclients"
              onClick={() => setShowModal(true)}
            >
              <i className="fas fa-plus-circle me-2"></i>
            </button>
          </div>

          <div className="card mb-4">
            <div className="card-header pb-0">
              <h6>Client Invoices</h6>
            </div>
            <div className="card-body py-0 pt-0 pb-2">
              {showModalClientDetails && selectedClient && (
                <ClientDetailsModal
                  client={selectedClient} onClose={closeModal}
                />
              )}
              {showModal && (
                <div
                  className="modal fade show"
                  id="staticBackdrop"
                  tabIndex="-1"
                  aria-labelledby="staticBackdropLabel"
                  aria-hidden="true"
                  style={{
                    display: "block",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                  }}
                >
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h1
                          className="modal-title fs-5"
                          id="staticBackdropLabel"
                        >
                          Add Client
                        </h1>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setShowModal(false)}
                          aria-label="Close"
                        ></button>
                      </div>
                      <div className="modal-body  py-3 ">
                        <form onSubmit={handleSubmit} className="row g-2">
                          <div className="col-md-6">
                            <input
                              type="text"
                              name="clientName"
                              placeholder="Client Name"
                              value={formData.clientName}
                              onChange={handleChange}
                              className="form-control"
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <input
                              type="text"
                              name="businessName" // New field for Business Name
                              placeholder="Business Name"
                              value={formData.businessName}
                              onChange={handleChange}
                              className="form-control"
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <input
                              type="text"
                              name="address"
                              placeholder="Address"
                              value={formData.address}
                              onChange={handleChange}
                              className="form-control"
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <input
                              type="text"
                              name="gstNumber"
                              placeholder="GST Number"
                              value={formData.gstNumber}
                              onChange={handleChange}
                              className="form-control"
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <input
                              type="tel"
                              name="contactNumber"
                              placeholder="Contact Number"
                              value={formData.contactNumber}
                              onChange={handleChange}
                              className="form-control"
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <input
                              type="email"
                              name="emailAddress"
                              placeholder="Email Address"
                              value={formData.emailAddress}
                              onChange={handleChange}
                              className="form-control"
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <select
                              name="clientType"
                              value={formData.clientType}
                              onChange={handleChange}
                              className="form-select"
                              required
                            >
                              <option value="Retail">Retail</option>
                              <option value="Wholesale">Wholesale</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div className="col-md-6">
                            <input
                              type="text"
                              name="pincode" // New field for Pincode
                              placeholder="Pincode"
                              value={formData.pincode}
                              onChange={handleChange}
                              className="form-control"
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <input
                              type="text"
                              name="city" // New field for City
                              placeholder="City"
                              value={formData.city}
                              onChange={handleChange}
                              className="form-control"
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <input
                              type="text"
                              name="state" // New field for State
                              placeholder="State"
                              value={formData.state}
                              onChange={handleChange}
                              className="form-control"
                              required
                            />
                          </div>
                          <div className="modal-footer">
                            <div className="col-12 text-end">
                              <button type="submit" className="btn btn-success">
                                Add Client
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary ms-2"
                                onClick={() => setShowModal(false)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="table-responsive p-0">
                <table className="table align-items-center justify-content-center mb-0">
                  <thead>
                    <tr>
                      <th
                        className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
                        onClick={() => {
                          setSortField("id");
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        }}
                      >
                        Client ID{" "}
                        {sortField === "id"
                          ? sortOrder === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th
                        className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
                        onClick={() => {
                          setSortField("name");
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        }}
                      >
                        Client Name{" "}
                        {sortField === "name"
                          ? sortOrder === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th
                        className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
                        onClick={() => {
                          setSortField("businessName");
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        }}
                      >
                        Business Name{" "}
                        {sortField === "businessName"
                          ? sortOrder === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th
                        className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
                        onClick={() => {
                          setSortField("city");
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        }}
                      >
                        City{" "}
                        {sortField === "city"
                          ? sortOrder === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th
                        className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
                        onClick={() => {
                          setSortField("state");
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        }}
                      >
                        State{" "}
                        {sortField === "state"
                          ? sortOrder === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th
                        className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
                        onClick={() => {
                          setSortField("gstNo");
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        }}
                      >
                        GST No{" "}
                        {sortField === "gstNo"
                          ? sortOrder === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice, index) => (
                      <tr key={index}>
                        <td>{invoice.id}</td>
                        <td>{invoice.clientName}</td>
                        <td>{invoice.businessName}</td>
                        <td>{invoice.city}</td>
                        <td>{invoice.state}</td>
                        <td>{invoice.gstNo}</td>
                        <td>
                          <div className="d-flex justify-content-around">
                            <button
                              className="btn action_icons"
                              onClick={() => handleViewClick(invoice)}
                            >
                              <i className="fa fa-eye"></i>
                            </button>
                            <button
                              className="btn action_icons"
                              onClick={() => editClient(invoice.id)}
                            >
                              <i className="fa fa-edit"></i>
                            </button>
                            <button
                              className="btn action_icons"
                              onClick={() => deleteClient(invoice.id)}
                            >
                              <i className="fa fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddClientForm;
