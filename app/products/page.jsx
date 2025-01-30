"use client"
import { useState } from "react";
import AddProductForm from "../components/AddProductForm";
import AddClientForm from "../components/AddClientForm ";

const Products = () => {
  const [showModal, setShowModal] = useState(false);
  const [showModalClientDetails, setShowModalClientDetails] = useState(false);

 

  return (
    <>
      <div className="mini_banner warehouse">
        <div className="content_box">
          <div>
            <h2 className="title">Products</h2>
            <p className="description">Add/Edit Your Products</p>
          </div>
        </div>
      </div>
    <AddProductForm /> 
    </>
  );
};

export default Products;
