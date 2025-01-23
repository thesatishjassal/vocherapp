"use client";
import RackTable from "../components/RackTable";

const AddNewRacks = () => {
  return (
    <>
      {" "}
      <div className="mini_banner warehouserack">
        <div className="content_box">
          <div>
            {" "}
            <h2 className="title">Racks</h2>
            <p className="description">Add/Edit Your Racks</p>
          </div>
        </div>
      </div>
      <RackTable />
    </>
  );
};

export default AddNewRacks;
