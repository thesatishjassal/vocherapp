"use client";

import React from "react";
import { toast } from "react-toastify";
import { ClientFormModal } from "./ClientFormModal";
import { rememberClient } from "./customerModal";

/**
 * Edit client — uses the same form as "Add client", so both look and work the same.
 * Props are unchanged: { client, onClose, onUpdated }
 */
export default function EditClientModal({ client, onClose, onUpdated }) {
  if (!client) return null;

  const onSaved = (updated) => {
    toast.success(`${updated.client_name || "Client"} updated`);
    rememberClient(updated); // the quotation customer picker shows the new details too
    if (onUpdated) onUpdated(updated);
    onClose();
  };

  return <ClientFormModal open client={client} onClose={onClose} onSaved={onSaved} />;
}