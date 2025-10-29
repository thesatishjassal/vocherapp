"use client";

import { useEffect } from "react";

export default function Welcome() {
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hostname === "www.panvik.in") {
      window.location.href = "https://www.panvik.com/";
    }
  }, []);

  return <h3>Welcome!</h3>;
}
