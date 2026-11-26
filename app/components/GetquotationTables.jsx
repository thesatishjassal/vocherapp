"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* ---------- Styles (inline, created once — same palette as the quotation pages) ---------- */

const GOLD = "#d3a01d";
const GOLD_SOFT = "#fbf5e9";
const LINE = "#eeeeee";
const MUTED = "#8a8a8a";
const INK = "#222";
const RED = "#d64545";

const STATUS = {
  active: { label: "Active", color: "#1f8a4c", bg: "#e8f6ee" },
  mature: { label: "Mature", color: "#2f5fd0", bg: "#eaf0fd" },
  lost: { label: "Lost", color: RED, bg: "#fdecec" },
};
const statusKey = (s) => (STATUS[String(s || "").toLowerCase()] ? String(s).toLowerCase() : "active");

const th = {
  padding: "8px 10px", borderBottom: `1px solid ${LINE}`, color: MUTED, fontSize: 11,
  fontWeight: 600, textAlign: "left", textTransform: "uppercase", letterSpacing: "0.04em",
  whiteSpace: "nowrap", background: "#fff",
};
const td = { padding: "12px 10px", borderBottom: `1px solid ${LINE}`, verticalAlign: "top" };

const S = {
  card: {
    padding: 20, background: "#fff", borderRadius: 12, color: INK, fontSize: 13, lineHeight: 1.45,
    fontFamily: "Arial, Helvetica, sans-serif",
    boxShadow: "0 1px 3px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)", boxSizing: "border-box",
  },
  head: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16, flexWrap: "wrap" },
  title: { margin: 0, fontSize: 18, fontWeight: 700 },
  sub: { marginTop: 2, color: MUTED, fontSize: 12 },
  addBtn: {
    display: "inline-flex", alignItems: "center", gap: 6, height: 36, padding: "0 16px",
    borderRadius: 8, background: GOLD, color: "#fff", fontWeight: 600, textDecoration: "none",
  },
  tools: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" },
  searchWrap: {
    display: "flex", alignItems: "center", gap: 6, flex: "1 1 260px", height: 36, padding: "0 10px",
    border: `1px solid #e3e3e3`, borderRadius: 8, background: "#fff", color: MUTED, boxSizing: "border-box",
  },
  search: { flex: 1, minWidth: 0, border: 0, outline: 0, background: "transparent", font: "inherit", fontSize: 13, color: INK },
  clear: { border: 0, background: "transparent", color: MUTED, fontSize: 16, cursor: "pointer", padding: 0, lineHeight: 1 },
  tabs: { display: "flex", padding: 3, borderRadius: 8, background: "#f3f3f3" },
  tab: {
    display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 12px", border: 0,
    borderRadius: 6, background: "transparent", color: MUTED, font: "inherit", fontSize: 12,
    fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
  },
  tabOn: { background: "#fff", color: INK, boxShadow: "0 1px 3px rgba(0,0,0,.1)" },
  tabCount: { color: MUTED, fontWeight: 400 },
  sort: {
    height: 36, padding: "0 30px 0 10px", border: `1px solid #e3e3e3`, borderRadius: 8, outline: "none",
    font: "inherit", fontSize: 12, color: INK, cursor: "pointer", appearance: "none",
    background: "#fff url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none' stroke='%238a8a8a' stroke-width='1.5'%3E%3Cpath d='m1 1 4 4 4-4'/%3E%3C/svg%3E\") no-repeat right 10px center",
  },
  wrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th,
  thNum: { ...th, textAlign: "right" },
  td,
  tdNum: { ...td, textAlign: "right", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" },
  strong: { fontWeight: 700 },
  small: { marginTop: 2, color: MUTED, fontSize: 11 },
  ellipsis: { maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  status: {
    height: 26, padding: "0 24px 0 10px", border: 0, borderRadius: 999, outline: "none",
    font: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer", appearance: "none",
  },
  actions: { display: "flex", justifyContent: "flex-end", gap: 2 },
  iconBtn: {
    display: "inline-flex", alignItems: "center", justifyContent: "center", width: 30, height: 30,
    padding: 0, border: 0, borderRadius: 6, background: "transparent", color: MUTED, cursor: "pointer",
  },
  empty: { padding: "40px 10px", color: MUTED, textAlign: "center" },
  // three-dot menu
  menu: {
    position: "fixed", zIndex: 1000, minWidth: 160, padding: 4, border: `1px solid ${LINE}`,
    borderRadius: 10, background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,.12)",
  },
  menuItem: {
    display: "flex", alignItems: "center", gap: 8, width: "100%", height: 32, padding: "0 10px",
    border: 0, borderRadius: 6, background: "#fff", color: INK, font: "inherit", fontSize: 13,
    textAlign: "left", cursor: "pointer", boxSizing: "border-box",
  },
  menuSep: { height: 1, margin: "4px 0", background: LINE },
  // pagination
  pager: {
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
    marginTop: 12, flexWrap: "wrap", color: MUTED, fontSize: 12,
  },
  pagerLeft: { display: "flex", alignItems: "center", gap: 8 },
  pagerBtns: { display: "flex", alignItems: "center", gap: 4 },
  pageBtn: {
    minWidth: 30, height: 30, padding: "0 8px", border: `1px solid #e3e3e3`, borderRadius: 7,
    background: "#fff", color: INK, font: "inherit", fontSize: 12, cursor: "pointer",
  },
  pageOn: { borderColor: GOLD, background: GOLD, color: "#fff", fontWeight: 700 },
  pageOff: { opacity: 0.4, cursor: "default" },
  pageGap: { padding: "0 4px", color: MUTED },
  pageSize: {
    height: 30, padding: "0 24px 0 8px", border: `1px solid #e3e3e3`, borderRadius: 7, outline: "none",
    font: "inherit", fontSize: 12, color: INK, cursor: "pointer", appearance: "none",
    background: "#fff url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5' fill='none' stroke='%238a8a8a' stroke-width='1.5'%3E%3Cpath d='m1 1 3 3 3-3'/%3E%3C/svg%3E\") no-repeat right 8px center",
  },
};

