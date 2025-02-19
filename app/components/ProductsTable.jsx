"use client";
import { useEffect, useState } from "react";
import AddProductForm from "./AddProductForm";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const ProductsTable = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const handleModalClose = () => setShowModal(false);
  const handleModalOpen = () => setShowModal(true);

  const handleAddProducts = (newProduct) => {
    setProducts((prev) => [...prev, newProduct]);
    setShowModal(false);
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
        <h6>Add Products</h6>
      </div>

      {showModal && (
        <AddProductForm
          show={showModal}
          onClose={handleModalClose}
          onSave={handleAddProducts}
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
            <button className="btn btn-primary m-3" onClick={handleModalOpen}>
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
                {/* <th>Size</th>
                <th>Color</th>
                <th>Model</th>
                <th>Brand</th> */}
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={index}>
                  <td>{product.id}</td>
                  <td>
                    <img
                      src={product.thumbnail}
                      alt={product.itemName}
                      width="50"
                      height="50"
                      style={{ borderRadius: "5px" }}
                    />
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
                  {/* <td>{product.size}</td>
                  <td>{product.color}</td>
                  <td>{product.model}</td>
                  <td>{product.brand}</td> */}
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
