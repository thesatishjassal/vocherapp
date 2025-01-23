import { useState } from "react";
import AddWarehouse from "../components/AddWarehouse";

const WarehouseTable = () => {
  const [warehouses, setWarehouses] = useState([
    {
      warehouseId: "WH-001",
      warehouseName: "Gaji Gula Warehouse",
      address: "Gaji Gula Road, City",
    },
    {
      warehouseId: "WH-002",
      warehouseName: "Ravidas Chowk Warehouse",
      address: "Ravidas Chowk, Town",
    },
  ]);
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    warehouseId: "",
    warehouseName: "",
    location: "",
    rankId: "",
    rankName: "",
  });
  const handleViewClick = (warehouse) => {
    console.log("Viewing warehouse:", warehouse);
  };

  const editWarehouse = (warehouseId) => {
    console.log("Editing warehouse with ID:", warehouseId);
  };

  const deleteWarehouse = (warehouseId) => {
    console.log("Deleting warehouse with ID:", warehouseId);
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="table-responsive p-4 card my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search by Client or Project"
          className="form-control w-25"
        />
        {/* Filter Dropdown */}
        <button
          className="btn add_warehouse btn-primary"
          onClick={() => setShowModal(true)}
        >
          Add New
        </button>
      </div>
      <table className="table align-items-center justify-content-center mb-0">
        <thead>
          <tr>
            <th
              className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              onClick={() => {
                setSortField("id");
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
              }}
            >
              Warehouse ID{" "}
              {sortField === "id" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
            </th>
            <th
              className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              onClick={() => {
                setSortField("name");
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
              }}
            >
              Warehouse Name{" "}
              {sortField === "name" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
            </th>
            <th
              className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              onClick={() => {
                setSortField("address");
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
              }}
            >
              Address{" "}
              {sortField === "address" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
            </th>
            <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {warehouses.map((warehouse, index) => (
            <tr key={index}>
              <td>{warehouse.warehouseId}</td>
              <td>{warehouse.warehouseName}</td>
              <td>{warehouse.address}</td>
              <td>
                <div className="d-flex ">
                  <button
                    className="btn action_icons"
                    onClick={() => handleViewClick(warehouse)}
                  >
                    <i className="fa fa-eye"></i>
                  </button>
                  <button
                    className="btn action_icons"
                    onClick={() => editWarehouse(warehouse.warehouseId)}
                  >
                    <i className="fa fa-edit"></i>
                  </button>
                  <button
                    className="btn action_icons"
                    onClick={() => deleteWarehouse(warehouse.warehouseId)}
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <AddWarehouse
        showModal={showModal}
        setShowModal={setShowModal}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        formData={formData}
      />
    </div>
  );
};

export default WarehouseTable;
