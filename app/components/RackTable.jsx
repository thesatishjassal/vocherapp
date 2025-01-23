import { useState } from "react";
import RackModal from "../components/AddRackModal";

const RackTable = () => {
  const [racks, setRacks] = useState([
    {
      rackId: "RK-001",
      rankName: "A",
      rackCodes: ["A1", "A2", "A3"],
      warehouseName: "Gaji Gula Warehouse",
    },
    {
      rackId: "RK-002",
      rankName: "B",
      rackCodes: ["B1", "B2", "B3"],
      warehouseName: "Ravidas Chowk Warehouse",
    },
    {
      rackId: "RK-003",
      rankName: "C",
      rackCodes: ["C1", "C2", "C3"],
      warehouseName: "Maharaja Warehouse",
    },
    {
      rackId: "RK-004",
      rankName: "A",
      rackCodes: ["A4", "A5", "A6"],
      warehouseName: "Chandni Bagh Warehouse",
    },
    {
      rackId: "RK-005",
      rankName: "B",
      rackCodes: ["B4", "B5", "B6"],
      warehouseName: "Rajput Nagar Warehouse",
    },
    {
      rackId: "RK-006",
      rankName: "C",
      rackCodes: ["C4", "C5", "C6"],
      warehouseName: "Indira Colony Warehouse",
    },
  ]);

  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showModal, setShowModal] = useState(false);

  const warehouses = [
    "Gaji Gula Warehouse",
    "Ravidas Chowk Warehouse",
    "Maharaja Warehouse",
    "Chandni Bagh Warehouse",
    "Guru Nanak Warehouse",
    "Golden Temple Warehouse",
  ];

  const handleModalToggle = () => setShowModal(!showModal);

  const addNewRack = (newRackData) => {
    setRacks([...racks, newRackData]);
  };
  const handleViewClick = (rack) => {
    console.log("Viewing rack:", rack);
  };

  const editRack = (rackId) => {
    console.log("Editing rack with ID:", rackId);
  };

  const deleteRack = (rackId) => {
    console.log("Deleting rack with ID:", rackId);
  };

  return (
    <div className="table-responsive card p-4 my-4">
        <RackModal
        showModal={showModal}
        handleModalToggle={handleModalToggle}
        addNewRack={addNewRack}
        warehouses={warehouses}
      />
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
          onClick={handleModalToggle}
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
                setSortField("rackId");
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
              }}
            >
              Rack ID{" "}
              {sortField === "rackId" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
            </th>
            <th
              className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              onClick={() => {
                setSortField("rankName");
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
              }}
            >
              Rank Name{" "}
              {sortField === "rankName"
                ? sortOrder === "asc"
                  ? "↑"
                  : "↓"
                : ""}
            </th>
            <th
              className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              onClick={() => {
                setSortField("rankCode");
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
              }}
            >
              Rank Code{" "}
              {sortField === "rankCode"
                ? sortOrder === "asc"
                  ? "↑"
                  : "↓"
                : ""}
            </th>
            <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
              Warehouse Name
            </th>
            <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {racks.map((rack, index) => (
            <tr key={index}>
              <td>{rack.rackId}</td>
              <td>{rack.rankName}</td>
              <td>{rack.rackCodes.join(", ")}</td>
              <td>{rack.warehouseName}</td>
              <td>
                <div className="d-flex ">
                  <button
                    className="btn action_icons"
                    onClick={() => handleViewClick(rack)}
                  >
                    <i className="fa fa-eye"></i>
                  </button>
                  <button
                    className="btn action_icons"
                    onClick={() => editRack(rack.rackId)}
                  >
                    <i className="fa fa-edit"></i>
                  </button>
                  <button
                    className="btn action_icons"
                    onClick={() => deleteRack(rack.rackId)}
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RackTable;