const PAGE_SIZES = [10, 25, 50, 100];

/** Page numbers with gaps: 1 … 4 5 6 … 20 */
const pageList = (page, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out = [1];
  const from = Math.max(2, page - 1);
  const to = Math.min(total - 1, page + 1);
  if (from > 2) out.push("…");
  for (let i = from; i <= to; i++) out.push(i);
  if (to < total - 1) out.push("…");
  out.push(total);
  return out;
};

const caret = (color) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5' fill='none' stroke='${encodeURIComponent(color)}' stroke-width='1.5'%3E%3Cpath d='m1 1 3 3 3-3'/%3E%3C/svg%3E") no-repeat right 9px center`;

// Hover effects done on the DOM node (no re-render)
const rowOn = (e) => (e.currentTarget.style.background = "#fafafa");
const rowOff = (e) => (e.currentTarget.style.background = "transparent");
const iconOn = (e) => {
  const danger = e.currentTarget.dataset.danger;
  e.currentTarget.style.background = danger ? "#fdecec" : GOLD_SOFT;
  e.currentTarget.style.color = danger ? RED : GOLD;
};
const iconOff = (e) => {
  e.currentTarget.style.background = "transparent";
  e.currentTarget.style.color = MUTED;
};

const Icon = ({ d, size = 15 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const ICON = {
  edit: "M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4",
  view: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  copy: "M9 9h11v11H9zM5 15H4V4h11v1",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5",
  plus: "M12 5v14M5 12h14",
  dots: "M12 6h.01M12 12h.01M12 18h.01",
  prev: "M15 18l-6-6 6-6",
  next: "M9 18l6-6-6-6",
};

const menuOn = (e) => {
  e.currentTarget.style.background = e.currentTarget.dataset.danger ? "#fdecec" : "#f6f6f6";
};
const menuOff = (e) => (e.currentTarget.style.background = "#fff");

/* Three-dot button + dropdown. The menu is position: fixed so the table's
   horizontal scroll never cuts it off; it opens under the button (or above if no room). */
const RowMenu = ({ items, label }) => {
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!pos) return;
    const close = (e) => {
      if (menuRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return;
      setPos(null);
    };
    const shut = () => setPos(null);
    const esc = (e) => e.key === "Escape" && (setPos(null), btnRef.current?.focus());
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    window.addEventListener("scroll", shut, true);
    window.addEventListener("resize", shut);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
      window.removeEventListener("scroll", shut, true);
      window.removeEventListener("resize", shut);
    };
  }, [pos]);

  const toggle = () => {
    if (pos) return setPos(null);
    const r = btnRef.current.getBoundingClientRect();
    const menuH = items.length * 32 + 20;
    const below = r.bottom + 4 + menuH < window.innerHeight;
    setPos({ top: below ? r.bottom + 4 : r.top - 4 - menuH, right: window.innerWidth - r.right });
  };

  return (
    <>
      <button ref={btnRef} type="button" style={{ ...S.iconBtn, ...(pos ? { background: GOLD_SOFT, color: GOLD } : null) }}
        onMouseOver={iconOn} onMouseOut={(e) => !pos && iconOff(e)}
        onClick={toggle} aria-haspopup="menu" aria-expanded={!!pos} aria-label={label} title="Actions">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
          strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d={ICON.dots} /></svg>
      </button>
      {pos && (
        <div ref={menuRef} role="menu" style={{ ...S.menu, top: pos.top, right: pos.right }}>
          {items.map((it, i) =>
            it === "sep" ? (
              <div key={`sep-${i}`} style={S.menuSep} />
            ) : (
              <button key={it.label} type="button" role="menuitem" data-danger={it.danger ? "1" : undefined}
                style={{ ...S.menuItem, color: it.danger ? RED : INK }}
                onMouseOver={menuOn} onMouseOut={menuOff}
                onClick={() => { setPos(null); it.onClick(); }}>
                <span style={{ color: it.danger ? RED : MUTED, display: "inline-flex" }}><Icon d={it.icon} size={14} /></span>
                {it.label}
              </button>
            )
          )}
        </div>
      )}
    </>
  );
};

