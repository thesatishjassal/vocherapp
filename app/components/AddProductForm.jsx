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
  size: yup.string().required(),
  color: yup.string().required(),
  model: yup.string().required(),
  brand: yup.string().required(),
});

const AddProductForm = () => {
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

  const [productId, setProductId] = useState(null);
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const selectedCategory = watch("category");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resCategories = await fetch(`${API_URL}/category/`);
        const categoriesData = await resCategories.json();
        setCategories(categoriesData || []);

        const resSubCategories = await fetch(`${API_URL}/subcategory/`);
        const subCategoriesData = await resSubCategories.json();
        setSubCategories(subCategoriesData || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchData();
  }, []);

  const filteredSubCategories = subCategories.filter(
    (sub) => sub.catname === selectedCategory
  );

  // Step 1: Submit Product Data
  const onSubmitProduct = async (data) => {
    try {
      const response = await fetch(`${API_URL}/products/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to add product");

      const newProduct = await response.json();
      setProductId(newProduct.products.id);
      alert("Product added successfully! Now upload an image.");
      reset();
    } catch (error) {
      console.error("Error:", error);
      alert("Error adding product");
    }
  };

  // Step 2: Upload Image for the Product
  const uploadImage = async () => {
    if (!productId || !image) {
      alert("Please select an image and ensure product is created.");
      return;
    }

    const formData = new FormData();
    formData.append("thumbnail", image);

    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload image");

      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Add New Product</h2>

      {/* Step 1: Product Form */}
      <form onSubmit={handleSubmit(onSubmitProduct)} className="grid grid-cols-2 gap-4">
        {["hsncode", "itemCode", "itemName", "description", "price", "quantity", "rackCode", "size", "color", "model", "brand"].map((field) => (
          <input
            key={field}
            type="text"
            {...register(field)}
            className={`border p-2 rounded-md ${errors[field] ? "border-red-500" : ""}`}
            placeholder={field.replace(/([A-Z])/g, " $1").trim()}
          />
        ))}

        {/* Category Dropdown */}
        <select {...register("category")} className="border p-2 rounded-md">
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.catname}>
              {cat.catname}
            </option>
          ))}
        </select>

        {/* Subcategory Dropdown */}
        <select {...register("subCategory")} className="border p-2 rounded-md">
          <option value="">Select Subcategory</option>
          {filteredSubCategories.map((sub) => (
            <option key={sub.id} value={sub.subcatname}>
              {sub.subcatname}
            </option>
          ))}
        </select>

        <button type="submit" className="bg-blue-500 text-white p-2 rounded-md col-span-2" disabled={!isValid}>
          Add Product
        </button>
      </form>

      {/* Step 2: Image Upload */}
      {productId && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Upload Image for Product ID: {productId}</h3>
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="border p-2 rounded-md w-full" />
          <button onClick={uploadImage} className="bg-green-500 text-white p-2 rounded-md mt-2 w-full">
            Upload Image
          </button>
        </div>
      )}
    </div>
  );
};

export default AddProductForm;
