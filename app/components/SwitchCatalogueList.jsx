"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const CatalogueList = ({ refreshCatalogues, onEdit, onDelete }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCatalogues = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://api.panvic.in/catalogues/list");
      const formattedData = response.data.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category || "N/A",
        brand: item.brand || "N/A",
        createdBy: item.created_by,
        createdAt: new Date(item.created_at).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        googleDriveUrl: item.google_drive_url,
      }));
      setData(formattedData);
      setError(null);
    } catch (err) {
      const message = err.response?.data?.detail || "Failed to fetch catalogues.";
      setError(message);
      toast.error(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogues();
  }, [refreshCatalogues]);

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center py-1">
        <p className="text-dark mb-0">Loading catalogues...</p>
      </div>
    );

  if (error)
    return (
      <div className="d-flex justify-content-center align-items-center py-1">
        <p className="text-danger mb-0 me-1">{error}</p>
        <button
          onClick={fetchCatalogues}
          className="btn btn-dark btn-sm"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="card shadow-sm">
      <div className="card-body p-1">
        <div className="table-responsive">
          <table className="table table-bordered table-sm mb-0 text-dark" style={{ fontSize: '0.875rem' }}>
            <thead className="table-light">
              <tr style={{ padding: '0.125rem 0.25rem' }}>
                <th style={{ padding: '0.125rem 0.25rem', fontSize: '0.8rem', borderTop: 'none' }}>SR</th>
                <th style={{ padding: '0.125rem 0.25rem', fontSize: '0.8rem', borderTop: 'none' }}>Name</th>
                <th style={{ padding: '0.125rem 0.25rem', fontSize: '0.8rem', borderTop: 'none' }}>Category</th>
                <th style={{ padding: '0.125rem 0.25rem', fontSize: '0.8rem', borderTop: 'none' }}>Brand</th>
                <th style={{ padding: '0.125rem 0.25rem', fontSize: '0.8rem', borderTop: 'none' }}>Created By</th>
                <th style={{ padding: '0.125rem 0.25rem', fontSize: '0.8rem', borderTop: 'none' }}>Created At</th>
                <th className="text-center" style={{ padding: '0.125rem 0.25rem', fontSize: '0.8rem', borderTop: 'none' }}>File</th>
                <th className="text-center" style={{ padding: '0.125rem 0.25rem', fontSize: '0.8rem', borderTop: 'none' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, i) => (
                <tr key={item.id}>
                  <td style={{ padding: '0.125rem 0.25rem', fontSize: '0.875rem' }}>{i + 1}</td>
                  <td style={{ padding: '0.125rem 0.25rem', fontSize: '0.875rem' }}>{item.name}</td>
                  <td style={{ padding: '0.125rem 0.25rem', fontSize: '0.875rem' }}>{item.category}</td>
                  <td style={{ padding: '0.125rem 0.25rem', fontSize: '0.875rem' }}>{item.brand}</td>
                  <td style={{ padding: '0.125rem 0.25rem', fontSize: '0.875rem' }}>{item.createdBy}</td>
                  <td style={{ padding: '0.125rem 0.25rem', fontSize: '0.875rem' }}>{item.createdAt}</td>
                  <td className="text-center" style={{ padding: '0.125rem 0.25rem', fontSize: '0.875rem' }}>
                    <a
                      href={item.googleDriveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-dark btn-sm py-0 px-1"
                      style={{ fontSize: '0.75rem' }}
                    >
                      View
                    </a>
                  </td>
                  <td className="text-center" style={{ padding: '0.125rem 0.25rem' }}>
                    <button
                      onClick={() => onEdit(item)}
                      className="btn btn-outline-primary btn-sm py-0 px-1 me-1"
                      style={{ fontSize: '0.75rem' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="btn btn-outline-danger btn-sm py-0 px-1"
                      style={{ fontSize: '0.75rem' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data.length === 0 && (
            <p className="text-center text-secondary py-1 mb-0" style={{ fontSize: '0.875rem' }}>
              No catalogues found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogueList;