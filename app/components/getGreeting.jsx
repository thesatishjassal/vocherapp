"use client"; // Since we're using hooks and client-side features
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

const getGreeting = (name) => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return `🌞 Good Morning, ${name}!`;
  } else if (hour >= 12 && hour < 17) {
    return `🌤️ Good Afternoon, ${name}!`;
  } else if (hour >= 17 && hour < 21) {
    return `🌆 Good Evening, ${name}!`;
  } else {
    return `🌙 Good Night, ${name}!`;
  }
};

const DynamicGreeting = () => {
  const [userName, setUserName] = useState("Friend"); // Default fallback
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Fetch user details from cookies
    const userDetailsCookie = Cookies.get("user_details");
    if (userDetailsCookie) {
      const userDetails = JSON.parse(userDetailsCookie);
      setUserName(userDetails.name || "Friend"); // Use name from cookie or fallback
    }
    // Trigger fade-in animation after component mounts
    setTimeout(() => setFadeIn(true), 100);
  }, []);

  return (
    <div className="greeting-container">
      <h4 className={`greeting-text ${fadeIn ? "fade-in" : ""}`}>
        {getGreeting(userName)}
      </h4>
      <p className="greeting-subtext">Ready to make today awesome? ✨</p>

      <style jsx>{`
        .greeting-container {
          // text-align: center;
          padding: 20px;
          // background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-radius: 15px;
          // box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }

        .greeting-text {
          font-size: 1.75rem;
          font-weight: 700;
          color: #2c3e50;
          margin: 0;
          transition: opacity 0.8s ease-in-out, transform 0.8s ease-in-out;
        }

        .fade-in {
          opacity: 1;
          transform: translateY(0);
        }

        .greeting-text:not(.fade-in) {
          opacity: 0;
          transform: translateY(20px);
        }

        .greeting-subtext {
          font-size: 1rem;
          color: #7f8c8d;
          margin-top: 5px;
          font-style: italic;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        .greeting-text:hover {
          animation: bounce 1s;
        }
      `}</style>
    </div>
  );
};

export default DynamicGreeting;