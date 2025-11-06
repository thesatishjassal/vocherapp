"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import ProfileMenu from "../components/ProfileMenu";

const Header = () => {
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const userDetailsCookie = Cookies.get("user_details");
    if (userDetailsCookie) {
      setUserDetails(JSON.parse(userDetailsCookie));
    }
  }, []);

  return (
    <nav className="navbar sticky-top bg-body-tertiary no-print">
      <div className="container d-flex justify-content-between align-items-center">
        {/* Left: Logo */}
        <a className="navbar-brand" href="/dashboard">
          <img
            src="/assets/img/panviclogo.jpg"
            alt="Bootstrap"
            className="logo"
            style={{ height: "40px" }}
          />
        </a>

        {/* Center: Links */}
        <ul className="navbar-nav flex-row gap-4 mx-auto">
          <li className="nav-item">
            <a className="nav-link fw-semibold text-light" href="/switchesCatalog">
              Downloads
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link fw-semibold text-light" href="/report">
              Reports
            </a>
          </li>
        </ul>

        {/* Right: Profile Menu */}
        <ul className="navbar-nav">
          <li className="nav-item d-flex align-items-center">
            {userDetails ? <ProfileMenu userDetails={userDetails} /> : ""}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Header;
