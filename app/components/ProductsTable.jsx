import { useEffect, useState } from "react";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const ProductsTable = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Replace with your actual API endpoint
    fetch(`${API_URL}/products`)
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  return (
    <div className="table-responsive">
      <table className="table align-items-center justify-content-center mb-0">
        <thead>
          <tr>
            <th>Id</th>
            <th>HSN Code</th>
            <th>Item Code</th>
            <th>Item Name</th>
            <th>Description</th>
            <th>Category</th>
            <th>Sub-Category</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Rack Code</th>
            <th>Thumbnail</th>
            <th>Size</th>
            <th>Color</th>
            <th>Model</th>
            <th>Brand</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={index}>
              <td>{product.id}</td>
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
                <img
                  src={product.thumbnail}
                  alt={product.itemName}
                  width="50"
                  height="50"
                  style={{ borderRadius: "5px" }}
                />
              </td>
              <td>{product.size}</td>
              <td>{product.color}</td>
              <td>{product.model}</td>
              <td>{product.brand}</td>
              <td>
                <u
                  className="text-primary mx-2"
                  style={{ cursor: "pointer" }}
                  title="Edit"
                  onClick={() => handleEdit(product.id)}
                >
                  <i className="fas fa-edit"></i>
                </u>
                <u
                  className="text-danger"
                  style={{ cursor: "pointer" }}
                  title="Delete"
                  onClick={() => handleDelete(product.id)}
                >
                  <i className="fas fa-trash"></i>
                </u>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Edit function
const handleEdit = (id) => {
  console.log("Edit product with ID:", id);
};

// Delete function
const handleDelete = (id) => {
  console.log("Delete product with ID:", id);
};

export default ProductsTable;
