"use client"
import React, { useState } from "react";

const ProfileMenu = () => {
  // State to handle menu visibility
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Toggle the menu visibility
  const toggleMenu = (e) => {
    e.stopPropagation(); // Prevent closing the menu when clicking inside
    setIsMenuOpen((prev) => !prev);
  };

  // Close the menu if clicked outside
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="profile-menu" onClick={(e) => e.stopPropagation()}>
      <div className="profile" onClick={toggleMenu}>
        <div className="user">
          <h3>Katherine Cooper</h3>
          <p>@probablykat66</p>
        </div>
        <div className="img-box">
          <img
            src="https://i.postimg.cc/BvNYhMHS/user-img.jpg"
            alt="User Image"
          />
        </div>
      </div>
      {isMenuOpen && (
        <div className="menu">
          <ul>
            <li>
              <a href="#">
                <i className="ph-bold ph-user"></i> Profile
              </a>
            </li>
            <li>
              <a href="/warehouse">
                <i className="ph-bold ph-gear-six"></i> Warehouse
              </a>
            </li>
            <li>
              <a href="#">
                <i className="ph-bold ph-sign-out"></i> Sign Out
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

// Handle outside click to close the menu
const App = () => {
  const handleDocumentClick = () => {
    // Dispatch custom events if necessary
  };

  React.useEffect(() => {
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  return (
    <div>
      <ProfileMenu />
    </div>
  );
};

export default App;
