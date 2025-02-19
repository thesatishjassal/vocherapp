"use client";
import { usePathname } from "next/navigation";
import "../public/assets/css/soft-ui-dashboard.css";
import "../public/assets/css/nucleo-icons.css";
import "./globals.css";
import Header from "./components/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname(); // Get current route

  const hideHeaderRoutes = ["/" , "/login", "/signup"]; // Define routes where Header should be hidden

  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
          integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="g-sidenav-show bg-gray-100">
        {/* Render Header only if not on login or register page */}
        {!hideHeaderRoutes.includes(pathname) && <Header />}

        <main className="main-content container p-0">
          <div className="container">
          <ToastContainer position="top-right" autoClose={3000} />{children}</div>
        </main>
      </body>
    </html>
  );
}
