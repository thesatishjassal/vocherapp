"use client"
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import ProfileMenu from "../components/ProfileMenu";

const Header = () => {
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    // Try to get the user_details cookie
    const userDetailsCookie = Cookies.get("user_details");
    if (userDetailsCookie) {
      // Parse and set the user details if the cookie exists
      setUserDetails(JSON.parse(userDetailsCookie));
    }
  }, []);
  return (
    <nav className="navbar sticky-top bg-body-tertiary no-print">
      <div className="container">
        <a className="navbar-brand" href="/dashboard">
          <img
            src="/assets/img/panviclogo.jpg"
            alt="Bootstrap"
            className="logo"
          />
        </a>

        <ul className="d-flex navbar-nav justify-content-end">
          <li className="nav-item d-flex align-items-center">
            {userDetails ? (
              <ProfileMenu userDetails={userDetails} />
            ) : (
              ""
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Header;
