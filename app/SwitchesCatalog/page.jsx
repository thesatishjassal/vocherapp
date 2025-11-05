"use client";

import React from "react";

const data = [{
  "Id" : 13,
  "Name" : "Wipro NW Price list_July",
  "Category" : "Switches",
  "Brand" : "Wipro",
  "DownloadFile" : "https://drive.google.com/file/d/1VnPgZIT40tjTFibt4FwksIQiltAzebXT/view?usp=sharing"
},
{
  "Id" : 14,
  "Name" : "OSUM CONVENTIONAL NEW",
  "Category" : "Switches",
  "Brand" : "OSUM",
  "DownloadFile" : "https://drive.google.com/file/d/1X-RWtQSpgN1W53neqPB53dSG-vwKA8M3/view?usp=sharing"
},
{
  "Id" : 15,
  "Name" : "OSUM Brochure 2025 NEW",
  "Category" : "Switches",
  "Brand" : "OSUM",
  "DownloadFile" : "https://drive.google.com/file/d/1OWuoFxT4Od5PKxZxQd7gamRucBd79HiN/view?usp=sharing"
},
{
  "Id" : 16,
  "Name" : "celestia switches brochure final 2024",
  "Category" : "Switches",
  "Brand" : "celestia",
  "DownloadFile" : "https://drive.google.com/file/d/1DoWxjIEiDqMfopqWjHddHT0CKTTy9vLJ/view?usp=sharing"
},
{
  "Id" : 17,
  "Name" : "celestia pricelist final",
  "Category" : "Switches",
  "Brand" : "celestia",
  "DownloadFile" : "https://drive.google.com/file/d/1bK2Pu-DLDaG0kEqyKzU6VGb9l_al_Cbd/view?usp=sharing"
}];

export default function FancyLightsCatalog() {
  return (
    <div className="p-2 md:p-4">
      <h4 className="text-left mb-3 text-base md:text-lg font-semibold">
        Fancy Lights Catalogue Download
      </h4>

      <div className="overflow-x-auto card">
        <table className="tm_round_border table align-items-center justify-content-center w-full border-collapse">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="p-2 text-left">SR NO</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Brand</th>
              <th className="p-2 text-center">Download</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={index}
                className="border-t text-sm hover:bg-gray-50 transition-colors"
              >
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{item.Name}</td>
                <td className="p-2">{item.Category}</td>
                <td className="p-2">{item.Brand}</td>
                <td className="p-2 text-center">
                  <a
                    href={item["DownloadFile"]}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={true}
                    className="bg-blue-600 text-xs md:text-sm px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
