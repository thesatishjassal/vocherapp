"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import GetClients from "./getClients";
import { ClientFormModal } from "./ClientFormModal";
import { rememberClient } from "./customerModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const GOLD = "#d3a01d";
const LINE = "#e3e3e3";
const MUTED = "#8a8a8a";
const INK = "#222";

const S = {
  card: {
    padding: 20, background: "#fff", borderRadius: 12, color: INK, fontSize: 13, lineHeight: 1.45,
    fontFamily: "Arial, Helvetica, sans-serif", boxShadow: "0 1px 3px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",
    boxSizing: "border-box", margin: "16px 0",
  },
  head: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 },
  title: { margin: 0, fontSize: 18, fontWeight: 700 },
  sub: { marginTop: 2, color: MUTED, fontSize: 12 },
  addBtn: {
    display: "inline-flex", alignItems: "center", gap: 6, height: 36, padding: "0 16px", border: 0,
    borderRadius: 8, background: GOLD, color: "#fff", font: "inherit", fontWeight: 700, cursor: "pointer",
  },
  search: {
    display: "flex", alignItems: "center", gap: 6, height: 36, marginBottom: 12, padding: "0 10px",
    border: `1px solid ${LINE}`, borderRadius: 8, background: "#fff", color: MUTED, boxSizing: "border-box",
  },
  searchInput: { flex: 1, minWidth: 0, border: 0, outline: 0, background: "transparent", font: "inherit", fontSize: 13, color: INK },
  clear: { border: 0, padding: 0, background: "transparent", color: MUTED, fontSize: 16, lineHeight: 1, cursor: "pointer" },
  empty: { padding: "28px 12px", border: `1px dashed ${LINE}`, borderRadius: 10, color: MUTED, textAlign: "center" },
  link: { border: 0, padding: 0, background: "transparent", color: "#b98912", font: "inherit", fontWeight: 700, cursor: "pointer" },
};

const Icon = ({ d, size = 15 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

const AddClientForm = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [prefill, setPrefill] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newClientId, setNewClientId] = useState(null);

  const fetchClients = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/clients/`);
      setClients([...(response.data || [])].reverse()); // newest first
    } catch (error) {
      console.error("Fetch clients error:", error);
      toast.error("Failed to fetch clients.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const filtered = useMemo(() => {
    const words = searchTerm.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return clients;
    return clients.filter((c) => {
      const hay = [c.client_name, c.businessname, c.client_phone, c.city, c.gst_number].filter(Boolean).join(" ").toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [clients, searchTerm]);

  const openAdd = () => {
    const q = searchTerm.trim();
    // Typed a number? prefill phone. Typed a name? prefill name.
    setPrefill(q ? (/^[\d+\-\s]{6,}$/.test(q) ? { client_phone: q } : { client_name: q }) : null);
    setShowModal(true);
  };

  const onSaved = (client) => {
    toast.success(`${client.client_name || "Client"} added`);
    setClients((prev) => [client, ...prev]);
    setNewClientId(client.id);
    rememberClient(client); // the quotation customer picker sees it straight away
    setSearchTerm("");
    setShowModal(false);
  };

  return (
    <section style={S.card}>
      <header style={S.head}>
        <div>
          <h1 style={S.title}>Clients</h1>
          <div style={S.sub}>{loading ? "Loading…" : `${clients.length.toLocaleString("en-IN")} clients`}</div>
        </div>
        <button type="button" style={S.addBtn} onClick={openAdd}
          onMouseOver={(e) => (e.currentTarget.style.filter = "brightness(.95)")}
          onMouseOut={(e) => (e.currentTarget.style.filter = "none")}>
          <Icon d="M12 5v14M5 12h14" /> Add client
        </button>
      </header>

      <label style={S.search}>
        <Icon d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5" size={14} />
        <input type="search" style={S.searchInput} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search name, business, phone, city or GST" aria-label="Search clients" />
        {searchTerm && <button type="button" style={S.clear} onClick={() => setSearchTerm("")} aria-label="Clear search">×</button>}
      </label>

      {!loading && searchTerm && filtered.length === 0 ? (
        <div style={S.empty}>
          No client matches “{searchTerm}”.{" "}
          <button type="button" style={S.link} onClick={openAdd}>Add “{searchTerm}” as a new client</button>
        </div>
      ) : (
        <GetClients clients={filtered} newClientId={newClientId} refreshClients={fetchClients} />
      )}

      <ClientFormModal open={showModal} initial={prefill} onClose={() => setShowModal(false)} onSaved={onSaved} />
      <ToastContainer />
    </section>
  );
};

export default AddClientForm;