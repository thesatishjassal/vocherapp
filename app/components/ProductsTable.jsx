"use client";
import { useEffect, useState } from "react";
import AddProductForm from "./AddProductForm";
import ImageUploadModal from "../components/ImageUploadModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const ProductsTable = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const handleModalOpen = (product = null) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleImageModalOpen = (product) => {
    setSelectedProduct(product);
    setShowImageModal(true);
  };

  const handleImageModalClose = () => {
    setShowImageModal(false);
  };

  const handleAddOrUpdateProduct = (updatedProduct) => {
    setProducts((prev) => {
      const index = prev.findIndex((p) => p.id === updatedProduct.id);
      if (index > -1) {
        const newProducts = [...prev];
        newProducts[index] = updatedProduct;
        return newProducts;
      }
      return [...prev, updatedProduct];
    });
    setShowModal(false);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await fetch(`${API_URL}/products/${productId}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((product) => product.id !== productId));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleImageUpload = (productId, newImage) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId ? { ...product, thumbnail: newImage } : product
      )
    );
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products`);
        const data = await response.json();
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="card">
      <div className="card-header pb-0">
        <h6>Manage Products</h6>
      </div>

      {showModal && (
        <AddProductForm
          show={showModal}
          onClose={handleModalClose}
          onSave={handleAddOrUpdateProduct}
          product={selectedProduct}
        />
      )}

      {showImageModal && (
        <ImageUploadModal
          show={showImageModal}
          onClose={handleImageModalClose}
          product={selectedProduct}
          onUpload={handleImageUpload}
        />
      )}

      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <input
            type="text"
            placeholder="Search by Client or Project"
            className="form-control w-25"
          />
          <div className="add_product">
            <button className="btn btn-primary m-3" onClick={() => handleModalOpen()}>
              Add Product
            </button>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table align-items-center justify-content-center mb-0">
            <thead>
              <tr>
                <th>Id</th>
                <th>Thumbnail</th>
                <th>HSN Code</th>
                <th>Item Code</th>
                <th>Item Name</th>
                <th>Description</th>
                <th>Category</th>
                <th>Sub-Category</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Rack Code</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={index}>
                  <td>{product.id}</td>
                  <td>
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.itemName}
                        width="50"
                        height="50"
                        style={{ borderRadius: "5px", cursor: "pointer" }}
                        onClick={() => handleImageModalOpen(product)}
                      />
                    ) : (
                      <i
                        className="plus-icon"
                        style={{
                          fontSize: "24px",
                          color: "#007bff",
                          cursor: "pointer",
                        }}
                        onClick={() => handleImageModalOpen(product)}
                      >
                        +
                      </i>
                    )}
                  </td>
                  <td>{product.hsncode}</td>
                  <td>{product.itemCode}</td>
                  <td>{product.itemName}</td>
                  <td>{product.description}</td>
                  <td>{product.category}</td>
                  <td>{product.subCategory}</td>
                  <td>₹{product.price}</td>
                  <td>{product.quantity}</td>
                  <td>{product.rackCode}</td>
                  <td>
                    <i
                      className="edit-icon"
                      style={{ fontSize: "18px", marginRight: "10px", cursor: "pointer", color: "#28a745" }}
                      onClick={() => handleModalOpen(product)}
                    >
                      ✏️
                    </i>
                    <i
                      className="delete-icon"
                      style={{ fontSize: "18px", cursor: "pointer", color: "#dc3545" }}
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      🗑️
                    </i>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductsTable;
