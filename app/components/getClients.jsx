"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import EditClientModal from "./EditClientModal";
import Cookies from "js-cookie";

/* ---------- Tokens & styles (same look as the quotation pages) ---------- */

const GOLD = "#d3a01d";
const GOLD_DARK = "#b98912";
const GOLD_SOFT = "#fbf5e9";
const LINE = "#eeeeee";
const FIELD = "#e3e3e3";
const MUTED = "#8a8a8a";
const INK = "#222";
const RED = "#d64545";
const CARD_BELOW = 760; // container width under which rows become cards

const TYPE = {
  customer: { color: "#1f8a4c", bg: "#e8f6ee" },
  vendor: { color: "#2f5fd0", bg: "#eaf0fd" },
  other: { color: "#6b6b6b", bg: "#f1f1f1" },
};
const typeStyle = (t) => TYPE[String(t || "").toLowerCase()] || TYPE.other;

const th = {
  padding: "8px 10px", borderBottom: `1px solid ${LINE}`, color: MUTED, fontSize: 11, fontWeight: 600,
  textAlign: "left", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap",
};
const td = { padding: "11px 10px", borderBottom: `1px solid ${LINE}`, verticalAlign: "top" };

const S = {
  links: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 12, color: MUTED, fontSize: 12 },
  linkChip: {
    display: "inline-flex", alignItems: "center", height: 26, padding: "0 10px", borderRadius: 999,
    border: `1px solid ${FIELD}`, color: "#555", textDecoration: "none", fontSize: 12, fontWeight: 600,
  },
  tools: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 8 },
  count: { color: MUTED, fontSize: 12 },
  sort: {
    height: 32, padding: "0 28px 0 10px", border: `1px solid ${FIELD}`, borderRadius: 8, outline: "none",
    font: "inherit", fontSize: 12, color: INK, cursor: "pointer", appearance: "none",
    background: "#fff url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none' stroke='%238a8a8a' stroke-width='1.5'%3E%3Cpath d='m1 1 4 4 4-4'/%3E%3C/svg%3E\") no-repeat right 10px center",
  },
  table: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" },
  th, td,
  name: { fontWeight: 700, overflowWrap: "anywhere" },
  small: { marginTop: 2, color: MUTED, fontSize: 11, overflowWrap: "anywhere" },
  phone: { color: INK, textDecoration: "none", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" },
  pill: { display: "inline-block", padding: "2px 9px", borderRadius: 999, fontSize: 11, fontWeight: 700 },
  newBadge: { marginLeft: 6, padding: "1px 6px", borderRadius: 999, background: GOLD, color: "#fff", fontSize: 10, fontWeight: 700, verticalAlign: "middle" },
  actions: { display: "flex", justifyContent: "flex-end", gap: 2 },
  iconBtn: {
    display: "inline-flex", alignItems: "center", justifyContent: "center", width: 30, height: 30,
    padding: 0, border: 0, borderRadius: 7, background: "transparent", color: MUTED, cursor: "pointer",
  },
  empty: { padding: "36px 10px", color: MUTED, textAlign: "center" },
  // cards
  cards: { display: "flex", flexDirection: "column", gap: 8 },
  card: { padding: 12, border: `1px solid ${LINE}`, borderRadius: 10, background: "#fff" },
  cardTop: { display: "flex", alignItems: "flex-start", gap: 10 },
  avatar: {
    flex: "0 0 36px", width: 36, height: 36, borderRadius: "50%", display: "inline-flex", alignItems: "center",
    justifyContent: "center", background: "#f3f3f3", color: MUTED, fontSize: 12, fontWeight: 700, textTransform: "uppercase",
  },
  cardBody: { flex: 1, minWidth: 0 },
  cardMeta: { display: "flex", flexWrap: "wrap", gap: "4px 12px", marginTop: 8, color: "#555", fontSize: 12 },
  // pagination
  pager: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginTop: 12, color: MUTED, fontSize: 12 },
  pageBtns: { display: "flex", gap: 4 },
  pageBtn: {
    minWidth: 30, height: 30, padding: "0 8px", border: `1px solid ${FIELD}`, borderRadius: 7, background: "#fff",
    color: INK, font: "inherit", fontSize: 12, cursor: "pointer",
  },
  pageOn: { borderColor: GOLD, background: GOLD, color: "#fff", fontWeight: 700 },
  pageOff: { opacity: 0.4, cursor: "default" },
};

const iconOn = (e) => {
  const danger = e.currentTarget.dataset.danger;
  e.currentTarget.style.background = danger ? "#fdecec" : GOLD_SOFT;
  e.currentTarget.style.color = danger ? RED : GOLD_DARK;
};
const iconOff = (e) => {
  e.currentTarget.style.background = "transparent";
  e.currentTarget.style.color = MUTED;
};
const rowOn = (e) => !e.currentTarget.dataset.new && (e.currentTarget.style.background = "#fcfcfc");
const rowOff = (e) => !e.currentTarget.dataset.new && (e.currentTarget.style.background = "transparent");

