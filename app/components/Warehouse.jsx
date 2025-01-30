"use client"
import React, { useState } from "react";

const Warehouse = () => {
  const [warehouses, setWarehouses] = useState([
    {
      id: "WH001",
      name: "Central Warehouse",
      location: "New Delhi",
      racks: [
        {
          id: "RACK001",
          name: "Pallet Shelf",
          location: "Row 1, Section A",
          capacity: 500,
          usage: 300,
          type: "Pallet Rack",
        },
      ],
    },
  ]);

  const [newWarehouse, setNewWarehouse] = useState({
    id: "",
    name: "",
    location: "",
    racks: [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewWarehouse((prev) => ({ ...prev, [name]: value }));
  };

  const addRackToWarehouse = (warehouseId) => {
    const rackId = prompt("Enter Rack ID:");
    const rackName = prompt("Enter Rack Name:");
    const rackLocation = prompt("Enter Rack Location:");
    const rackCapacity = parseInt(prompt("Enter Rack Capacity:"), 10);
    const rackType = prompt("Enter Rack Type:");

    if (rackId && rackName && rackLocation && rackCapacity && rackType) {
      setWarehouses((prev) =>
        prev.map((warehouse) =>
          warehouse.id === warehouseId
            ? {
                ...warehouse,
                racks: [
                  ...warehouse.racks,
                  {
                    id: rackId,
                    name: rackName,
                    location: rackLocation,
                    capacity: rackCapacity,
                    usage: 0,
                    type: rackType,
                  },
                ],
              }
            : warehouse
        )
      );
    }
  };

  const addWarehouse = () => {
    if (newWarehouse.id && newWarehouse.name && newWarehouse.location) {
      setWarehouses((prev) => [...prev, newWarehouse]);
      setNewWarehouse({ id: "", name: "", location: "", racks: [] });
    }
  };

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">Warehouse Management</h2>

      {/* Add Warehouse Form */}
      <div className="card mb-4">
        <div className="card-body">
          <h4 className="card-title">Add New Warehouse</h4>
          <div className="row g-3">
            <div className="col-md-4">
              <input
                type="text"
                name="id"
                className="form-control"
                value={newWarehouse.id}
                onChange={handleInputChange}
                placeholder="Warehouse ID"
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                name="name"
                className="form-control"
                value={newWarehouse.name}
                onChange={handleInputChange}
                placeholder="Warehouse Name"
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                name="location"
                className="form-control"
                value={newWarehouse.location}
                onChange={handleInputChange}
                placeholder="Warehouse Location"
              />
            </div>
          </div>
          <button className="btn btn-success mt-3" onClick={addWarehouse}>
            Add Warehouse
          </button>
        </div>
      </div>

      {/* List Warehouses */}
      <div className="row">
        {warehouses.map((warehouse) => (
          <div className="col-md-6 mb-4" key={warehouse.id}>
            <div className="card h-100">
              <div className="card-body">
                <h4 className="card-title">{warehouse.name}</h4>
                <p className="card-text">
                  <strong>ID:</strong> {warehouse.id}
                  <br />
                  <strong>Location:</strong> {warehouse.location}
                </p>
                <h5>Racks:</h5>
                <ul className="list-group">
                  {warehouse.racks.map((rack) => (
                    <li
                      key={rack.id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{rack.name}</strong> (ID: {rack.id}) -{" "}
                        {rack.location} - {rack.capacity} kg (Used: {rack.usage}{" "}
                        kg) - {rack.type}
                      </div>
                    </li>
                  ))}
                </ul>
                <button
                  className="btn btn-success mt-3"
                  onClick={() => addRackToWarehouse(warehouse.id)}
                >
                  Add Rack
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Warehouse;
