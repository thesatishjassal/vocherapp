import React, { useState } from "react";
import Select from "react-select";

const FindProduct = ({ showModal, setShowModal, handleProductSelect , productList }) => {
  console.log(productList)
  const [selectedCode, setSelectedCode] = useState(null);
  const [selectedName, setSelectedName] = useState(null);

  const handleClose = () => {
    setShowModal(false); // Close modal when clicking close button
  };

  const items = [
    { code: "P001", name: "ORIENT 1200MM AEROQUIET FAN CHECKED FINISH", unit: "pcs", rackCode: "A1" },
    { code: "P002", name: "ORIENT 1200MM AEROQUIET FAN ROASTED COFFE", unit: "pcs", rackCode: "A2" },
    { code: "P003", name: "ORIENT 200MM 3-1DE VENTILATION FAN GREY-3110810417110", unit: "box", rackCode: "A3" },
    { code: "P004", name: "ORIENT 450MM TORNADO WALL", unit: "pcs", rackCode: "A4" },
    { code: "P005", name: "ORIENT AEON BLDC MGM GREY 1200MM", unit: "pcs", rackCode: "A5" },
    { code: "P006", name: "ORIENT AEROLITE BROWN 1200MM", unit: "pcs", rackCode: "A6" },
    { code: "P007", name: "ORIENT AEROQUIET FAN 48 1200MM", unit: "pcs", rackCode: "A7" },
    { code: "P008", name: "ORIENT AEROSENSE ASHWOOD BLDC FAN 1200MM", unit: "pcs", rackCode: "A8" },
    { code: "P009", name: "ORIENT AEROSENSE BROWN FAN 1200MM", unit: "pcs", rackCode: "A9" },
    { code: "P010", name: "ORIENT AEROSENSE DNGLD GOLD 1200MM", unit: "box", rackCode: "A10" },
    { code: "P011", name: "ORIENT AEROSENSE WHITE FAN 1200MM", unit: "pcs", rackCode: "A11" },
    { code: "P012", name: "PHILIPS GRANDEUR 3HEAD PENDANT 58072", unit: "pcs", rackCode: "A12" },
    { code: "P013", name: "PHILIPS HAMRAA WALL LAMP NICKEL 1*60W 230V", unit: "box", rackCode: "A13" },
    { code: "P014", name: "PHILIPS HEDGE PEDESTAL RUST 1X60W 230V", unit: "pcs", rackCode: "A14" },
    { code: "P015", name: "PHILIPS HUE 10W E-27 LAMP", unit: "pcs", rackCode: "A15" },
    { code: "P016", name: "PHILIPS HUE BRIDGE", unit: "pcs", rackCode: "A16" },
    { code: "P017", name: "PHILIPS HUE COL LIGHTSTRIP PLUS INDIA BASE 2 MTR", unit: "box", rackCode: "A17" },
    { code: "P018", name: "PHILIPS HUE COL LIGHTSTRIP PLUS INDIA EXT 1 MTR", unit: "pcs", rackCode: "A18" },
    { code: "P019", name: "PHILIPS HUE DIM SWITCH", unit: "pcs", rackCode: "A19" },
    { code: "P020", name: "PHILIPS HUE DLWA GARNEA 150MM DOWNLIGHTS 51108", unit: "box", rackCode: "A20" },
    { code: "P021", name: "PHILIPS HUE E-27 FIXTURE", unit: "pcs", rackCode: "A21" },
  ];

  const productCodeOptions = items.map((product) => ({
    label: `${product.code} `,
    value: product.code,
  }));

  const productNameOptions = items.map((product) => ({
    label: `${product.name}`,
    value: product.name,
  }));

  const handleCodeChange = (selectedOption) => {
    if (selectedOption) {
      const selectedProduct = items.find((item) => item.code === selectedOption.value);
      setSelectedCode(selectedOption);
      setSelectedName({
        label: `${selectedProduct.name} (${selectedProduct.unit}, Rack: ${selectedProduct.rackCode})`,
        value: selectedProduct.name,
      });
      handleProductSelect({
        type: "code",
        value: selectedOption.value,
        name: selectedProduct.name,
        unit: selectedProduct.unit,
        rackCode: selectedProduct.rackCode,
      });
    } else {
      setSelectedCode(null);
      setSelectedName(null);
    }
  };

  const handleNameChange = (selectedOption) => {
    if (selectedOption) {
      const selectedProduct = items.find((item) => item.name === selectedOption.value);
      setSelectedName(selectedOption);
      setSelectedCode({
        label: `${selectedProduct.code} (${selectedProduct.unit}, Rack: ${selectedProduct.rackCode})`,
        value: selectedProduct.code,
      });
      handleProductSelect({
        value: selectedProduct.code,
        name: selectedProduct.name,
        unit: selectedProduct.unit,
        rackCode: selectedProduct.rackCode,
      });
    } else {
      setSelectedName(null);
      setSelectedCode(null);
    }
  };

  return (
    <div
      className={`modal fade show ${showModal ? "show" : ""}`}
      id="staticBackdrop"
      tabIndex="-1"
      aria-labelledby="staticBackdropLabel"
      aria-hidden="true"
      style={{
        display: showModal ? "block" : "none",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="modal-dialog modal-dialog-centered addwarehouseform">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="staticBackdropLabel">
              Find Product
            </h1>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={handleClose}
            ></button>
          </div>
          <div className="modal-body py-3">
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <div style={{ flex: 1 }}>
                <label htmlFor="itemCode" style={{ display: "block", marginBottom: "5px" }}>
                  Item Code
                </label>
                <Select
                  options={productCodeOptions}
                  value={selectedCode}
                  onChange={handleCodeChange}
                  placeholder="Select Item Code"
                  isClearable
                  id="itemCode"
                />
              </div>
              <div style={{ flex: 2 }}>
                <label htmlFor="itemName" style={{ display: "block", marginBottom: "5px" }}>
                  Item Name
                </label>
                <Select
                  options={productNameOptions}
                  value={selectedName}
                  onChange={handleNameChange}
                  placeholder="Select Item Name"
                  isClearable
                  id="itemName"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindProduct;
