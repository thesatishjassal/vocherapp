"use client";
import React, { useEffect, useMemo, useRef, useState, useDeferredValue, useCallback, memo } from "react";
import { ClientFormModal } from "./ClientFormModal";

/* ---------- Clients: fetched once per page load and shared ---------- */

const MAX_RESULTS = 50;
let clientsCache = null;
let inflight = null;

const withSearch = (c) => ({
  ...c,
  _s: [c.client_name, c.businessname, c.city, c.state, c.gst_number, c.client_phone, c.client_email]
    .filter(Boolean).join(" ").toLowerCase(),
});

/** Add a just-created client to the shared list (used by the Clients page too). */
export const rememberClient = (client) => {
  if (!client || !clientsCache) return;
  clientsCache = [withSearch(client), ...clientsCache.filter((c) => c.id !== client.id)];
};

const loadClients = (API_URL) => {
  if (clientsCache) return Promise.resolve(clientsCache);
  if (inflight) return inflight;
  inflight = fetch(`${API_URL}/clients/`)
    .then((r) => {
      if (!r.ok) throw new Error("Could not load customers");
      return r.json();
    })
    .then((data) => {
      // newest first, so a client added a minute ago is at the top
      clientsCache = (Array.isArray(data) ? data : []).slice().reverse().map(withSearch);
      return clientsCache;
    })
    .finally(() => { inflight = null; });
  return inflight;
};

/* ---------- Styles (inline, same look as Find product) ---------- */

const GOLD = "#d3a01d";
const GOLD_DARK = "#b98912";
const GOLD_SOFT = "#fbf5e9";
const LINE = "#e3e3e3";
const MUTED = "#8a8a8a";
const INK = "#292929";

