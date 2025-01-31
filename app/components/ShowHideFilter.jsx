import React, { useState } from "react";

const ShowHideFilter = ({ columns, onChange }) => {
  const [selectedColumns, setSelectedColumns] = useState(columns);

  const handleCheckboxChange = (columnName) => {
    const updatedColumns = {
      ...selectedColumns,
      [columnName]: !selectedColumns[columnName],
    };
    setSelectedColumns(updatedColumns);
    onChange(updatedColumns);
  };

  return (
    <div>
      <div className="checkbox-list showHideFilterModal">
        {Object.keys(columns).map((column) => (
          <div key={column}>
            <input
              type="checkbox"
              checked={selectedColumns[column]}
              onChange={() => handleCheckboxChange(column)}
            />
            <label>{column}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShowHideFilter;
