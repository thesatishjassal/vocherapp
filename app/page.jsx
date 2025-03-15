"use client"
"use client"; // 👈 This makes sure this component runs only on client side

import { useEffect } from "react";

const Welcome = () => {
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hostname === "www.panvik.in") {
      setTimeout(() => {
        window.location.href = "https://www.panvik.com/";
      }, 1000); // 2 seconds delay
    }
  }, []); // Empty dependency array to run only once on mount

  return <h3>Welcome!</h3>;
};

export default Welcome;
