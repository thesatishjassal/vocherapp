import { useEffect } from "react";

const Welcome = () => {
  useEffect(() => {
    if (window.location.hostname === "www.panvik.in") {
      window.location.href = "https://www.panvik.com/";
    }
  }, []);

  return <h3>Welcome!</h3>;
};

export default Welcome;
