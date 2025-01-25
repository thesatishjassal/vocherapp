import React from "react";
import Select from "react-select";

const FindProduct = ({ showModal, setShowModal, handleProductSelect }) => {
  const handleClose = () => {
    setShowModal(false); // Close modal when clicking close button
  };

  // Define the product list inside the component
  const items = [
    "ORIENT 1200MM AEROQUIET FAN CHECKED FINISH",
    "ORIENT 1200MM AEROQUIET FAN ROASTED COFFE",
    "ORIENT 200MM 3-1DE VENTILATION FAN GREY-3110810417110",
    "ORIENT 450MM TORNADO WALL",
    "ORIENT AEON BLDC MGM GREY 1200MM",
    "ORIENT AEROLITE BROWN 1200MM",
    "ORIENT AEROQUIET FAN 48 1200MM",
    "ORIENT AEROSENSE ASHWOOD BLDC FAN 1200MM",
    "ORIENT AEROSENSE BROWN FAN 1200MM",
    "ORIENT AEROSENSE DNGLD GOLD 1200MM",
    "ORIENT AEROSENSE WHITE FAN 1200MM",
    "PHILIPS GRANDEUR 3HEAD PENDANT 58072",
    "PHILIPS HAMRAA WALL LAMP NICKEL 1*60W 230V",
    "PHILIPS HEDGE PEDESTAL RUST 1X60W 230V",
    "PHILIPS HUE 10W E-27 LAMP",
    "PHILIPS HUE BRIDGE",
    "PHILIPS HUE COL LIGHTSTRIP PLUS INDIA BASE 2 MTR",
    "PHILIPS HUE COL LIGHTSTRIP PLUS INDIA EXT 1 MTR",
    "PHILIPS HUE DIM SWITCH",
    "PHILIPS HUE DLWA GARNEA 150MM DOWNLIGHTS 51108",
    "PHILIPS HUE E-27 FIXTURE",
  ];

  // Convert product list to the format required by react-select
  const productOptions = items.map((product) => ({
    label: product,
    value: product,
  }));

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
      <div className="modal-dialog addwarehouseform">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="staticBackdropLabel">
              Find Product By Name
            </h1>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={handleClose}
            ></button>
          </div>
          <div className="modal-body py-3">
            <Select
              options={productOptions}
              onChange={(selectedOption) => handleProductSelect(selectedOption.value)}
              placeholder="Select a Product"
              isClearable
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindProduct;
