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
  price: yup.string().required(),
  quantity: yup.string().required(),
  rackCode: yup.string().required(),
  thumbnail: yup.string().url().nullable(),
  size: yup.string().required(),
  color: yup.string().required(),
  model: yup.string().required(),
  brand: yup.string().required(),
});

const AddProductForm = ({ show, onClose, onSave }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    watch,
  } = useForm({
    resolver: yupResolver(productSchema),
    mode: "onChange",
  });

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  // Watch the selected category
  const selectedCategory = watch("category");

  // Fetch categories & subcategories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resCategories = await fetch("https://api.panvic.in/category/");
        const categoriesData = await resCategories.json();
        setCategories(categoriesData || []);

        const resSubCategories = await fetch(
          "https://api.panvic.in/subcategory/"
        );
        const subCategoriesData = await resSubCategories.json();
        setSubCategories(subCategoriesData || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchData();
  }, []);

  // Filter subcategories based on selected category
  const filteredSubCategories = subCategories.filter(
    (sub) => sub.catname === selectedCategory
  );

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to add product");

      const newProduct = await response.json();
      onSave(newProduct);
      reset();
      alert("Product added successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("Error adding product");
    }
  };

  return (
    <div
      className={`modal ${show ? "show" : ""}`}
      tabIndex="-1"
      style={{
        display: show ? "block" : "none",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="modal-dialog AddProductForm">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5">Add New Product</h1>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body py-3">
            <form onSubmit={handleSubmit(onSubmit)} className="row g-3">
              {/* All Input Fields */}
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
                    className={`form-control ${
                      errors[field] ? "border-danger" : ""
                    }`}
                    placeholder={field.replace(/([A-Z])/g, " $1").trim()}
                  />
                </div>
              ))}

              {/* Category Dropdown */}
              <div className="col-md-6">
                <select
                  {...register("category")}
                  className={`form-control ${
                    errors.category ? "border-danger" : ""
                  }`}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.catname}>
                      {cat.catname}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory Dropdown (Filtered) */}
              <div className="col-md-6">
                <select
                  {...register("subCategory")}
                  className={`form-control ${
                    errors.subCategory ? "border-danger" : ""
                  }`}
                >
                  <option value="">Select Subcategory</option>
                  {filteredSubCategories.map((sub) => (
                    <option key={sub.id} value={sub.subcatname}>
                      {sub.subcatname}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image URL Input */}
              <div className="col-md-6">
                <input
                  type="url"
                  {...register("thumbnail")}
                  className={`form-control ${
                    errors.thumbnail ? "border-danger" : ""
                  }`}
                  placeholder="Enter Image URL"
                />
              </div>

              {/* Submit Button */}
              <div className="col-12">
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={!isValid}
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductForm;
