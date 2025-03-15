import { useEffect } from "react";

const Welcome = () => {
  useEffect(() => {
    if (window.location.hostname === "www.panvik.in") {
      setTimeout(() => {
        window.location.href = "https://www.panvik.com/";
      }, 2000); // 2000ms = 2 seconds
    }
  }, []); // Empty dependency array, runs only once on mount

  return <h3>Welcome!</h3>;
};

export default Welcome;
