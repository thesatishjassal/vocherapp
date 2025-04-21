"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const GetClients = () => {
  const [clients, setClients] = useState([]);
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  // Fetch clients on mount
  useEffect(() => {
    fetchClients();
  }, []);

  // Fetch clients data
  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API_URL}/clients/`);
      setClients(response.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Failed to load clients!");
    }
  };
  
  // console.log("Clients:", clients);
  const handleDelete = async (clientId) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    // console.log("Deleting client:", clientId);
    try {
      const response = await axios.delete(`${API_URL}/client/${clientId}/`, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 204 || response.status === 200) {
        setClients((prevClients) => prevClients.filter((c) => c.id !== clientId));
        toast.success("Client deleted successfully!");
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error) {
      // console.error("Error deleting client:", error);
      toast.error("Failed to delete client. Please try again.");
    }
  };

  // Sort data
  const sortedClients = [...clients].sort((a, b) => {
    if (!sortField) return 0;
    const aField = a[sortField]?.toString().toLowerCase() || "";
    const bField = b[sortField]?.toString().toLowerCase() || "";
    return sortOrder === "asc" ? aField.localeCompare(bField) : bField.localeCompare(aField);
  });

  // Handle sorting toggle
  const toggleSort = (field) => {
    setSortField(field);
    setSortOrder((prev) => (sortField === field && prev === "asc" ? "desc" : "asc"));
  };

  return (
    <div className="table-responsive">
      <table className="tm_round_border table align-items-center justify-content-center mb-0">
        <thead>
          <tr>
            {[
              { label: "ID", key: "id" },
              { label: "Business Name", key: "businessname" },
              { label: "GST Number", key: "gst_number" },
              { label: "Address", key: "address" },
              { label: "City", key: "city" },
              { label: "State", key: "state" },
              { label: "Pincode", key: "pincode" },
              { label: "Client Name", key: "client_name" },
              { label: "Client Phone", key: "client_phone" },
              { label: "Client Type", key: "client_type" },
            ].map((col) => (
              <th
                key={col.key}
                className={`text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ${
                  col.key === "id" ? "d-none d-md-table-cell" : ""
                } ${col.key === "gst_number" || col.key === "pincode" ? "d-none d-lg-table-cell" : ""}`}
                onClick={() => toggleSort(col.key)}
                style={{ cursor: "pointer" }}
              >
                {col.label} {sortField === col.key && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
            ))}
            <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedClients.map((client) => (
            <tr key={client.id}>
              <td className="d-none d-md-table-cell">{client.id}</td>
              <td>{client.businessname}</td>
              <td className="d-none d-lg-table-cell">{client.gst_number}</td>
              <td>{client.address}</td>
              <td>{client.city}</td>
              <td>{client.state}</td>
              <td className="d-none d-lg-table-cell">{client.pincode}</td>
              <td>{client.client_name}</td>
              <td>{client.client_phone}</td>
              <td>{client.client_type}</td>
              <td>
                <div className="d-flex">
                  
                  {/* <button
                    className="btn btn-sm btn-outline-primary action-icons me-2"
                    title="Edit"
                    onClick={() => console.log("Edit client", client.id)}
                  >
                    <i className="fa fa-edit"></i>
                  </button> */}
                  
                  <button
                    className="btn btn-sm btn-outline-danger action-icons"
                    title="Delete"
                    onClick={() => handleDelete(client.id)}
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

export default GetClients;