const S = {
  overlay: {
    position: "fixed", inset: 0, zIndex: 1060, display: "flex", alignItems: "center",
    justifyContent: "center", padding: 12, background: "rgba(0,0,0,.45)", boxSizing: "border-box",
  },
  card: {
    width: "100%", maxWidth: 480, maxHeight: "85vh", display: "flex", flexDirection: "column",
    padding: 16, background: "#fff", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,.18)",
    color: INK, fontFamily: "Arial, Helvetica, sans-serif", fontSize: 13, boxSizing: "border-box",
  },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  title: { margin: 0, fontSize: 16, fontWeight: 700 },
  close: {
    width: 28, height: 28, border: 0, background: "transparent", color: MUTED,
    fontSize: 22, cursor: "pointer", lineHeight: 1,
  },
  input: {
    width: "100%", height: 36, padding: "0 10px", border: `1px solid ${LINE}`, borderRadius: 7,
    outline: "none", font: "inherit", fontSize: 13, boxSizing: "border-box", marginBottom: 8, flexShrink: 0,
  },
  list: { flex: 1, minHeight: 80, overflowY: "auto", margin: "0 -4px", padding: "0 4px" },
  row: {
    display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px", border: 0,
    borderRadius: 7, background: "#fff", textAlign: "left", cursor: "pointer", font: "inherit", color: "inherit",
  },
  rowOn: { background: GOLD_SOFT, boxShadow: `inset 0 0 0 1px ${GOLD}` },
  avatar: {
    flex: "0 0 32px", width: 32, height: 32, borderRadius: "50%", display: "inline-flex",
    alignItems: "center", justifyContent: "center", background: "#f3f3f3", color: MUTED,
    fontSize: 12, fontWeight: 700, textTransform: "uppercase",
  },
  avatarOn: { background: GOLD, color: "#fff" },
  rowText: { minWidth: 0, flex: 1 },
  rowName: { fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  rowMeta: { marginTop: 1, color: MUTED, fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  note: { padding: "18px 8px", color: MUTED, textAlign: "center" },
  more: { padding: "6px 8px", color: MUTED, fontSize: 11 },
  detail: {
    flexShrink: 0, marginTop: 10, padding: "10px 12px", borderRadius: 8, background: "#f8f8f8",
    display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 12, rowGap: 3, fontSize: 12,
  },
  dKey: { color: MUTED },
  dVal: { minWidth: 0, overflowWrap: "anywhere" },
  actions: { display: "flex", gap: 8, marginTop: 12, flexShrink: 0 },
  cancel: {
    flex: 1, height: 36, border: `1px solid ${LINE}`, borderRadius: 7, background: "#fff",
    color: "#555", fontSize: 13, fontWeight: 600, cursor: "pointer",
  },
  submit: {
    flex: 2, height: 36, border: 0, borderRadius: 7, background: GOLD, color: "#fff",
    fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "background .15s",
  },
  newBtn: {
    display: "inline-flex", alignItems: "center", gap: 5, height: 30, padding: "0 10px", marginRight: 4,
    border: `1px solid ${LINE}`, borderRadius: 8, background: "#fff", color: GOLD_DARK,
    font: "inherit", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
  },
  addRow: {
    display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px", marginTop: 2,
    border: `1px dashed ${LINE}`, borderRadius: 7, background: "#fff", textAlign: "left",
    cursor: "pointer", font: "inherit", color: GOLD_DARK, fontWeight: 600,
  },
  retry: {
    marginTop: 8, height: 30, padding: "0 12px", border: `1px solid ${LINE}`, borderRadius: 7,
    background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600,
  },
};

const initials = (name) =>
  String(name || "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("") || "?";

const hoverOn = (e) => { if (!e.currentTarget.dataset.on) e.currentTarget.style.background = "#fafafa"; };
const hoverOff = (e) => { if (!e.currentTarget.dataset.on) e.currentTarget.style.background = "#fff"; };

/* ---------- Row ---------- */

const Row = memo(({ c, active, onPick, onConfirm }) => (
  <button
    type="button"
    data-on={active ? "1" : undefined}
    style={active ? { ...S.row, ...S.rowOn } : S.row}
    onClick={() => onPick(c)}
    onDoubleClick={() => onConfirm(c)}
    onMouseOver={hoverOn}
    onMouseOut={hoverOff}
    aria-pressed={active}
  >
    <span style={active ? { ...S.avatar, ...S.avatarOn } : S.avatar}>{initials(c.client_name)}</span>
    <span style={S.rowText}>
      <span style={{ ...S.rowName, display: "block" }}>{c.client_name || "Unnamed"}</span>
      <span style={{ ...S.rowMeta, display: "block" }}>
        {[c.businessname, [c.city, c.state].filter(Boolean).join(", "), c.gst_number].filter(Boolean).join(" · ") || "—"}
      </span>
    </span>
  </button>
));
Row.displayName = "Row";

/* ---------- Modal ---------- */

const CustomerModal = ({ client, onClose, onConfirm }) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [clients, setClients] = useState(clientsCache || []);
  const [loading, setLoading] = useState(!clientsCache);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [adding, setAdding] = useState(false);
  const [prefill, setPrefill] = useState(null);
  const deferred = useDeferredValue(query);
  const inputRef = useRef(null);

  const load = useCallback(() => {
    setError(null);
    setLoading(true);
    loadClients(API_URL)
      .then(setClients)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [API_URL]);

  useEffect(() => {
    load();
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [load]);

  const { results, total } = useMemo(() => {
    const words = deferred.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matches = words.length ? clients.filter((c) => words.every((w) => c._s.includes(w))) : clients;
    return { results: matches.slice(0, MAX_RESULTS), total: matches.length };
  }, [clients, deferred]);

  const confirm = useCallback((c) => {
    const pick = c || selected;
    if (!pick) return;
    const { _s, ...clientData } = pick;
    onConfirm(clientData);
    onClose();
  }, [selected, onConfirm, onClose]);

  const openAdd = useCallback(() => {
    const q = query.trim();
    setPrefill(q ? (/^[\d+\-\s]{6,}$/.test(q) ? { client_phone: q } : { client_name: q }) : null);
    setAdding(true);
  }, [query]);

  // New client saved -> add to the list and use it for this quotation straight away
  const onClientSaved = useCallback((client) => {
    rememberClient(client);
    setClients(clientsCache || [withSearch(client)]);
    setAdding(false);
    confirm(withSearch(client));
  }, [confirm]);

  const onKeyDown = (e) => {
    if (adding) return;
    if (e.key === "Escape") onClose();
    if (e.key === "Enter" && e.target === inputRef.current) {
      e.preventDefault();
      if (selected) confirm();
      else if (results[0]) setSelected(results[0]);
    }
  };

  if (!client) return null;

  return (
    <div style={S.overlay} role="dialog" aria-modal="true" aria-label="Select a customer"
      onMouseDown={(e) => !adding && e.target === e.currentTarget && onClose()}>
      <div style={S.card} onKeyDown={onKeyDown}>
        <header style={S.header}>
          <h1 style={S.title}>Select customer</h1>
          <span style={{ display: "flex", alignItems: "center" }}>
            <button type="button" style={S.newBtn} onClick={openAdd}>+ New customer</button>
            <button type="button" style={S.close} onClick={onClose} aria-label="Close">&times;</button>
          </span>
        </header>

        <input
          ref={inputRef}
          type="search"
          style={S.input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={(e) => (e.currentTarget.style.borderColor = GOLD)}
          onBlur={(e) => (e.currentTarget.style.borderColor = LINE)}
          placeholder="Search name, business, city, GST or phone…"
          aria-label="Search customers"
        />

        <div style={S.list}>
          {loading && <div style={S.note}>Loading customers…</div>}
          {error && (
            <div style={S.note}>
              {error}
              <div><button type="button" style={S.retry} onClick={load}>Try again</button></div>
            </div>
          )}
          {!loading && !error && results.length === 0 && (
            <div style={S.note}>
              {clients.length ? "No matching customers" : "No customers yet"}
              <button type="button" style={{ ...S.addRow, justifyContent: "center", marginTop: 10 }} onClick={openAdd}>
                + Add {query.trim() ? `“${query.trim()}”` : "a new customer"}
              </button>
            </div>
          )}
          {results.map((c) => (
            <Row key={c.id} c={c} active={selected?.id === c.id} onPick={setSelected} onConfirm={confirm} />
          ))}
          {total > MAX_RESULTS && (
            <div style={S.more}>Showing {MAX_RESULTS} of {total.toLocaleString("en-IN")} — type more to narrow down</div>
          )}
        </div>

        {selected && (
          <div style={S.detail} aria-live="polite">
            {[
              ["Business", selected.businessname],
              ["GST", selected.gst_number],
              ["Phone", selected.client_phone],
              ["Email", selected.client_email],
              ["Address", [selected.city, selected.state, selected.pincode].filter(Boolean).join(", ")],
              ["Type", selected.client_type],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <React.Fragment key={k}>
                  <span style={S.dKey}>{k}</span>
                  <span style={S.dVal}>{v}</span>
                </React.Fragment>
              ))}
          </div>
        )}

        <ClientFormModal open={adding} initial={prefill} onClose={() => setAdding(false)} onSaved={onClientSaved} />

        <div style={S.actions}>
          <button type="button" style={S.cancel} onClick={onClose}>Cancel</button>
          <button
            type="button"
            style={{ ...S.submit, opacity: selected ? 1 : 0.5, cursor: selected ? "pointer" : "default" }}
            disabled={!selected}
            onClick={() => confirm()}
            onMouseOver={(e) => selected && (e.currentTarget.style.background = GOLD_DARK)}
            onMouseOut={(e) => (e.currentTarget.style.background = GOLD)}
          >
            {selected ? `Use ${selected.client_name || "customer"}` : "Select a customer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerModal;