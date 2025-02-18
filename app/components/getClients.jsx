"use client"
import { useEffect, useState } from "react";
import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const GetClients = () => {
  const [clients, setClients] = useState([]);
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API_URL}/clients/`);
      setClients(response.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

    const editClient = (clientId) => {
    // Redirect to the edit client page
    // window.location.href = `/edit-client/${clientId}`;
    console.log(clientId);    
    }

  const handleDelete = async (clientId) =>{
    const isConfirmed = confirm("Are you sure you want to delete this client?");
    
    if (isConfirmed) {
        try {
            const response = await fetch(`${API_URL}/client/${clientId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                alert("Client deleted successfully!");
                // Optionally, refresh the page or update the UI
                window.location.reload(); // Refresh the page after deletion
            } else {
                alert("Failed to delete client. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting client:", error);
            alert("An error occurred. Please try again later.");
        }
    }
}

  return (
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
            ID {sortField === "id" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
          </th>
          <th
            className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
            onClick={() => {
              setSortField("buisnessname");
              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
            }}
          >
            Business Name{" "}
            {sortField === "buisnessname" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
          </th>
          <th
            className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
            onClick={() => {
              setSortField("gst_number");
              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
            }}
          >
            GST Number{" "}
            {sortField === "gst_number" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
          </th>
          <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
            Address
          </th>
          <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
            City
          </th>
          <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
            State
          </th>
          <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
            Pincode
          </th>
          <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
            Client Name
          </th>
          <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
            Client Phone
          </th>
          {/* <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
            Client Email
          </th> */}
          <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
            Client Type
          </th>
          <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {clients.map((client, index) => (
          <tr key={index}>
            <td>{client.id}</td>
            <td>{client.buisnessname}</td>
            <td>{client.gst_number}</td>
            <td>{client.address}</td>
            <td>{client.city}</td>
            <td>{client.state}</td>
            <td>{client.pincode}</td>
            <td>{client.client_name}</td>
            <td>{client.client_phone}</td>
            {/* <td>{client.Client_Email}</td> */}
            <td>{client.client_type}</td>
            <td>
              <div className="d-flex">
                <button className="btn action_icons" onClick={() => editClient(client.id)}>
                  <i className="fa fa-edit"></i>
                </button>
                <button className="btn action_icons" onClick={() => handleDelete(client.id)}>
                  <i className="fa fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default GetClients;
