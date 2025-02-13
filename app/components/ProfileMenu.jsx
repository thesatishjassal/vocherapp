"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation"; // for redirecting

const ProfileMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const router = useRouter(); // Router for redirecting

  // Toggle the menu visibility
  const toggleMenu = (e) => {
    e.stopPropagation(); // Prevent closing the menu when clicking inside
    setIsMenuOpen((prev) => !prev);
  };

  // Close the menu if clicked outside
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Fetch user details from cookies on mount
  useEffect(() => {
    const userDetailsCookie = Cookies.get("user_details");

    if (userDetailsCookie) {
      const user = JSON.parse(userDetailsCookie); // Parse and set user details
      setUserDetails(user);
    }
  }, []);

  // Logout function
  const handleLogout = () => {
    // Remove user details from cookies
    Cookies.remove("user_details");
    // Redirect to the login page
    router.push("/login");
  };

  return (
    <div className="profile-menu" onClick={(e) => e.stopPropagation()}>
      <div className="profile" onClick={toggleMenu}>
        <div className="user">
          {userDetails ? (
            <>
              <h3>{userDetails.name}</h3>
              <p>@{userDetails.phone}</p>
            </>
          ) : (
            <p>Loading...</p> // Show loading if user details are not available
          )}
        </div>
        <div className="img-box">
          <img
            src="/assets/img/avtar.png"
            alt="User Image"
          />
        </div>
      </div>
      {isMenuOpen && (
        <div className="menu">
          <ul>
            <li>
              <a onClick={handleLogout}>
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
    // Handle any logic when clicking outside
  };

  useEffect(() => {
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
