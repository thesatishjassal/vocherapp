"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Schema validation
const productSchema = yup.object().shape({
  hsncode: yup.string().required(),
  itemCode: yup.string().required(),
  itemName: yup.string().required(),
  description: yup.string().required(),
  category: yup.string().required(),
  subCategory: yup.string().required(),
  price: yup.number().typeError("Invalid").positive().required(),
  quantity: yup.number().typeError("Invalid").integer().min(0).required(),
  rackCode: yup.string().required(),
  thumbnail: yup.mixed().required(),
  size: yup.string().required(),
  color: yup.string().required(),
  model: yup.string().required(),
  brand: yup.string().required(),
});

const AddProductForm = () => {
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(productSchema),
    mode: "onChange",
  });

  // Fetch categories & subcategories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("https://api.panvic.in/category/");
        const data = await res.json();
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const fetchSubCategories = async () => {
      try {
        const res = await fetch("https://api.panvic.in/subcategory/");
        const data = await res.json();
        setSubCategories(data || []);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };

    fetchCategories();
    fetchSubCategories();
  }, []);

  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === "thumbnail") {
        formData.append(key, data[key][0]);
      } else {
        formData.append(key, data[key]);
      }
    });

    try {
      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to add product");

      alert("Product added successfully!");
      reset();
    } catch (error) {
      console.error("Error:", error);
      alert("Error adding product");
    }
  };

  return (
    <div className="container px-0">
      <button className="btn action_btn" onClick={() => setShowModal(true)}>Add New</button>

      {showModal && (
        <div className="modal fade show" tabIndex="-1" style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <div className="modal-dialog AddProductForm">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5">Add New Product</h1>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body py-3">
                <form onSubmit={handleSubmit(onSubmit)} className="row g-3">
                  {[
                    "hsncode",
                    "itemCode",
                    "itemName",
                    "description",
                    "price",
                    "quantity",
                    "rackCode",
                    "size",
                    "color",
                    "model",
                    "brand",
                  ].map((field) => (
                    <div className="col-md-6" key={field}>
                      <input
                        type="text"
                        {...register(field)}
                        className={`form-control ${errors[field] ? "border-danger" : ""}`}
                        placeholder={field.replace(/([A-Z])/g, " $1").trim()}
                      />
                    </div>
                  ))}

                  {/* Category Dropdown */}
                  <div className="col-md-6">
                    <select
                      {...register("category")}
                      className={`form-control ${errors.category ? "border-danger" : ""}`}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.catname}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategory Dropdown */}
                  <div className="col-md-6">
                    <select
                      {...register("subCategory")}
                      className={`form-control ${errors.subCategory ? "border-danger" : ""}`}
                    >
                      <option value="">Select Subcategory</option>
                      {subCategories.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.subcatname}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* File Input */}
                  <div className="col-md-6">
                    <input
                      type="file"
                      {...register("thumbnail")}
                      className={`form-control ${errors.thumbnail ? "border-danger" : ""}`}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="col-12">
                    <button type="submit" className="btn btn-primary w-100" disabled={!isValid}>
                      Add Product
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProductForm;
