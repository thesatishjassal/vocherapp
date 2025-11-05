"use client";

import React from "react";

const data = [
  {
    Id: 2,
    Name: "EGLO INDIA FACTORY MATERIAL",
    Category: "Fancy Lights",
    Brand: "Eglo",
    "Download File":
      "https://drive.google.com/file/d/1DXWWu5AbK-qkHeZziuXCbnm2mWjW3maD/view?usp=sharing",
  },
  {
    Id: 3,
    Name: "EGLO Stars of Light & Interior Lighting",
    Category: "Fancy Lights",
    Brand: "Eglo",
    "Download File":
      "https://drive.google.com/file/d/1Z5_J9bi8k_-VzvmtzpEtxFXWK2M-j0t6/view?usp=sharing",
  },
  {
    Id: 4,
    Name: "EGLO TREND & STYLE & OUTDOOR",
    Category: "Fancy Lights",
    Brand: "Eglo",
    "Download File":
      "https://drive.google.com/file/d/1ju9js7YPVo3fQxDPe18X6VO8oGHH6nIi/view?usp=sharing",
  },
  {
    Id: 5,
    Name: "India catalogue with prices",
    Category: "Fancy Lights",
    Brand: "Eglo",
    "Download File":
      "https://drive.google.com/file/d/1U4_BBvNDje-jxYJ_2A69vkoEEFp2E5v0/view?usp=sharing",
  },
  {
    Id: 6,
    Name: "Floor & Table Lamps",
    Category: "Fancy Lights",
    Brand: "Geo",
    "Download File":
      "https://drive.google.com/file/d/1sNVoV1NbLSUQgLc9RQjoI_ohlUbkUyIG/view?usp=sharing",
  },
  {
    Id: 7,
    Name: "Geo Liting Catalouge",
    Category: "Fancy Lights",
    Brand: "Geo",
    "Download File":
      "https://drive.google.com/file/d/1uHKPvl9Cqz-q3aRsO9OA0CfVNU6n0091/view?usp=sharing",
  },
  {
    Id: 8,
    Name: "GEO4 LIGHTS",
    Category: "Fancy Lights",
    Brand: "Geo",
    "Download File":
      "https://drive.google.com/file/d/1AmCadZ0Xb3I156W4ss3FQIWidsEup4ef/view?usp=sharing",
  },
  {
    Id: 9,
    Name: "Hanging & Chandliers",
    Category: "Fancy Lights",
    Brand: "Geo",
    "Download File":
      "https://drive.google.com/file/d/1F5wYrteCGmk_DZhN5T0SkV25rT6pZGib/view?usp=sharing",
  },
  {
    Id: 10,
    Name: "Hanging & Chandliers-2",
    Category: "Fancy Lights",
    Brand: "Geo",
    "Download File":
      "https://drive.google.com/file/d/1OQC5tGJMZ_6r7Zk-QvD9dTNSm4BxILyL/view?usp=sharing",
  },
  {
    Id: 11,
    Name: "Wall lights 5",
    Category: "Fancy Lights",
    Brand: "Geo",
    "Download File":
      "https://drive.google.com/file/d/1Rid1RtiWsbjqh5-Xog4_ljhx7QOV3nYu/view?usp=sharing",
  },
  {
    Id: 12,
    Name: "JE LISTING",
    Category: "Fancy Lights",
    Brand: "Johnson Emporio",
    "Download File":
      "https://drive.google.com/file/d/18IHWF5JPrsU78RT-fc3b_xh2UEmmOFxV/view?usp=sharing",
  },
];

export default function FancyLightsCatalog() {
  return (
    <div className="p-2 md:p-4">
      <h4 className="text-left mb-3 text-base md:text-lg font-semibold">
        Fancy Lights Catalog Download
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
                    href={item["Download File"]}
                    target="_blank"
                    rel="noopener noreferrer"
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
