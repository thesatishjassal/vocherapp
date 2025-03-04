"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const productSchema = yup.object().shape({
  hsncode: yup.string().required(),
  itemcode: yup.string().required(),
  itemname: yup.string().required(),
  description: yup.string().required(),
  category: yup.string().required(),
  subcategory: yup.string().required(),
  price: yup.string().required(),
  quantity: yup.string().required(),
  rackcode: yup.string().required(),
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
  const selectedCategory = watch("category");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resCategories = await fetch("https://api.panvic.in/category/");
        const categoriesData = await resCategories.json();
        setCategories(categoriesData || []);

        const resSubCategories = await fetch("https://api.panvic.in/subcategory/");
        const subCategoriesData = await resSubCategories.json();
        setSubCategories(subCategoriesData || []);
      } catch (error) {
        toast.error("Error fetching categories!", { position: "top-right" });
        console.error("Error fetching categories:", error);
      }
    };
    fetchData();
  }, []);

  const filteredSubCategories = subCategories.filter(
    (sub) => sub.catname === selectedCategory
  );

  const onSubmit = async (data) => {
    try {
      const payload = { ...data };
      const response = await fetch(`${API_URL}/products/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to add product");
      }

      console.log("API Response:", responseData); // Debug log
      onSave(responseData); // Pass full response object
      toast.success("Product added successfully!", { position: "top-right" });
      reset();
    } catch (error) {
      console.error("Error:", error.message);
      toast.error(error.message || "Error adding product", {
        position: "top-right",
      });
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
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body py-3">
            <form onSubmit={handleSubmit(onSubmit)} className="row g-3">
              {[
                "hsncode",
                "itemcode",
                "itemname",
                "description",
                "price",
                "quantity",
                "rackcode",
                "size",
                "color",
                "model",
                "brand",
                "unit",
              ].map((field) => (
                <div className="col-md-6" key={field}>  
                  <input
                    type="text"
                    {...register(field)}
                    className={`form-control ${errors[field] ? "border-danger" : ""}`}
                    placeholder={field.replace(/([A-Z])/g, " $1").trim()}
                  />
                  {errors[field] && (
                    <small className="text-danger">{errors[field].message}</small>
                  )}
                </div>
              ))}

              <div className="col-md-6">
                <select
                  {...register("category")}
                  className={`form-control ${errors.category ? "border-danger" : ""}`}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.catname}>
                      {cat.catname}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <small className="text-danger">{errors.category.message}</small>
                )}
              </div>

              <div className="col-md-6">
                <select
                  {...register("subcategory")}
                  className={`form-control ${errors.subcategory ? "border-danger" : ""}`}
                >
                  <option value="">Select subcategory</option>
                  {filteredSubCategories.map((sub) => (
                    <option key={sub.id} value={sub.subcatname}>
                      {sub.subcatname}
                    </option>
                  ))}
                </select>
                {errors.subcategory && (
                  <small className="text-danger">{errors.subcategory.message}</small>
                )}
              </div>

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