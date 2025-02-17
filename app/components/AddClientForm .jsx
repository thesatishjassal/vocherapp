"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import ClientDetailsModal from "../components/ClientDetailsModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import GetClients from "./getClients";

// Validation schema with Yup
const validationSchema = Yup.object({
  Client_Name: Yup.string().required("Client Name is required"),
  Address: Yup.string().required("Address is required"),
  GST_Number: Yup.string().required("GST Number is required"),
  Client_Phone: Yup.string()
    .required("Contact Number is required"),
  Client_Email: Yup.string().email("Invalid email format").required("Email is required"),
  Client_Type: Yup.string().required("Client Type is required"),
  BuisnessName: Yup.string().required("Business Name is required"),
  Pincode: Yup.string().required("Pincode is required"),
  City: Yup.string().required("City is required"),
  State: Yup.string().required("State is required"),
});

const AddClientForm = () => {
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const formik = useFormik({
    initialValues: {
      Client_Name: "",
      Address: "",
      GST_Number: "",
      Client_Phone: "",
      Client_Email: "",
      Client_Type: "",
      BuisnessName: "",
      Pincode: "",
      City: "",
      State: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        console.log("Form values:", values);
        const response = await axios.post("http://147.93.107.232:5500/clients/", values);
        toast.success("Client added successfully!");

        setClients((prevClients) => [...prevClients, response.data]);
        resetForm(); // Reset form on success
        setShowModal(false);
      } catch (error) {
        console.error("Add client error:", error);
        if(error.response.data.detail =="Phone Number alredy exist!"){
          toast.error("Phone Number already exists!");
        }
        else toast.error("Failed to add client. Please try again.");
      }
    },
  });

  const handleChange = (e) => {
    formik.handleChange(e);
  };



  return (
    <div className="container mt-2 px-0">
      <div className="row container mx-auto my-3 p-0">
        <div className="col-12 p-0">
          <div className="card mb-4">
            <div className="card-header pb-0">
              <h6>Client Invoices</h6>
            </div>
            <div className="card-body py-0 pt-0 pb-2">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <input
                  type="text"
                  placeholder="Search by Client or Project"
                  className="form-control w-25"
                  value={formik.values.searchTerm}
                  onChange={formik.handleChange}
                />
             
                <button
                  className="btn add_warehouse btn-primary"
                  onClick={() => setShowModal(true)}
                >
                  Add New
                </button>
              </div>
              <GetClients />
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
                  <div className="modal-dialog addclientform">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h1
                          className="modal-title fs-5"
                          id="staticBackdropLabel"
                        >
                          Add New Client
                        </h1>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setShowModal(false)}
                          aria-label="Close"
                        >×</button>
                      </div>
                      <div className="modal-body  py-3 ">
                        <form onSubmit={formik.handleSubmit} className="row g-2">
                          {/* Business Details Field Group */}
                          <fieldset className="col-12">
                            <legend className="fs-5 my-2">Business Details</legend>
                            <div className="row">
                              <div className="col-md-6">
                                <input
                                  type="text"
                                  name="BuisnessName"
                                  placeholder="Business Name"
                                  value={formik.values.BuisnessName}
                                  onChange={handleChange}
                                  className={`form-control mb-0 ${
                                    formik.touched.BuisnessName && formik.errors.BuisnessName
                                      ? "border-danger"
                                      : ""
                                  }`}
                                />
                                {/* {formik.touched.BuisnessName && formik.errors.BuisnessName && (
                                  <label className="text-danger">{formik.errors.BuisnessName}</label>
                                )} */}
                              </div>
                              <div className="col-md-6">
                                <input
                                  type="text"
                                  name="GST_Number"
                                  placeholder="GST Number"
                                  value={formik.values.GST_Number}
                                  onChange={handleChange}
                                  className={`form-control mb-0 ${
                                    formik.touched.GST_Number && formik.errors.GST_Number
                                      ? "border-danger"
                                      : ""
                                  }`}
                                />
                                {/* {formik.touched.GST_Number && formik.errors.GST_Number && (
                                  <label className="text-danger">{formik.errors.GST_Number}</label>
                                )} */}
                              </div>
                              <div className="col-md-6">
                                <input
                                  type="text"
                                  name="Address"
                                  placeholder="Address"
                                  value={formik.values.Address}
                                  onChange={handleChange}
                                  className={`form-control mb-0 ${
                                    formik.touched.Address && formik.errors.Address
                                      ? "border-danger"
                                      : ""
                                  }`}
                                />
                                {/* {formik.touched.Address && formik.errors.Address && (
                                  <label className="text-danger">{formik.errors.Address}</label>
                                )} */}
                              </div>
                              <div className="col-md-6">
                                <input
                                  type="text"
                                  name="Pincode"
                                  placeholder="Pincode"
                                  value={formik.values.Pincode}
                                  onChange={handleChange}
                                  className={`form-control mb-0 ${
                                    formik.touched.Pincode && formik.errors.Pincode
                                      ? "border-danger"
                                      : ""
                                  }`}
                                />
                                {/* {formik.touched.Pincode && formik.errors.Pincode && (
                                  <label className="text-danger">{formik.errors.Pincode}</label>
                                )} */}
                              </div>
                              <div className="col-md-6">
                                <input
                                  type="text"
                                  name="City"
                                  placeholder="City"
                                  value={formik.values.City}
                                  onChange={handleChange}
                                  className={`form-control mb-0 ${
                                    formik.touched.City && formik.errors.City
                                      ? "border-danger"
                                      : ""
                                  }`}
                                />
                                {/* {formik.touched.City && formik.errors.City && (
                                  <label className="text-danger">{formik.errors.City}</label>
                                )} */}
                              </div>
                              <div className="col-md-6">
                                <input
                                  type="text"
                                  name="State"
                                  placeholder="State"
                                  value={formik.values.State}
                                  onChange={handleChange}
                                  className={`form-control mb-0 ${
                                    formik.touched.State && formik.errors.State
                                      ? "border-danger"
                                      : ""
                                  }`}
                                />
                                {/* {formik.touched.State && formik.errors.State && (
                                  <label className="text-danger">{formik.errors.State}</label>
                                )} */}
                              </div>
                            </div>
                          </fieldset>

                          {/* Contact Details Field Group */}
                          <fieldset className="col-12">
                            <legend className="fs-5 my-2">Contact Details</legend>
                            <div className="row">
                              <div className="col-md-6">
                                <input
                                  type="text"
                                  name="Client_Name"
                                  placeholder="Client Name"
                                  value={formik.values.Client_Name}
                                  onChange={handleChange}
                                  className={`form-control mb-0 ${
                                    formik.touched.Client_Name && formik.errors.Client_Name
                                      ? "border-danger"
                                      : ""
                                  }`}
                                />
                                {/* {formik.touched.Client_Name && formik.errors.Client_Name && (
                                  <label className="text-danger">{formik.errors.Client_Name}</label>
                                )} */}
                              </div>
                              <div className="col-md-6">
                                <input
                                  type="tel"
                                  name="Client_Phone"
                                  placeholder="Contact Number"
                                  value={formik.values.Client_Phone}
                                  onChange={handleChange}
                                  className={`form-control mb-0 ${
                                    formik.touched.Client_Phone && formik.errors.Client_Phone
                                      ? "border-danger"
                                      : ""
                                  }`}
                                />
                                {/* {formik.touched.Client_Phone && formik.errors.Client_Phone && (
                                  <label className="text-danger">{formik.errors.Client_Phone}</label>
                                )} */}
                              </div>
                              <div className="col-md-6">
                                <input
                                  type="email"
                                  name="Client_Email"
                                  placeholder="Email Address"
                                  value={formik.values.Client_Email}
                                  onChange={handleChange}
                                  className={`form-control mb-0 ${
                                    formik.touched.Client_Email && formik.errors.Client_Email
                                      ? "border-danger"
                                      : ""
                                  }`}
                                />
                                {/* {formik.touched.Client_Email && formik.errors.Client_Email && (
                                  <label className="text-danger">{formik.errors.Client_Email}</label>
                                )} */}
                              </div>
                              <div className="col-md-6 mt-2">
                                <select
                                  name="Client_Type"
                                  value={formik.values.Client_Type}
                                  onChange={handleChange}
                                  className={`form-select ${
                                    formik.touched.Client_Type && formik.errors.Client_Type
                                      ? "border-danger"
                                      : ""
                                  }`}
                                >
                                  <option disabled>Select Client Type</option>
                                  <option value="Retail">Vendor</option>
                                  <option value="Wholesale">Customer</option>
                                  <option value="Other">Other</option>
                                </select>
                                {/* {formik.touched.Client_Type && formik.errors.Client_Type && (
                                  <label className="text-danger">{formik.errors.Client_Type}</label>
                                )} */}
                              </div>
                            </div>
                          </fieldset>

                          {/* Form Footer */}
                          <div className="modal-footer col-12">
                            <div className="text-end">
                              <button
                                type="button"
                                className="btn btn-secondary ms-2"
                                onClick={() => setShowModal(false)}
                              >
                                Cancel
                              </button>
                              <button type="submit" className="btn btn-success">
                                Add Client
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddClientForm;
