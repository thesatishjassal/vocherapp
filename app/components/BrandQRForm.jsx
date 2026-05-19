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


    </>
  );
}