const Icon = ({ d, size = 15 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.7"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);
const ICON = {
  edit: "M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2",
  prev: "M15 18l-6-6 6-6",
  next: "M9 18l6-6-6-6",
};

const SORTS = [
  ["newest", "Newest first"],
  ["name", "Name A–Z"],
  ["city", "City A–Z"],
  ["business", "Business A–Z"],
];
const PAGE_SIZE = 25;

const initials = (name) => String(name || "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("") || "?";
const show = (v) => (v && String(v).trim() && String(v).trim() !== "0" ? String(v).trim() : "");

/* ================================================================== */

const GetClients = ({ clients, newClientId, refreshClients }) => {
  const [sortBy, setSortBy] = useState("newest");
  const [editingClient, setEditingClient] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [page, setPage] = useState(1);
  const [width, setWidth] = useState(1200);
  const rootRef = useRef(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const cookie = Cookies.get("user_details");
    if (cookie) {
      try { setUserDetails(JSON.parse(cookie)); } catch (_) {}
    }
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const asCards = width < CARD_BELOW;

  // Sales Executives only see the clients they created; everyone else sees all
  const visible = useMemo(() => {
    const list = userDetails?.role === "Sales Executive"
      ? clients.filter((c) => c.created_by?.toLowerCase() === userDetails.name?.toLowerCase())
      : clients;
    const by = (k) => (a, b) => String(a[k] || "").localeCompare(String(b[k] || ""), "en", { sensitivity: "base" });
    const sorted = [...list];
    if (sortBy === "name") sorted.sort(by("client_name"));
    else if (sortBy === "city") sorted.sort(by("city"));
    else if (sortBy === "business") sorted.sort(by("businessname"));
    return sorted; // "newest": the parent already sends newest first
  }, [clients, userDetails, sortBy]);

  useEffect(() => setPage(1), [clients, sortBy]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * PAGE_SIZE;
  const pageRows = visible.slice(start, start + PAGE_SIZE);

  const handleDelete = async (client) => {
    if (!confirm(`Delete ${client.client_name || "this client"}? This can't be undone.`)) return;
    try {
      const response = await fetch(`${API_URL}/client/${client.id}/`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (response.status === 204 || response.status === 200) {
        refreshClients();
        toast.success("Client deleted");
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error) {
      toast.error("Failed to delete client. Please try again.");
    }
  };

  const actions = (c) => (
    <div style={S.actions}>
      {show(c.client_phone) && (
        <a href={`tel:${c.client_phone}`} style={S.iconBtn} onMouseOver={iconOn} onMouseOut={iconOff}
          aria-label={`Call ${c.client_name}`} title="Call">
          <Icon d={ICON.phone} />
        </a>
      )}
      <button type="button" style={S.iconBtn} onMouseOver={iconOn} onMouseOut={iconOff}
        onClick={() => setEditingClient(c)} aria-label={`Edit ${c.client_name}`} title="Edit">
        <Icon d={ICON.edit} />
      </button>
      <button type="button" style={S.iconBtn} data-danger="1" onMouseOver={iconOn} onMouseOut={iconOff}
        onClick={() => handleDelete(c)} aria-label={`Delete ${c.client_name}`} title="Delete">
        <Icon d={ICON.trash} />
      </button>
    </div>
  );

  const typePill = (c) => {
    if (!show(c.client_type)) return null;
    const t = typeStyle(c.client_type);
    return <span style={{ ...S.pill, color: t.color, background: t.bg }}>{c.client_type}</span>;
  };

  return (
    <div ref={rootRef}>
      <nav style={S.links} aria-label="Go to">
        Go to:
        {[
          ["/getquotation", "Quotations"],
          ["/saleorders", "Sales orders"],
          ["/getinvouchers", "In voucher"],
          ["/getoutvouchers", "Out voucher"],
          ["/purchase-orders", "Purchase orders"],
        ].map(([href, label]) => (
          <Link key={href} href={href} style={S.linkChip}>{label}</Link>
        ))}
      </nav>

      <div style={S.tools}>
        <span style={S.count}>
          {visible.length.toLocaleString("en-IN")} {visible.length === 1 ? "client" : "clients"}
          {userDetails?.role === "Sales Executive" ? " · added by you" : ""}
        </span>
        <select style={S.sort} value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort clients">
          {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {visible.length === 0 && <div style={S.empty}>No clients found.</div>}

      {/* ---------- Cards (tablet / phone) ---------- */}
      {visible.length > 0 && asCards && (
        <div style={S.cards}>
          {pageRows.map((c) => {
            const isNew = c.id === newClientId;
            return (
              <article key={c.id} style={{ ...S.card, ...(isNew ? { borderColor: GOLD, background: GOLD_SOFT } : null) }}>
                <div style={S.cardTop}>
                  <span style={S.avatar}>{initials(c.client_name)}</span>
                  <div style={S.cardBody}>
                    <div style={S.name}>
                      {c.client_name || "—"}
                      {isNew && <span style={S.newBadge}>New</span>}
                    </div>
                    {show(c.businessname) && <div style={S.small}>{c.businessname}</div>}
                  </div>
                  {actions(c)}
                </div>
                <div style={S.cardMeta}>
                  {show(c.client_phone) && <a href={`tel:${c.client_phone}`} style={S.phone}>{c.client_phone}</a>}
                  {(show(c.city) || show(c.state)) && <span>{[show(c.city), show(c.state)].filter(Boolean).join(", ")}</span>}
                  {show(c.gst_number) && <span>GST {c.gst_number}</span>}
                  {typePill(c)}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ---------- Table (desktop, no sideways scroll) ---------- */}
      {visible.length > 0 && !asCards && (
        <table style={S.table}>
          <colgroup>
            <col />
            <col style={{ width: 140 }} />
            <col style={{ width: "22%" }} />
            {width >= 1000 && <col style={{ width: 150 }} />}
            <col style={{ width: 96 }} />
            {width >= 1000 && <col style={{ width: 120 }} />}
            <col style={{ width: 104 }} />
          </colgroup>
          <thead>
            <tr>
              <th style={S.th}>Client</th>
              <th style={S.th}>Phone</th>
              <th style={S.th}>Location</th>
              {width >= 1000 && <th style={S.th}>GST</th>}
              <th style={S.th}>Type</th>
              {width >= 1000 && <th style={S.th}>Added by</th>}
              <th style={S.th}><span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((c) => {
              const isNew = c.id === newClientId;
              return (
                <tr key={c.id} data-new={isNew ? "1" : undefined}
                  style={isNew ? { background: GOLD_SOFT } : undefined}
                  onMouseOver={rowOn} onMouseOut={rowOff}>
                  <td style={S.td}>
                    <div style={S.name}>
                      {c.client_name || "—"}
                      {isNew && <span style={S.newBadge}>New</span>}
                    </div>
                    <div style={S.small}>
                      {[show(c.businessname), `#${c.id}`].filter(Boolean).join(" · ")}
                      {width < 1000 && show(c.gst_number) ? ` · GST ${c.gst_number}` : ""}
                    </div>
                  </td>
                  <td style={S.td}>
                    {show(c.client_phone) ? <a href={`tel:${c.client_phone}`} style={S.phone}>{c.client_phone}</a> : "—"}
                    {show(c.client_email) && <div style={S.small}>{c.client_email}</div>}
                  </td>
                  <td style={S.td}>
                    <div>{[show(c.city), show(c.state)].filter(Boolean).join(", ") || "—"}</div>
                    {(show(c.address) || show(c.pincode)) && (
                      <div style={S.small}>{[show(c.address), show(c.pincode)].filter(Boolean).join(" · ")}</div>
                    )}
                  </td>
                  {width >= 1000 && <td style={{ ...S.td, fontSize: 12, overflowWrap: "anywhere" }}>{show(c.gst_number) || <span style={{ color: MUTED }}>—</span>}</td>}
                  <td style={S.td}>{typePill(c) || <span style={{ color: MUTED }}>—</span>}</td>
                  {width >= 1000 && <td style={{ ...S.td, color: MUTED, overflowWrap: "anywhere" }}>{show(c.created_by) || "—"}</td>}
                  <td style={S.td}>{actions(c)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* ---------- Pagination ---------- */}
      {visible.length > PAGE_SIZE && (
        <nav style={S.pager} aria-label="Pagination">
          <span>{start + 1}–{Math.min(start + PAGE_SIZE, visible.length)} of {visible.length.toLocaleString("en-IN")}</span>
          <div style={S.pageBtns}>
            <button type="button" style={{ ...S.pageBtn, ...(current === 1 ? S.pageOff : null) }}
              disabled={current === 1} onClick={() => setPage(current - 1)} aria-label="Previous page">
              <Icon d={ICON.prev} size={13} />
            </button>
            <span style={{ alignSelf: "center", padding: "0 6px" }}>Page {current} of {totalPages}</span>
            <button type="button" style={{ ...S.pageBtn, ...(current === totalPages ? S.pageOff : null) }}
              disabled={current === totalPages} onClick={() => setPage(current + 1)} aria-label="Next page">
              <Icon d={ICON.next} size={13} />
            </button>
          </div>
        </nav>
      )}

      {editingClient && (
        <EditClientModal
          client={editingClient}
          onClose={() => setEditingClient(null)}
          onUpdated={refreshClients}
        />
      )}
    </div>
  );
};

export default GetClients;