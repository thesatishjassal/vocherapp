"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import EditClientModal from "./EditClientModal";

const GetClients = ({ clients, newClientId, refreshClients }) => {
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [editingClient, setEditingClient] = useState(null);

  const handleDelete = async (clientId) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/${clientId}/`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 204 || response.status === 200) {
        refreshClients(); // Refresh client list after deletion
        toast.success("Client deleted successfully!");
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error) {
      toast.error("Failed to delete client. Please try again.");
    }
  };

  const sortedClients = [...clients].sort((a, b) => {
    if (!sortField) return 0;
    const aField = a[sortField]?.toString().toLowerCase() || "";
    const bField = b[sortField]?.toString().toLowerCase() || "";
    return sortOrder === "asc"
      ? aField.localeCompare(bField)
      : bField.localeCompare(aField);
  });

  const toggleSort = (field) => {
    setSortField(field);
    setSortOrder((prev) =>
      sortField === field && prev === "asc" ? "desc" : "asc"
    );
  };

  return (
    <>
      <div className="table-responsive">
                              <div className="micro-links d-flex gap-1">Go to: 
                        <Link
                          href={`/getquotation`}
                          className="micro-link"
                          title="Go to Quotation"
                        >
                          Quotations
                        </Link>
                        <Link
                          href={`/saleorders`}
                          className="micro-link"
                          title="Go to Sales Order"
                        >
                          Sales Orders
                        </Link>
                        <Link
                          href={`/getinvouchers`}
                          className="micro-link"
                          title="Go to Invoice"
                        >
                          In Voucher
                        </Link>
                        <Link
                          href={`/getoutvouchers`}
                          className="micro-link"
                          title="Go to Out Voucher"
                        >
                          Out Vocuher
                        </Link>
                        <Link
                          href={`/purchase-orders`}
                          className="micro-link"
                          title="Go to Purchase Order"
                        >
                          Purchase Order
                        </Link>
                      </div>
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
                { label: "Creted By", key: "created_by" },
              ].map((col) => (  
                <th
                  key={col.key}
                  className={`text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ${
                    col.key === "id" ? "d-none d-md-table-cell" : ""
                  } ${
                    col.key === "gst_number" || col.key === "pincode"
                      ? "d-none d-lg-table-cell"
                      : ""
                  }`}
                  onClick={() => toggleSort(col.key)}
                  style={{ cursor: "pointer" }}
                >
                  {col.label}{" "}
                  {sortField === col.key && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
              ))}
              <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedClients.length === 0 ? (
              <tr>
                <td colSpan="11" className="text-center">
                  No clients found.
                </td>
              </tr>
            ) : (
              sortedClients.map((client) => (
                <tr
                  key={client.id}
                  className={client.id === newClientId ? "new-client" : ""}
                >
                  <td className="d-none d-md-table-cell">{client.id}</td>
                  <td>{client.businessname || "-"}</td>
                  <td className="d-none d-lg-table-cell">{client.gst_number || "-"}</td>
                  <td>{client.address || "-"}</td>
                  <td>{client.city || "-"}</td>
                  <td>{client.state || "-"}</td>
                  <td className="d-none d-lg-table-cell">{client.pincode || "-"}</td>
                  <td>{client.client_name || "-"}</td>
                  <td>{client.client_phone || "-"}</td>
                  <td>{client.client_type || "-"}</td>
                  <td>{client.created_by || "-"}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary action-icons me-2"
                        title="Edit"
                        onClick={() => setEditingClient(client)}
                      >
                        <i className="fa fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger action-icons me-2"
                        title="Delete"
                        onClick={() => handleDelete(client.id)}
                      >
                        <i className="fa fa-trash"></i>
                      </button>

                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingClient && (
        <EditClientModal
          client={editingClient}
          onClose={() => setEditingClient(null)}
          onUpdated={refreshClients}
        />
      )}
    </>
  );
};

export default GetClients;