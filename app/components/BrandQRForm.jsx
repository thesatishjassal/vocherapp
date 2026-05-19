"use client";

import { useEffect, useState } from "react";

export default function BrandQRForm() {

  const API_URL = "https://api.panvic.in";

  const [brandName, setBrandName] = useState("");
  const [pdfLink, setPdfLink] = useState("");

  const [brands, setBrands] = useState([]);

  const [loading, setLoading] = useState(false);

  const [editId, setEditId] = useState(null);

  // FETCH ALL
  const fetchBrands = async () => {

    try {

      const response = await fetch(
        `${API_URL}/brands/`
      );

      const data = await response.json();

      setBrands(data);

    } catch (error) {

      console.log(error);

    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // CREATE + UPDATE
  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const payload = {
        brand_name: brandName,
        pdf_link: pdfLink,
      };

      // UPDATE
      if (editId) {

        await fetch(
          `${API_URL}/brands/${editId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

      }

      // CREATE
      else {

        await fetch(
          `${API_URL}/brands/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

      }

      // RESET
      setBrandName("");
      setPdfLink("");
      setEditId(null);

      fetchBrands();

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  };

  // EDIT
  const handleEdit = (item) => {

    setBrandName(item.brand_name);
    setPdfLink(item.pdf_link);
    setEditId(item.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // DELETE
  const handleDelete = async (id) => {

    const confirmDelete = confirm(
      "Delete this brand?"
    );

    if (!confirmDelete) return;

    try {

      await fetch(
        `${API_URL}/brands/${id}`,
        {
          method: "DELETE",
        }
      );

      fetchBrands();

    } catch (error) {

      console.log(error);

    }
  };

  return (
    <>
      <div className="brandqr">

        {/* HERO */}
        <section className="brandqr__hero">

          <div className="brandqr__heroContent">

            <h1 className="brandqr__heroTitle">
              Brand QR Dashboard
            </h1>

            <p className="brandqr__heroDescription">
              Create, update, delete and manage
              QR codes for your brands.
            </p>

          </div>

        </section>

        {/* MAIN */}
        <div className="brandqr__container">

          {/* FORM */}
          <div className="brandqr__card">

            <div className="brandqr__cardHeader">

              <div>

                <h2 className="brandqr__title">
                  {editId
                    ? "Update Brand"
                    : "Create Brand"}
                </h2>

                <p className="brandqr__text">
                  Manage QR brands easily
                </p>

              </div>

            </div>

            <form
              onSubmit={handleSubmit}
              className="brandqr__form"
            >

              <div className="brandqr__group">

                <label className="brandqr__label">
                  Brand Name
                </label>

                <input
                  type="text"
                  className="brandqr__input"
                  placeholder="Enter brand name"
                  value={brandName}
                  onChange={(e) =>
                    setBrandName(e.target.value)
                  }
                  required
                />

              </div>

              <div className="brandqr__group">

                <label className="brandqr__label">
                  PDF Link
                </label>

                <input
                  type="url"
                  className="brandqr__input"
                  placeholder="https://example.com"
                  value={pdfLink}
                  onChange={(e) =>
                    setPdfLink(e.target.value)
                  }
                  required
                />

              </div>

              <button
                type="submit"
                className="brandqr__button"
              >
                {loading
                  ? "Please wait..."
                  : editId
                  ? "Update Brand"
                  : "Create Brand"}
              </button>

            </form>

          </div>

          {/* TABLE */}
          <div className="brandqr__tableCard">

            <div className="brandqr__tableHeader">

              <h2 className="brandqr__title">
                All Brands
              </h2>

              <span className="brandqr__count">
                {brands.length}
              </span>

            </div>

            <div className="brandqr__tableWrapper">

              <table className="brandqr__table">

                <thead>

                  <tr>

                    <th>QR</th>
                    <th>Brand</th>
                    <th>Link</th>
                    <th>Actions</th>

                  </tr>

                </thead>

                <tbody>

                  {brands.map((item) => (

                    <tr key={item.id}>

                      <td>

                        <img
                          src={`${API_URL}/${item.qr_code}`}
                          alt={item.brand_name}
                          className="brandqr__tableQR"
                        />

                      </td>

                      <td>
                        {item.brand_name}
                      </td>

                      <td>

                        <a
                          href={item.pdf_link}
                          target="_blank"
                          className="brandqr__link"
                        >
                          Open
                        </a>

                      </td>

                      <td>

                        <div className="brandqr__actions">

                          <button
                            className="brandqr__edit"
                            onClick={() =>
                              handleEdit(item)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="brandqr__delete"
                            onClick={() =>
                              handleDelete(item.id)
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      </div>

      <style jsx>{`

        .brandqr {
          min-height: 100vh;
          background: #f8fafc;
          padding-bottom: 60px;
        }

        /* HERO */

        .brandqr__hero {
          padding: 90px 20px 60px;
          text-align: center;
        }

        .brandqr__heroContent {
          max-width: 760px;
          margin: 0 auto;
        }

        .brandqr__badge {
          display: inline-flex;
          padding: 8px 16px;
          background: #eaf2ff;
          color: #2563eb;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .brandqr__heroTitle {
          font-size: 25px;
          line-height: 1;
          font-weight: 700;
          color: #111827;
          margin-bottom: 20px;
        }

        .brandqr__heroDescription {
          max-width: 560px;
          margin: 0 auto;
          font-size: 17px;
          color: #6b7280;
          line-height: 1.7;
        }

        /* CONTAINER */

        .brandqr__container {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 20px;
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 24px;
        }

        /* CARD */

        .brandqr__card,
        .brandqr__tableCard {
          background: white;
          border-radius: 24px;
          border: 1px solid #e5e7eb;
          padding: 28px;
        }

        .brandqr__cardHeader,
        .brandqr__tableHeader {
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .brandqr__title {
          font-size: 22px;
          font-weight: 700;
          color: #111827;
        }

        .brandqr__text {
          font-size: 14px;
          color: #6b7280;
        }

        .brandqr__count {
          width: 36px;
          height: 36px;
          border-radius: 100%;
          background: #eff6ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
        }

        /* FORM */

        .brandqr__form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .brandqr__group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .brandqr__label {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
        }

.brandqr__input {
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    outline: none;
    width: 100%;
    height: 52px;
    padding: 0 16px;
    font-size: 14px;
    transition: all .3s;
    background: #eeeeee;
    color:#000;
}

        .brandqr__input:focus {
          border-color: #2563eb;
          box-shadow:
            0 0 0 4px rgba(37,99,235,0.08);
        }

        .brandqr__button {
          width: 100%;
          height: 52px;
          border: none;
          border-radius: 14px;
          background: #111827;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        /* TABLE */

        .brandqr__tableWrapper {
          overflow-x: auto;
        }

        .brandqr__table {
          width: 100%;
          border-collapse: collapse;
        }

        .brandqr__table th {
          text-align: left;
          padding: 14px;
          font-size: 12px;
          color: #6b7280;
          border-bottom: 1px solid #f1f5f9;
        }

        .brandqr__table td {
          padding: 16px 14px;
          border-bottom: 1px solid #f8fafc;
          font-size: 14px;
        }

        .brandqr__tableQR {
          width: 100px;
          height: 100px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          padding: 6px;
          background: white;
        }

        .brandqr__link {
          color: #2563eb;
          font-weight: 600;
          font-size: 13px;
        }

        /* ACTIONS */

        .brandqr__actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .brandqr__edit,
        .brandqr__delete {
          border: none;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .brandqr__edit {
          background: #eff6ff;
          color: #2563eb;
        }

        .brandqr__delete {
          background: #fef2f2;
          color: #dc2626;
        }

        /* MOBILE */

        @media (max-width: 900px) {

          .brandqr__container {
            grid-template-columns: 1fr;
          }

          .brandqr__hero {
            padding: 30px 20px 30px;
          }

          .brandqr__heroTitle {
            font-size: 42px;
          }

          .brandqr__heroDescription {
            font-size: 15px;
          }

          .brandqr__card,
          .brandqr__tableCard {
            padding: 22px;
            border-radius: 20px;
          }
        }

      `}</style>
    </>
  );
}