/* ---------- Formatting ---------- */

const formatQuotationNo = (no) => {
  if (!no) return "N/A";
  return /^\d+$/.test(no) ? `PLQOT-${no}` : no;
};
const money = (v) =>
  `₹${(Number(v) || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A";
const formatTime = (iso) =>
  iso ? new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "";

const SORTS = [
  ["latest", "Newest first"],
  ["oldest", "Oldest first"],
  ["amount_high", "Amount: high to low"],
  ["amount_low", "Amount: low to high"],
];

/* ================================================================== */

const GetQuotationTables = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "" = all, "drafts" = unpublished drafts
  const [drafts, setDrafts] = useState([]);
  const [draftsLoading, setDraftsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("latest");
  const [userDetails, setUserDetails] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const router = useRouter();

  useEffect(() => {
    const cookie = Cookies.get("user_details");
    if (cookie) {
      try { setUserDetails(JSON.parse(cookie)); } catch (_) {}
    }
  }, []);

  const fetchAllClients = async () => {
    try {
      const response = await axios.get(`${API_URL}/clients/`, { withCredentials: true });
      return response.data.reduce((acc, client) => {
        acc[client.id] = client.businessname;
        return acc;
      }, {});
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      toast.error("Failed to load client data!");
      return {};
    }
  };

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const [quotationsResponse, clientsMap] = await Promise.all([
          axios.get(`${API_URL}/quotation/`, { withCredentials: true }),
          fetchAllClients(),
        ]);
        setQuotations(
          quotationsResponse.data
            .map((q) => ({ ...q, client_name: clientsMap[q.client_id] || null, status: q.status || "Active" }))
            .sort((a, b) => b.quotation_id - a.quotation_id)
        );
      } catch (error) {
        toast.error("Failed to load quotations!");
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotations();

    // Unpublished drafts saved from the New quotation page
    axios
      .get(`${API_URL}/quotation-drafts/`)
      .then((res) => setDrafts(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Drafts fetch error:", err))
      .finally(() => setDraftsLoading(false));
  }, []);

  const handleDelete = async (quotationId) => {
    if (!confirm("Are you sure you want to delete this quotation?")) return;
    try {
      const response = await axios.delete(`${API_URL}/quotation/${quotationId}/`, { withCredentials: true });
      if (response.status === 204 || response.status === 200) {
        setQuotations((prev) => prev.filter((q) => q.quotation_id !== quotationId));
        toast.success("Quotation deleted successfully!");
      }
    } catch (error) {
      toast.error(`Failed to delete quotation: ${error.message}`);
      console.error("Delete error:", error);
    }
  };

  const handleClone = async (quotationId) => {
    if (!confirm("Are you sure you want to clone this quotation?")) return;
    try {
      const response = await axios.post(`${API_URL}/quotation/${quotationId}/clone`, {}, { withCredentials: true });
      if (response.status === 200 || response.status === 201) {
        const newQuotation = {
          ...response.data,
          client_name: quotations.find((q) => q.quotation_id === quotationId)?.client_name || null,
          status: response.data.status || "Active",
        };
        setQuotations((prev) => [newQuotation, ...prev].sort((a, b) => b.quotation_id - a.quotation_id));
        toast.success("Quotation cloned successfully!");
      }
    } catch (error) {
      toast.error(`Failed to clone quotation: ${error.message}`);
      console.error("Clone error:", error);
    }
  };

  const handleStatusChange = async (quotationId, newStatus) => {
    try {
      const response = await axios.put(
        `${API_URL}/quotation/${quotationId}/`,
        { status: newStatus },
        { withCredentials: true }
      );
      if (response.status === 200 || response.status === 201) {
        setQuotations((prev) => prev.map((q) => (q.quotation_id === quotationId ? { ...q, status: newStatus } : q)));
        toast.success(`Status updated to ${newStatus}`);
      }
    } catch (error) {
      toast.error(`Failed to update status: ${error.message}`);
      console.error("Status update error:", error);
    }
  };

  const statusCounts = useMemo(
    () => quotations.reduce((acc, q) => { acc[statusKey(q.status)] += 1; return acc; }, { active: 0, mature: 0, lost: 0 }),
    [quotations]
  );

  const filteredQuotations = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    return quotations
      .filter((q) => {
        if (statusFilter && statusKey(q.status) !== statusFilter) return false;
        if (!term) return true;
        return [q.quotation_no, formatQuotationNo(q.quotation_no), q.quotation_id, q.client_name, q.businessname, q.salesperson, q.subject, q.created_by]
          .some((v) => String(v ?? "").toLowerCase().includes(term));
      })
      .sort((a, b) => {
        const amt = (q) => Number(q.amount_including_gst ?? q.amount_with_gst) || 0;
        if (sortOrder === "oldest") return a.quotation_id - b.quotation_id;
        if (sortOrder === "amount_high") return amt(b) - amt(a);
        if (sortOrder === "amount_low") return amt(a) - amt(b);
        return b.quotation_id - a.quotation_id;
      });
  }, [quotations, searchQuery, statusFilter, sortOrder]);

  // Back to page 1 whenever the search, filter, sort or page size changes
  useEffect(() => setPage(1), [searchQuery, statusFilter, sortOrder, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredQuotations.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageRows = filteredQuotations.slice(start, start + pageSize);

  const handleDeleteDraft = async (id) => {
    if (!confirm("Delete this draft? This can't be undone.")) return;
    try {
      await axios.delete(`${API_URL}/quotation-drafts/${id}`);
      setDrafts((prev) => prev.filter((d) => d.id !== id));
      toast.success("Draft deleted");
    } catch (error) {
      toast.error(`Failed to delete draft: ${error.message}`);
    }
  };

  const shownDrafts = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return drafts;
    return drafts.filter((d) =>
      [d.id, d.title, d.client_name, d.created_by].some((v) => String(v ?? "").toLowerCase().includes(term))
    );
  }, [drafts, searchQuery]);

  const tabs = [
    ["", "All", quotations.length],
    ["active", "Active", statusCounts.active],
    ["mature", "Mature", statusCounts.mature],
    ["lost", "Lost", statusCounts.lost],
    ["drafts", "Drafts", drafts.length],
  ];

  return (
    <section style={S.card}>
      {/* ---------- Header ---------- */}
      <header style={S.head}>
        <div>
          <h1 style={S.title}>Quotations</h1>
          <div style={S.sub}>
            {loading ? "Loading…" : `${quotations.length.toLocaleString("en-IN")} total`}
            {userDetails?.name && ` · signed in as ${userDetails.name}`}
          </div>
        </div>
        <Link href="/addquotation" style={S.addBtn}>
          <Icon d={ICON.plus} /> New quotation
        </Link>
      </header>

      {/* ---------- Search, status, sort ---------- */}
      <div style={S.tools}>
        <label style={S.searchWrap}>
          <Icon d={ICON.search} size={14} />
          <input
            type="search" style={S.search} value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quotation no, client, salesperson or subject"
            aria-label="Search quotations"
          />
          {searchQuery && (
            <button type="button" style={S.clear} onClick={() => setSearchQuery("")} aria-label="Clear search">×</button>
          )}
        </label>

        <div style={S.tabs} role="tablist" aria-label="Filter by status">
          {tabs.map(([key, label, count]) => (
            <button key={key || "all"} type="button" role="tab" aria-selected={statusFilter === key}
              style={statusFilter === key ? { ...S.tab, ...S.tabOn } : S.tab}
              onClick={() => setStatusFilter(key)}>
              {label} <span style={S.tabCount}>{count}</span>
            </button>
          ))}
        </div>

        <select style={S.sort} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} aria-label="Sort">
          {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {/* ---------- Drafts ---------- */}
      {statusFilter === "drafts" && (
        <div style={S.wrap}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Draft</th>
                <th style={S.th}>Client</th>
                <th style={S.thNum}>Items</th>
                <th style={S.thNum}>Total</th>
                <th style={S.th}>Last saved</th>
                <th style={{ ...S.th, textAlign: "right" }}><span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {shownDrafts.map((d) => (
                <tr key={d.id} onMouseOver={rowOn} onMouseOut={rowOff}>
                  <td style={S.td}>
                    <Link href={`/addquotation?draft=${d.id}`} style={{ ...S.strong, color: INK, textDecoration: "none" }}>
                      {d.title || "Untitled draft"}
                    </Link>
                    <div style={S.small}>Draft #{d.id}{d.created_by ? ` · by ${d.created_by}` : ""}</div>
                  </td>
                  <td style={S.td}><div style={S.ellipsis}>{d.client_name || "—"}</div></td>
                  <td style={S.tdNum}>{d.item_count}</td>
                  <td style={S.tdNum}><span style={S.strong}>{money(d.total)}</span></td>
                  <td style={{ ...S.td, whiteSpace: "nowrap" }}>
                    {formatDate(d.updated_at || d.created_at)}
                    <div style={S.small}>{formatTime(d.updated_at || d.created_at)}</div>
                  </td>
                  <td style={S.td}>
                    <div style={S.actions}>
                      <RowMenu
                        label={`Actions for draft ${d.id}`}
                        items={[
                          { label: "Continue editing", icon: ICON.edit, onClick: () => router.push(`/addquotation?draft=${d.id}`) },
                          "sep",
                          { label: "Delete draft", icon: ICON.trash, danger: true, onClick: () => handleDeleteDraft(d.id) },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {!draftsLoading && shownDrafts.length === 0 && (
                <tr>
                  <td style={S.empty} colSpan={6}>
                    {drafts.length ? "No drafts match your search." : "No drafts. On a new quotation, press “Save draft” to keep it here."}
                  </td>
                </tr>
              )}
              {draftsLoading && <tr><td style={S.empty} colSpan={6}>Loading drafts…</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------- Table ---------- */}
      {statusFilter !== "drafts" && (<>
      <div style={S.wrap}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Quotation</th>
              <th style={S.th}>Client</th>
              <th style={S.th}>Date</th>
              <th style={S.th}>Salesperson</th>
              <th style={S.thNum}>Total (incl. GST)</th>
              <th style={S.th}>Status</th>
              <th style={{ ...S.th, textAlign: "right" }}><span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((q) => {
              const key = statusKey(q.status);
              const st = STATUS[key];
              return (
                <tr key={q.quotation_id} onMouseOver={rowOn} onMouseOut={rowOff}>
                  <td style={S.td}>
                    <Link href={`/viewquotation/${q.quotation_id}`} style={{ ...S.strong, color: INK, textDecoration: "none" }}>
                      {formatQuotationNo(q.quotation_no)}
                    </Link>
                    <div style={{ ...S.small, ...S.ellipsis }} title={q.subject}>
                      {q.subject || "No subject"}
                    </div>
                  </td>
                  <td style={S.td}>
                    <div style={S.ellipsis}>{q.client_name || q.businessname || "—"}</div>
                    <div style={S.small}>ID {q.quotation_id}</div>
                  </td>
                  <td style={{ ...S.td, whiteSpace: "nowrap" }}>
                    {formatDate(q.created_at)}
                    <div style={S.small}>{formatTime(q.created_at)}</div>
                  </td>
                  <td style={S.td}>
                    {q.salesperson || "—"}
                    {q.created_by && q.created_by !== q.salesperson && (
                      <div style={S.small}>by {q.created_by}</div>
                    )}
                  </td>
                  <td style={S.tdNum}>
                    <span style={S.strong}>{money(q.amount_including_gst)}</span>
                    <div style={S.small}>
                      {money(q.without_gst)} + GST {money(q.gst_amount)}
                    </div>
                  </td>
                  <td style={S.td}>
                    <select
                      value={st.label}
                      onChange={(e) => handleStatusChange(q.quotation_id, e.target.value)}
                      style={{ ...S.status, color: st.color, background: `${st.bg} ${caret(st.color)}` }}
                      aria-label={`Status for ${formatQuotationNo(q.quotation_no)}`}
                    >
                      {Object.values(STATUS).map((s) => <option key={s.label} value={s.label}>{s.label}</option>)}
                    </select>
                  </td>
                  <td style={S.td}>
                    <div style={S.actions}>
                      <RowMenu
                        label={`Actions for ${formatQuotationNo(q.quotation_no)}`}
                        items={[
                          { label: "View", icon: ICON.view, onClick: () => router.push(`/viewquotation/${q.quotation_id}`) },
                          { label: "Edit", icon: ICON.edit, onClick: () => router.push(`/editquotation/${q.quotation_id}`) },
                          { label: "Clone", icon: ICON.copy, onClick: () => handleClone(q.quotation_id) },
                          "sep",
                          { label: "Delete", icon: ICON.trash, danger: true, onClick: () => handleDelete(q.quotation_id) },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}

            {!loading && filteredQuotations.length === 0 && (
              <tr>
                <td style={S.empty} colSpan={7}>
                  {quotations.length ? "No quotations match your search." : "No quotations yet — create your first one."}
                </td>
              </tr>
            )}
            {loading && (
              <tr><td style={S.empty} colSpan={7}>Loading quotations…</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && filteredQuotations.length > 0 && (
        <nav style={S.pager} aria-label="Pagination">
          <div style={S.pagerLeft}>
            <span>
              {start + 1}–{Math.min(start + pageSize, filteredQuotations.length)} of{" "}
              {filteredQuotations.length.toLocaleString("en-IN")}
              {filteredQuotations.length !== quotations.length && ` (filtered from ${quotations.length})`}
            </span>
            <select style={S.pageSize} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}
              aria-label="Rows per page">
              {PAGE_SIZES.map((n) => <option key={n} value={n}>{n} / page</option>)}
            </select>
          </div>

          {totalPages > 1 && (
            <div style={S.pagerBtns}>
              <button type="button" style={{ ...S.pageBtn, ...(currentPage === 1 ? S.pageOff : null) }}
                disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} aria-label="Previous page">
                <Icon d={ICON.prev} size={13} />
              </button>
              {pageList(currentPage, totalPages).map((n, i) =>
                n === "…" ? (
                  <span key={`gap-${i}`} style={S.pageGap}>…</span>
                ) : (
                  <button key={n} type="button" style={n === currentPage ? { ...S.pageBtn, ...S.pageOn } : S.pageBtn}
                    aria-current={n === currentPage ? "page" : undefined} onClick={() => setPage(n)}>
                    {n}
                  </button>
                )
              )}
              <button type="button" style={{ ...S.pageBtn, ...(currentPage === totalPages ? S.pageOff : null) }}
                disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)} aria-label="Next page">
                <Icon d={ICON.next} size={13} />
              </button>
            </div>
          )}
        </nav>
      )}
      </>)}
    </section>
  );
};

export default GetQuotationTables;