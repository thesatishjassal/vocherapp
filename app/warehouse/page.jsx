"use client"
import Warehouse from "../components/Warehouse";
import WarehouseTable from "../components/WarehouseTable";
import { useState } from "react";

const AddNewWarehouse = () => {
    const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    warehouseId: "",
    warehouseName: "",
    location: "",
    rankId: "",
    rankName: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Warehouse Data Submitted:", formData);
    setShowModal(false);
    setFormData({
      warehouseId: "",
      warehouseName: "",
      location: "",
      rankId: "",
      rankName: "",
    });
  };

  return (
    <>
      <div className="mini_banner warehouse">
        <div className="content_box">
          <div>
            {" "}
            <h2 className="title">Warehouse</h2>
            <p className="description">Add/Edit Your Warehouse</p>
          </div>
        </div>
      </div>
      <WarehouseTable />
    </>
  );
};

export default AddNewWarehouse;
