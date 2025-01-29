"use client";
import React, { useState } from "react";
import ClientDetailsModal from "../components/ClientDetailsModal";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import * as yup from "yup";

const productSchema  = yup.object().shape({
  itemCode: yup.string().required("Item Code is required"),
  productName: yup.string().required("Product Name is required"),
  description: yup.string().required("Description is required"),
  unit: yup.string().required("Unit is required"),
  category: yup.string().required("Category is required"),
  subcategory: yup.string().required("Subcategory is required"),
  productPrice: yup
    .number()
    .typeError("Price must be a number")
    .positive("Price must be positive")
    .required("Price is required"),
  stockQuantity: yup
    .number()
    .typeError("Stock must be a number")
    .integer("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .required("Stock Quantity is required"),
  rackCode: yup.string().required("Rack Code is required"),
  productImage: yup
    .mixed()
    .required("Product image is required")
    .test("fileSize", "File size must be less than 2MB", (value) =>
      value && value[0] ? value[0].size <= 2 * 1024 * 1024 : false
    ),
  
  // New Validation for Dropdown Fields
  size: yup.string().required("Size is required"),
  color: yup.string().required("Color is required"),
  model: yup.string().required("Model is required"),
  brand: yup.string().required("Brand is required"),
});

const AddProductForm = () => {
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

  const products = [
    {
      image: "https://picsum.photos/150/150?text=LED+TV",
      clientId: "C001",
      productName: "LED TV",
      category: "Electronics",
      subcategory: "Television",
      price: 500,
      status: "In Stock", // will be updated based on qty
      description: "42-inch LED TV with 4K resolution",
      qty: 20,
      rackCode: "R001",
    },
    {
      image: "https://picsum.photos/150/150?text=Refrigerator",
      clientId: "C002",
      productName: "Refrigerator",
      category: "Home Appliances",
      subcategory: "Cooling",
      price: 800,
      status: "In Stock", // will be updated based on qty
      description: "Energy-efficient 500L refrigerator",
      qty: 15,
      rackCode: "R002",
    },
    {
      image: "https://picsum.photos/150/150?text=Washing+Machine",
      clientId: "C003",
      productName: "Washing Machine",
      category: "Home Appliances",
      subcategory: "Laundry",
      price: 400,
      status: "In Stock", // will be updated based on qty
      description: "Fully automatic washing machine with 7kg capacity",
      qty: 10,
      rackCode: "R003",
    },
    {
      image: "https://picsum.photos/150/150?text=Air+Conditioner",
      clientId: "C004",
      productName: "Air Conditioner",
      category: "Electronics",
      subcategory: "Climate Control",
      price: 600,
      status: "In Stock", // will be updated based on qty
      description: "Split air conditioner with 1.5 ton capacity",
      qty: 25,
      rackCode: "R004",
    },
    {
      image: "https://picsum.photos/150/150?text=Blender",
      clientId: "C005",
      productName: "Blender",
      category: "Kitchen Appliances",
      subcategory: "Cooking",
      price: 50,
      status: "In Stock", // will be updated based on qty
      description: "High-speed blender for smoothies and shakes",
      qty: 50,
      rackCode: "R005",
    },
  ];
  // Update the status based on the qty
  const updatedProducts = products.map((product) => {
    return {
      ...product,
      status: product.qty > 0 ? "In Stock" : "Out of Stock",
    };
  });
  
  console.log(updatedProducts);
  
  
  const handleViewClick = (client) => {
    setSelectedClient(client);
    setShowModalClientDetails(true);
  };

  // Filter, Search, and Sort Logic
// Filter, Search, and Sort Logic
const filteredProducts = products
  .filter(
    (product) =>
      // Check if product.productName and product.category are defined before calling toLowerCase
      ((product.productName &&
        product.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.category &&
          product.category.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      // Check if filterStatus is "All" or matches the product status
      (filterStatus === "All" || product.status === filterStatus)
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(productSchema),
  });

  const onSubmit = (data) => {
    console.log("Product Data Submitted:", data);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      reset();
    }, 2000);
  };

  return (
    <div className="container mt-2 px-0">
      <div className="row container mx-auto my-3 p-0">
        <div className="col-12 p-0">
          <div className="card mb-4">
            <div className="card-header pb-0">
              <h6>Add Products</h6>
            </div>
            <div className="card-body py-0 pt-0 pb-2">
              <div className="d-flex justify-content-between align-items-center mb-3">
                {/* Search Input */}
                <input
                  type="text"
                  placeholder="Search by Client or Project"
                  className="form-control w-25"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <button
                  className="btn add_warehouse btn-primary"
                  onClick={() => setShowModal(true)}
                >
                  Add New
                </button>
              </div>
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
                  <div className="modal-dialog AddProductForm">
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
                        ></button>
                      </div>
                      <div className="modal-body  py-3 ">
                      <form onSubmit={handleSubmit(onSubmit)} className="row g-3">
  <div className="col-md-6 m-0">
    <input
      type="text"
      {...register("itemCode")}
      className="form-control"
      placeholder="Item Code"
    />
  </div>
  <div className="col-md-6 m-0">
    <input
      type="text"
      {...register("productName")}
      className="form-control"
      placeholder="Product Name"
    />
  </div>
  <div className="col-md-12 m-0">
    <textarea
      {...register("description")}
      className="form-control"
      placeholder="Description"
    ></textarea>
  </div>
  <div className="col-md-6 m-0">
    <input
      type="text"
      {...register("category")}
      className="form-control"
      placeholder="Category"
    />
  </div>
  <div className="col-md-6 m-0">
    <input
      type="text"
      {...register("subcategory")}
      className="form-control"
      placeholder="Subcategory"
    />
  </div>
  <div className="col-md-6 m-0">
    <input
      type="number"
      {...register("productPrice")}
      className="form-control"
      placeholder="Product Price"
    />
  </div>
  <div className="col-md-6 m-0">
    <input
      type="number"
      {...register("stockQuantity")}
      className="form-control"
      placeholder="Stock Quantity"
    />
  </div>
  <div className="col-md-6 m-0">
    <input
      type="text"
      {...register("rackCode")}
      className="form-control"
      placeholder="Rack Code"
    />
  </div>
  <div className="col-md-6 m-0">
    <input
      type="file"
      {...register("productImage")}
      className="form-control"
    />
  </div>
  
  {/* Dropdown for Size */}
  <div className="col-md-6 m-0">
    <select {...register("size")} className="form-control">
      <option value="">Select Size</option>
      <option value="Small">Small</option>
      <option value="Medium">Medium</option>
      <option value="Large">Large</option>
      <option value="Extra Large">Extra Large</option>
    </select>
  </div>

  {/* Dropdown for Color */}
  <div className="col-md-6 m-0">
    <select {...register("color")} className="form-control">
      <option value="">Select Color</option>
      <option value="Red">Red</option>
      <option value="Blue">Blue</option>
      <option value="Green">Green</option>
      <option value="Black">Black</option>
      <option value="White">White</option>
    </select>
  </div>

  {/* Dropdown for Model */}
  <div className="col-md-6 m-0">
    <select {...register("model")} className="form-control">
      <option value="">Select Model</option>
      <option value="Model A">Model A</option>
      <option value="Model B">Model B</option>
      <option value="Model C">Model C</option>
    </select>
  </div>

  {/* Dropdown for Brand */}
  <div className="col-md-6 m-0">
    <select {...register("brand")} className="form-control">
      <option value="">Select Brand</option>
      <option value="Brand X">Brand X</option>
      <option value="Brand Y">Brand Y</option>
      <option value="Brand Z">Brand Z</option>
    </select>
  </div>
</form>

                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setShowModal(false)}
                        >
                          Close
                        </button>
                        <button type="button" className="btn btn-primary">
                          Confirm & Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="table-responsive p-0">
                <table className="table align-items-center justify-content-center mb-0">
                  <thead>
                    <tr>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                        Image
                      </th>
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
                          setSortField("productName");
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        }}
                      >
                        Product Name{" "}
                        {sortField === "productName"
                          ? sortOrder === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th
                        className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
                        onClick={() => {
                          setSortField("description");
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        }}
                      >
                        description{" "}
                        {sortField === "description"
                          ? sortOrder === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th
                        className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
                        onClick={() => {
                          setSortField("qty");
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        }}
                      >
                        qty{" "}
                        {sortField === "qty"
                          ? sortOrder === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th
                        className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
                        onClick={() => {
                          setSortField("rackCode");
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        }}
                      >
                        rackCode{" "}
                        {sortField === "rackCode"
                          ? sortOrder === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th
                        className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
                        onClick={() => {
                          setSortField("category");
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        }}
                      >
                        Category{" "}
                        {sortField === "category"
                          ? sortOrder === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th
                        className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
                        onClick={() => {
                          setSortField("subcategory");
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        }}
                      >
                        SubCategory{" "}
                        {sortField === "subcategory"
                          ? sortOrder === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th
                        className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
                        onClick={() => {
                          setSortField("price");
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        }}
                      >
                        Price{" "}
                        {sortField === "price"
                          ? sortOrder === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th
                        className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
                        onClick={() => {
                          setSortField("status");
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        }}
                      >
                        Status{" "}
                        {sortField === "status"
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
                    {filteredProducts.map((product, index) => (
                      <tr key={index}>
                        <td>
                          <img
                            src={product.image}
                            alt={product.productName}
                            width="50"
                            height="50"
                          />
                        </td>
                        <td>{product.clientId}</td>
                        <td>{product.productName}</td>
                        <td>{product.description}</td>
                        <td>{product.qty}</td>
                        <td>{product.rackCode}</td>
                        <td>{product.category}</td>
                        <td>{product.subcategory}</td>
                        <td>{product.price}</td>
                        <td>{product.status}</td>
                        <td>
                          <div className="d-flex">
                            <button
                              className="btn action_icons"
                              onClick={() => handleViewClick(product)}
                            >
                              <i className="fa fa-eye"></i>
                            </button>
                            <button
                              className="btn action_icons"
                              onClick={() => editProduct(product.id)}
                            >
                              <i className="fa fa-edit"></i>
                            </button>
                            <button
                              className="btn action_icons"
                              onClick={() => deleteProduct(product.id)}
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

export default AddProductForm;
