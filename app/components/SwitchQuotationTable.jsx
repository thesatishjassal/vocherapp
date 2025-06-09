"use client";
import React, { useState, useEffect } from "react";

const SwitchQuotatTable = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedCategories, setSelectedCategories] = useState({
    Switches: false,
    Sockets: false,
    "Safety Devices": false,
    Plates: false,
  });

  const plateSubcategories = ["Blank Plate", "Blanking Plates", "Cover Plates", "Frame Plate"];
  const [selectedPlateSubcategory, setSelectedPlateSubcategory] = useState("Blank Plate");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const colorPriceMap =  [
    {
      "item_code": "R0110",
      "White_mrp": 200,
      "silver_grey_mrp": 250,
      "galaxy_black_mrp": 250
    },
    {
      "item_code": "R011",
      "White_mrp": 310,
      "silver_grey_mrp": 370,
      "galaxy_black_mrp": 370
    },
    {
      "item_code": "R0210",
      "White_mrp": 285,
      "silver_grey_mrp": 355,
      "galaxy_black_mrp": 355
    },
    {
      "item_code": "R0130",
      "White_mrp": 335,
      "silver_grey_mrp": 410,
      "galaxy_black_mrp": 410
    },
    {
      "item_code": "R0131",
      "White_mrp": 410,
      "silver_grey_mrp": 460,
      "galaxy_black_mrp": 460
    },
    {
      "item_code": "R0230",
      "White_mrp": 415,
      "silver_grey_mrp": 490,
      "galaxy_black_mrp": 490
    },
    {
      "item_code": "R0132",
      "White_mrp": 425,
      "silver_grey_mrp": 505,
      "galaxy_black_mrp": 505
    },
    {
      "item_code": "R0133",
      "White_mrp": 490,
      "silver_grey_mrp": 595,
      "galaxy_black_mrp": 595
    },
    {
      "item_code": "R0233",
      "White_mrp": 565,
      "silver_grey_mrp": 680,
      "galaxy_black_mrp": 680
    },
    {
      "item_code": "R0150",
      "White_mrp": 450,
      "silver_grey_mrp": 550,
      "galaxy_black_mrp": 550
    },
    {
      "item_code": "R0151",
      "White_mrp": 525,
      "silver_grey_mrp": 620,
      "galaxy_black_mrp": 620
    },
    {
      "item_code": "R0171",
      "White_mrp": 1205,
      "silver_grey_mrp": 1305,
      "galaxy_black_mrp": 1305
    },
    {
      "item_code": "R0310",
      "White_mrp": 305,
      "silver_grey_mrp": 370,
      "galaxy_black_mrp": 370
    },
    {
      "item_code": "R0311",
      "White_mrp": 390,
      "silver_grey_mrp": 490,
      "galaxy_black_mrp": 490
    },
    {
      "item_code": "R0341",
      "White_mrp": 470,
      "silver_grey_mrp": 580,
      "galaxy_black_mrp": 580
    },
    {
      "item_code": "RF110",
      "White_mrp": 290,
      "silver_grey_mrp": 360,
      "galaxy_black_mrp": 360
    },
    {
      "item_code": "RF111",
      "White_mrp": 445,
      "silver_grey_mrp": 515,
      "galaxy_black_mrp": 515
    },
    {
      "item_code": "RF210",
      "White_mrp": 395,
      "silver_grey_mrp": 500,
      "galaxy_black_mrp": 500
    },
    {
      "item_code": "RF211",
      "White_mrp": 495,
      "silver_grey_mrp": 595,
      "galaxy_black_mrp": 595
    },
    {
      "item_code": "RF130",
      "White_mrp": 455,
      "silver_grey_mrp": 515,
      "galaxy_black_mrp": 515
    },
    {
      "item_code": "RF131",
      "White_mrp": 600,
      "silver_grey_mrp": 680,
      "galaxy_black_mrp": 680
    },
    {
      "item_code": "RF230",
      "White_mrp": 625,
      "silver_grey_mrp": 685,
      "galaxy_black_mrp": 685
    },
    {
      "item_code": "RF231",
      "White_mrp": 755,
      "silver_grey_mrp": 790,
      "galaxy_black_mrp": 790
    },
    {
      "item_code": "RF161",
      "White_mrp": 625,
      "silver_grey_mrp": 680,
      "galaxy_black_mrp": 680
    },
    {
      "item_code": "RF310",
      "White_mrp": 535,
      "silver_grey_mrp": 560,
      "galaxy_black_mrp": 560
    },
    {
      "item_code": "RF311",
      "White_mrp": 645,
      "silver_grey_mrp": 675,
      "galaxy_black_mrp": 675
    },
    {
      "item_code": "R1212",
      "White_mrp": 370,
      "silver_grey_mrp": 435,
      "galaxy_black_mrp": 435
    },
    {
      "item_code": "R1332",
      "White_mrp": 500,
      "silver_grey_mrp": 625,
      "galaxy_black_mrp": 625
    },
    {
      "item_code": "R1352",
      "White_mrp": 585,
      "silver_grey_mrp": 715,
      "galaxy_black_mrp": 715
    },
    {
      "item_code": "R1700",
      "White_mrp": 855,
      "silver_grey_mrp": 1025,
      "galaxy_black_mrp": 1025
    },
    {
      "item_code": "R1920",
      "White_mrp": 1300,
      "silver_grey_mrp": 1540,
      "galaxy_black_mrp": 1540
    },
    {
      "item_code": "R1500",
      "White_mrp": 1155,
      "silver_grey_mrp": 1385,
      "galaxy_black_mrp": 1385
    },
    {
      "item_code": "R2700",
      "White_mrp": 1500,
      "silver_grey_mrp": 1865,
      "galaxy_black_mrp": 1865
    },
    {
      "item_code": "R4300",
      "White_mrp": 1365,
      "silver_grey_mrp": 1420,
      "galaxy_black_mrp": 1420
    },
    {
      "item_code": "R4401",
      "White_mrp": 1195,
      "silver_grey_mrp": 1430,
      "galaxy_black_mrp": 1430
    },
    {
      "item_code": "R4797",
      "White_mrp": 295,
      "silver_grey_mrp": 345,
      "galaxy_black_mrp": 345
    },
    {
      "item_code": "R4900",
      "White_mrp": 285,
      "silver_grey_mrp": 335,
      "galaxy_black_mrp": 335
    },
    {
      "item_code": "R5200",
      "White_mrp": 870,
      "silver_grey_mrp": 960,
      "galaxy_black_mrp": 960
    },
    {
      "item_code": "R5300",
      "White_mrp": "on_request",
      "silver_grey_mrp": "on_request",
      "galaxy_black_mrp": "on_request"
    },
    {
      "item_code": "R5310",
      "White_mrp": 935,
      "silver_grey_mrp": 1025,
      "galaxy_black_mrp": 1025
    },
    {
      "item_code": "R4921",
      "White_mrp": 2325,
      "silver_grey_mrp": 2545,
      "galaxy_black_mrp": 2545
    },
    {
      "item_code": "R4600",
      "White_mrp": 365,
      "silver_grey_mrp": 365,
      "galaxy_black_mrp": 365
    },
    {
      "item_code": "RFL922",
      "White_mrp": 890,
      "silver_grey_mrp": 1010,
      "galaxy_black_mrp": 1010
    },
    {
      "item_code": "R4604",
      "White_mrp": 680,
      "silver_grey_mrp": 710,
      "galaxy_black_mrp": 710
    },
    {
      "item_code": "R4605",
      "White_mrp": 370,
      "silver_grey_mrp": 380,
      "galaxy_black_mrp": 380
    },
    {
      "item_code": "R5500",
      "White_mrp": 4685,
      "silver_grey_mrp": 4820,
      "galaxy_black_mrp": 4820
    },
    {
      "item_code": "R1542",
      "White_mrp": 5370,
      "silver_grey_mrp": 5415,
      "galaxy_black_mrp": 5415
    },
    {
      "item_code": "R3900",
      "White_mrp": 70,
      "silver_grey_mrp": 95,
      "galaxy_black_mrp": 95
    },
    {
      "item_code": "R4931",
      "White_mrp": 3060,
      "silver_grey_mrp": 3605,
      "galaxy_black_mrp": 3605
    },
    {
      "item_code": "R4932",
      "White_mrp": 4435,
      "silver_grey_mrp": 5225,
      "galaxy_black_mrp": 5225
    },
    {
      "item_code": "R4912",
      "White_mrp": 1440,
      "silver_grey_mrp": 1875,
      "galaxy_black_mrp": 1875
    },
    {
      "item_code": "6A",
      "White_mrp": 550,
      "silver_grey_mrp": 550,
      "galaxy_black_mrp": 670
    },
    {
      "item_code": "6A",
      "White_mrp": 1200,
      "silver_grey_mrp": 1200,
      "galaxy_black_mrp": 1450
    },
    {
      "item_code": "RP911",
      "White_mrp": 235,
      "silver_grey_mrp": 235,
      "galaxy_black_mrp": 385
    },
    {
      "item_code": "RP922",
      "White_mrp": 255,
      "silver_grey_mrp": 255,
      "galaxy_black_mrp": 415
    },
    {
      "item_code": "RP933",
      "White_mrp": 290,
      "silver_grey_mrp": 290,
      "galaxy_black_mrp": 465
    },
    {
      "item_code": "RP944",
      "White_mrp": 305,
      "silver_grey_mrp": 305,
      "galaxy_black_mrp": 505
    },
    {
      "item_code": "RP966",
      "White_mrp": 615,
      "silver_grey_mrp": 615,
      "galaxy_black_mrp": 1050
    },
    {
      "item_code": "RP968H",
      "White_mrp": 665,
      "silver_grey_mrp": 665,
      "galaxy_black_mrp": 1150
    },
    {
      "item_code": "RP968",
      "White_mrp": 790,
      "silver_grey_mrp": 790,
      "galaxy_black_mrp": 1315
    },
    {
      "item_code": "RP9712S",
      "White_mrp": 955,
      "silver_grey_mrp": 955,
      "galaxy_black_mrp": 1590
    },
    {
      "item_code": "RP9716S",
      "White_mrp": 1020,
      "silver_grey_mrp": 1020,
      "galaxy_black_mrp": 1725
    },
    {
      "item_code": "RP9718S",
      "White_mrp": 1105,
      "silver_grey_mrp": 1105,
      "galaxy_black_mrp": 1850
    },
    {
      "item_code": "RB911BACKF",
      "White_mrp": "no_colors",
      "silver_grey_mrp": "no_colors",
      "galaxy_black_mrp": "no_colors"
    },
    {
      "item_code": "RB9122BACKF",
      "White_mrp": "no_colors",
      "silver_grey_mrp": "no_colors",
      "galaxy_black_mrp": "no_colors"
    },
    {
      "item_code": "RB933BACKF",
      "White_mrp": "no_colors",
      "silver_grey_mrp": "no_colors",
      "galaxy_black_mrp": "no_colors"
    },
    {
      "item_code": "RB944BACKF",
      "White_mrp": "no_colors",
      "silver_grey_mrp": "no_colors",
      "galaxy_black_mrp": "no_colors"
    },
    {
      "item_code": "RB956BACKF",
      "White_mrp": "no_colors",
      "silver_grey_mrp": "no_colors",
      "galaxy_black_mrp": "no_colors"
    },
    {
      "item_code": "RB966BACKF",
      "White_mrp": "no_colors",
      "silver_grey_mrp": "no_colors",
      "galaxy_black_mrp": "no_colors"
    },
    {
      "item_code": "RB968BACKF",
      "White_mrp": "no_colors",
      "silver_grey_mrp": "no_colors",
      "galaxy_black_mrp": "no_colors"
    },
    {
      "item_code": "RB968SBACKF",
      "White_mrp": "no_colors",
      "silver_grey_mrp": "no_colors",
      "galaxy_black_mrp": "no_colors"
    },
    {
      "item_code": "RB9712BACKF",
      "White_mrp": "no_colors",
      "silver_grey_mrp": "no_colors",
      "galaxy_black_mrp": "no_colors"
    },
    {
      "item_code": "SR110-PLUS",
      "White_mrp": 155,
      "silver_grey_mrp": 210,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "SR111-PLUS",
      "White_mrp": 230,
      "silver_grey_mrp": 290,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "SR130-PLUS",
      "White_mrp": 265,
      "silver_grey_mrp": 325,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "SR131-PLUS",
      "White_mrp": 315,
      "silver_grey_mrp": 400,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "SR3033",
      "White_mrp": 915,
      "silver_grey_mrp": 1135,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "5R210-PLUS",
      "White_mrp": 220,
      "silver_grey_mrp": 275,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "SR211-PLUS",
      "White_mrp": 300,
      "silver_grey_mrp": 375,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "5R230-PLUS",
      "White_mrp": 320,
      "silver_grey_mrp": 405,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "SR310-PLUS",
      "White_mrp": 240,
      "silver_grey_mrp": 305,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "SR311-PLUS",
      "White_mrp": 280,
      "silver_grey_mrp": 355,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M1212-PLUS",
      "White_mrp": 280,
      "silver_grey_mrp": 355,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M1332-PLUS",
      "White_mrp": 410,
      "silver_grey_mrp": 505,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M1352-PLUS",
      "White_mrp": 495,
      "silver_grey_mrp": 630,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M3012-PLUS",
      "White_mrp": 495,
      "silver_grey_mrp": 620,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M1700-PLUS",
      "White_mrp": 710,
      "silver_grey_mrp": 1015,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M1900-PLUS",
      "White_mrp": 965,
      "silver_grey_mrp": 1195,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "Ml B00-PLUS",
      "White_mrp": 870,
      "silver_grey_mrp": 1080,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M1500-PLUS",
      "White_mrp": 690,
      "silver_grey_mrp": 870,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M2700-PLUS",
      "White_mrp": 1200,
      "silver_grey_mrp": 1500,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M4797-PLUS",
      "White_mrp": 215,
      "silver_grey_mrp": 265,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M49005-PLUS",
      "White_mrp": 215,
      "silver_grey_mrp": 265,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M5200-PLUS",
      "White_mrp": 715,
      "silver_grey_mrp": 900,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M5300-PLUS",
      "White_mrp": 1500,
      "silver_grey_mrp": 1725,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "SP4500-PLUS",
      "White_mrp": 225,
      "silver_grey_mrp": 285,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M4921-PLUS",
      "White_mrp": 1905,
      "silver_grey_mrp": 2035,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M4401 PLUS",
      "White_mrp": 580,
      "silver_grey_mrp": 715,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M4601-PLUS",
      "White_mrp": 335,
      "silver_grey_mrp": 420,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M4602-PLUS",
      "White_mrp": 335,
      "silver_grey_mrp": 420,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M1542 PLUS",
      "White_mrp": 930,
      "silver_grey_mrp": 1170,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M4300",
      "White_mrp": 780,
      "silver_grey_mrp": 975,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "SR5500",
      "White_mrp": 2510,
      "silver_grey_mrp": 3140,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "FL921",
      "White_mrp": 835,
      "silver_grey_mrp": 1045,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M3900-PLUS",
      "White_mrp": 60,
      "silver_grey_mrp": 100,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M4500-PLUS",
      "White_mrp": 135,
      "silver_grey_mrp": 195,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M4600-PLUS",
      "White_mrp": 140,
      "silver_grey_mrp": 210,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "MP711MSBOO",
      "White_mrp": 555,
      "silver_grey_mrp": "N/a",
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "MP722MSBOO",
      "White_mrp": 555,
      "silver_grey_mrp": "N/a",
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "MP733M5B00",
      "White_mrp": 660,
      "silver_grey_mrp": "N/a",
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "MP744MSBOO",
      "White_mrp": 880,
      "silver_grey_mrp": "N/a",
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "MP756MSBSO",
      "White_mrp": 1285,
      "silver_grey_mrp": "N/a",
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "MP768MHSBO",
      "White_mrp": 1500,
      "silver_grey_mrp": "N/a",
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "MP768MSSBO",
      "White_mrp": 1360,
      "silver_grey_mrp": "N/a",
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "MP5712MSSB",
      "White_mrp": 2195,
      "silver_grey_mrp": "N/a",
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "CS911M-PLUS",
      "White_mrp": 165,
      "silver_grey_mrp": 270,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "CS922M-PLUS",
      "White_mrp": 165,
      "silver_grey_mrp": 270,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "CS933MS-PLUS",
      "White_mrp": 200,
      "silver_grey_mrp": 310,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "CS944M-PLUS",
      "White_mrp": 215,
      "silver_grey_mrp": 345,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "C5956M5-PLUS",
      "White_mrp": 350,
      "silver_grey_mrp": 545,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "CS968MH-PLUS",
      "White_mrp": 420,
      "silver_grey_mrp": 655,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "CS968MS-PLUS",
      "White_mrp": 470,
      "silver_grey_mrp": 730,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "C59712M5-PLUS",
      "White_mrp": 565,
      "silver_grey_mrp": 875,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "C59718MS-PLUS",
      "White_mrp": 780,
      "silver_grey_mrp": 1215,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M0110",
      "White_mrp": 150,
      "silver_grey_mrp": 205,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M0111",
      "White_mrp": 225,
      "silver_grey_mrp": 275,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M0210",
      "White_mrp": 210,
      "silver_grey_mrp": 265,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M0310",
      "White_mrp": 215,
      "silver_grey_mrp": 270,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M0311",
      "White_mrp": 275,
      "silver_grey_mrp": 350,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M0340",
      "White_mrp": 270,
      "silver_grey_mrp": 340,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M0341",
      "White_mrp": 375,
      "silver_grey_mrp": 470,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M0130",
      "White_mrp": 255,
      "silver_grey_mrp": 320,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M0131",
      "White_mrp": 295,
      "silver_grey_mrp": 370,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M0230",
      "White_mrp": 295,
      "silver_grey_mrp": 370,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M0431",
      "White_mrp": 355,
      "silver_grey_mrp": 450,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M0451",
      "White_mrp": 440,
      "silver_grey_mrp": 560,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M0440",
      "White_mrp": 335,
      "silver_grey_mrp": 430,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M0551",
      "White_mrp": 490,
      "silver_grey_mrp": 615,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "MP711MSBO0",
      "White_mrp": 555,
      "silver_grey_mrp": "N/a",
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "MP722MSBOO",
      "White_mrp": 555,
      "silver_grey_mrp": "N/a",
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "MP733M5B00",
      "White_mrp": 660,
      "silver_grey_mrp": "N/a",
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "MP744MSBOO",
      "White_mrp": 880,
      "silver_grey_mrp": "N/a",
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "MP756MSBSO",
      "White_mrp": 1285,
      "silver_grey_mrp": "N/a",
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "MP768MHSBO",
      "White_mrp": 1500,
      "silver_grey_mrp": "N/a",
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "MP768M5SBO",
      "White_mrp": 1360,
      "silver_grey_mrp": "N/a",
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "MP5712M5S8",
      "White_mrp": 2195,
      "silver_grey_mrp": "N/a",
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "CS911M-PLUS",
      "White_mrp": 165,
      "silver_grey_mrp": 270,
      "galaxy_black_mrp": 270
    },
    {
      "item_code": "CS922M-PLUS",
      "White_mrp": 165,
      "silver_grey_mrp": 270,
      "galaxy_black_mrp": 270
    },
    {
      "item_code": "C5933MS-PLUS",
      "White_mrp": 200,
      "silver_grey_mrp": 310,
      "galaxy_black_mrp": 310
    },
    {
      "item_code": "C5944M-PLUS",
      "White_mrp": 215,
      "silver_grey_mrp": 345,
      "galaxy_black_mrp": 345
    },
    {
      "item_code": "C5956MS-PLUS",
      "White_mrp": 350,
      "silver_grey_mrp": 545,
      "galaxy_black_mrp": 545
    },
    {
      "item_code": "C5968MH-PLUS",
      "White_mrp": 420,
      "silver_grey_mrp": 655,
      "galaxy_black_mrp": 655
    },
    {
      "item_code": "CS968M5-PLUS",
      "White_mrp": 470,
      "silver_grey_mrp": 730,
      "galaxy_black_mrp": 730
    },
    {
      "item_code": "CS9712MS-PLUS",
      "White_mrp": 565,
      "silver_grey_mrp": 875,
      "galaxy_black_mrp": 875
    },
    {
      "item_code": "CS9718MS-PLUS",
      "White_mrp": 780,
      "silver_grey_mrp": 1215,
      "galaxy_black_mrp": 1215
    },
    {
      "item_code": "M1700-PLUS",
      "White_mrp": 710,
      "silver_grey_mrp": 1015,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M1900-PLUS",
      "White_mrp": 965,
      "silver_grey_mrp": 1195,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M1800-PLUS",
      "White_mrp": 870,
      "silver_grey_mrp": 1080,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M1500-PLUS",
      "White_mrp": 690,
      "silver_grey_mrp": 870,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M2700-PLUS",
      "White_mrp": 1200,
      "silver_grey_mrp": 1500,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M47970-PLUS",
      "White_mrp": 215,
      "silver_grey_mrp": 265,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M4900S-PLUS",
      "White_mrp": 215,
      "silver_grey_mrp": 265,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M52000-PLUS",
      "White_mrp": 715,
      "silver_grey_mrp": 900,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M5300-PLUS",
      "White_mrp": 1500,
      "silver_grey_mrp": 1725,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "51'4500-P1_1..1S",
      "White_mrp": 225,
      "silver_grey_mrp": 285,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M49210-PLUS",
      "White_mrp": 1905,
      "silver_grey_mrp": 1935,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M4401-PLUS",
      "White_mrp": 580,
      "silver_grey_mrp": 715,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M4601-PLUS",
      "White_mrp": 335,
      "silver_grey_mrp": 420,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M4602-PLUS",
      "White_mrp": 335,
      "silver_grey_mrp": 420,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M1542-PLUS",
      "White_mrp": 930,
      "silver_grey_mrp": 1170,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M4300",
      "White_mrp": 780,
      "silver_grey_mrp": 975,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "5R5500",
      "White_mrp": 2510,
      "silver_grey_mrp": 3140,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "FL921",
      "White_mrp": 835,
      "silver_grey_mrp": 1045,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M3900-PLUS",
      "White_mrp": 60,
      "silver_grey_mrp": 100,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M4500-PLUS",
      "White_mrp": 135,
      "silver_grey_mrp": 195,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M4600-PLUS",
      "White_mrp": 140,
      "silver_grey_mrp": 210,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "AS110",
      "White_mrp": 145,
      "silver_grey_mrp": 200,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "AS111",
      "White_mrp": 245,
      "silver_grey_mrp": 310,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "AS210",
      "White_mrp": 230,
      "silver_grey_mrp": 290,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "AS120",
      "White_mrp": 165,
      "silver_grey_mrp": 235,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "AS121",
      "White_mrp": 260,
      "silver_grey_mrp": 365,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "AS130",
      "White_mrp": 250,
      "silver_grey_mrp": 315,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "AS131",
      "White_mrp": 310,
      "silver_grey_mrp": 405,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "AS230",
      "White_mrp": 330,
      "silver_grey_mrp": 405,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "AS160",
      "White_mrp": 260,
      "silver_grey_mrp": 355,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "AS161",
      "White_mrp": 335,
      "silver_grey_mrp": 455,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "AS150",
      "White_mrp": 385,
      "silver_grey_mrp": 515,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "AS151",
      "White_mrp": 490,
      "silver_grey_mrp": 660,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "AS310",
      "White_mrp": 240,
      "silver_grey_mrp": 300,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "AS311",
      "White_mrp": 390,
      "silver_grey_mrp": 515,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "AS110CMR",
      "White_mrp": 165,
      "silver_grey_mrp": 225,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "AS210DND",
      "White_mrp": 250,
      "silver_grey_mrp": 310,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "A0551",
      "White_mrp": 720,
      "silver_grey_mrp": 915,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "A0341",
      "White_mrp": 435,
      "silver_grey_mrp": 585,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "A1212",
      "White_mrp": 265,
      "silver_grey_mrp": 355,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "A1332",
      "White_mrp": 430,
      "silver_grey_mrp": 550,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "A1352",
      "White_mrp": 485,
      "silver_grey_mrp": 600,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "AP911",
      "White_mrp": 155,
      "silver_grey_mrp": 275,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "AP922",
      "White_mrp": 155,
      "silver_grey_mrp": 275,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "AP933",
      "White_mrp": 205,
      "silver_grey_mrp": 350,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "AP933M",
      "White_mrp": 205,
      "silver_grey_mrp": 350,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "AP944",
      "White_mrp": 235,
      "silver_grey_mrp": 380,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "AP956",
      "White_mrp": 295,
      "silver_grey_mrp": 475,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "AP968H",
      "White_mrp": 370,
      "silver_grey_mrp": 595,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "AP9685",
      "White_mrp": 380,
      "silver_grey_mrp": 620,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "AP979",
      "White_mrp": 485,
      "silver_grey_mrp": 735,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "AP97125",
      "White_mrp": 530,
      "silver_grey_mrp": 840,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "AP9716S",
      "White_mrp": 710,
      "silver_grey_mrp": 1115,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "AP97185",
      "White_mrp": 800,
      "silver_grey_mrp": 1245,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "Al 700",
      "White_mrp": 700,
      "silver_grey_mrp": 885,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "Al 900",
      "White_mrp": 925,
      "silver_grey_mrp": 1185,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "A1500",
      "White_mrp": 855,
      "silver_grey_mrp": 1090,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "A2700",
      "White_mrp": 1270,
      "silver_grey_mrp": 1655,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "A4900",
      "White_mrp": 215,
      "silver_grey_mrp": 300,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "A5200",
      "White_mrp": 760,
      "silver_grey_mrp": 850,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "A5300",
      "White_mrp": "on_request",
      "silver_grey_mrp": "on_request",
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "A5310",
      "White_mrp": 890,
      "silver_grey_mrp": 980,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "A4797",
      "White_mrp": 225,
      "silver_grey_mrp": 285,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "A4910",
      "White_mrp": 1270,
      "silver_grey_mrp": 1535,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "A4921",
      "White_mrp": 1350,
      "silver_grey_mrp": 1710,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "A4912",
      "White_mrp": 1470,
      "silver_grey_mrp": 1915,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "A4931",
      "White_mrp": 3060,
      "silver_grey_mrp": 3605,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "A4932",
      "White_mrp": 4435,
      "silver_grey_mrp": 5225,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "AFL922",
      "White_mrp": 1025,
      "silver_grey_mrp": 1315,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "A5500",
      "White_mrp": 4225,
      "silver_grey_mrp": 5670,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "A3900",
      "White_mrp": 60,
      "silver_grey_mrp": 105,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M500",
      "White_mrp": 205,
      "silver_grey_mrp": 270,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M600",
      "White_mrp": 265,
      "silver_grey_mrp": 335,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M603",
      "White_mrp": 360,
      "silver_grey_mrp": 440,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M401",
      "White_mrp": 430,
      "silver_grey_mrp": 555,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "M400",
      "White_mrp": 130,
      "silver_grey_mrp": 325,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "6A",
      "White_mrp": 525,
      "silver_grey_mrp": 645,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "6A",
      "White_mrp": 1150,
      "silver_grey_mrp": 1415,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "20A",
      "White_mrp": 1015,
      "silver_grey_mrp": 1185,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "NW-PU3MBTIP66",
      "White_mrp": 4760,
      "silver_grey_mrp": "N/a",
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "B0110",
      "White_mrp": 125,
      "silver_grey_mrp": 150,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "B0120",
      "White_mrp": 125,
      "silver_grey_mrp": 150,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "B0111",
      "White_mrp": 200,
      "silver_grey_mrp": 245,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "B0210",
      "White_mrp": 190,
      "silver_grey_mrp": 235,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "B0220",
      "White_mrp": 195,
      "silver_grey_mrp": 240,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "B0130",
      "White_mrp": 205,
      "silver_grey_mrp": 250,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "B0230",
      "White_mrp": 255,
      "silver_grey_mrp": 305,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "B0131",
      "White_mrp": 260,
      "silver_grey_mrp": 310,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "B0160",
      "White_mrp": 205,
      "silver_grey_mrp": 250,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "B0161",
      "White_mrp": 260,
      "silver_grey_mrp": 310,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "B0150",
      "White_mrp": 240,
      "silver_grey_mrp": 285,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "B0151",
      "White_mrp": 305,
      "silver_grey_mrp": 370,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "B0551",
      "White_mrp": 575,
      "silver_grey_mrp": 690,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "B0310",
      "White_mrp": 195,
      "silver_grey_mrp": 240,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "B0311",
      "White_mrp": 270,
      "silver_grey_mrp": 330,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "B0341",
      "White_mrp": 310,
      "silver_grey_mrp": 375,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "B1212",
      "White_mrp": 215,
      "silver_grey_mrp": 255,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "B1332",
      "White_mrp": 410,
      "silver_grey_mrp": 410,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "B1352",
      "White_mrp": 490,
      "silver_grey_mrp": 490,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "B1700",
      "White_mrp": 600,
      "silver_grey_mrp": 600,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "B1900",
      "White_mrp": 725,
      "silver_grey_mrp": 725,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "B4900",
      "White_mrp": 190,
      "silver_grey_mrp": 235,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "B4797",
      "White_mrp": 195,
      "silver_grey_mrp": 240,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "B5200",
      "White_mrp": 700,
      "silver_grey_mrp": 770,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "B5310",
      "White_mrp": 765,
      "silver_grey_mrp": 865,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "B4600",
      "White_mrp": 195,
      "silver_grey_mrp": 240,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "B4921",
      "White_mrp": 1165,
      "silver_grey_mrp": 1395,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "B4922",
      "White_mrp": 2835,
      "silver_grey_mrp": 3405,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "B4500",
      "White_mrp": 165,
      "silver_grey_mrp": 195,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "B3900",
      "White_mrp": 55,
      "silver_grey_mrp": 65,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "BP911",
      "White_mrp": 130,
      "silver_grey_mrp": 160,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "BP922",
      "White_mrp": 130,
      "silver_grey_mrp": 160,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "BP933",
      "White_mrp": 165,
      "silver_grey_mrp": 195,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "BP944",
      "White_mrp": 205,
      "silver_grey_mrp": 250,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "BP956",
      "White_mrp": 280,
      "silver_grey_mrp": 330,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "BP968H",
      "White_mrp": 320,
      "silver_grey_mrp": 385,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "BP968S",
      "White_mrp": 340,
      "silver_grey_mrp": 410,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "BP979",
      "White_mrp": 385,
      "silver_grey_mrp": 470,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "BP97125",
      "White_mrp": 470,
      "silver_grey_mrp": 565,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "BP9716S",
      "White_mrp": 645,
      "silver_grey_mrp": 780,
      "galaxy_black_mrp": "N/a"
    },
    {
      "item_code": "BP9718S",
      "White_mrp": 705,
      "silver_grey_mrp": 845,
      "galaxy_black_mrp": "N/a"
    }
  ]

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://api.panvic.in/products/");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();

        const productsWithQty = data.map((product) => ({
          ...product,
          qty: product.qty || 1,
        }));

        setProducts(productsWithQty);

        const uniqueBrands = [...new Set(data.map((p) => p.brand).filter(Boolean))].sort();
        setBrands(uniqueBrands);
        setLoading(false);
      } catch (err) {
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!selectedBrand) {
      setModels([]);
      setSelectedModel("");
      return;
    }

    const brandModels = [
      ...new Set(
        products
          .filter((p) => p.brand === selectedBrand && p.model)
          .map((p) => p.model)
      ),
    ].sort();

    setModels(brandModels);
    setSelectedModel("");
  }, [selectedBrand, products]);

  useEffect(() => {
    const filtered = products.filter((product) => {
      const categoryMatch = selectedCategories[product.category];
      const brandMatch = !selectedBrand || product.brand === selectedBrand;
      const modelMatch = !selectedModel || product.model === selectedModel;

      const plateMatch =
        product.category === "Plates"
          ? product.subcategory === selectedPlateSubcategory
          : true;

      return categoryMatch && brandMatch && modelMatch && plateMatch;
    });

    setFilteredProducts(filtered);
  }, [products, selectedBrand, selectedModel, selectedCategories, selectedPlateSubcategory]);

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleQtyChange = (id, newQty) => {
    const updatedProducts = filteredProducts.map((product) =>
      product.id === id ? { ...product, qty: Math.max(1, newQty) } : product
    );
    setFilteredProducts(updatedProducts);
  };

  const getMRP = (itemcode) => {
    const colorEntry = colorPriceMap.find((item) => item.item_code === itemcode);
    if (!colorEntry) return null;
    if (!selectedColor) return null;
    return colorEntry[selectedColor + "_mrp"] || null;
  };

  return (
    <div className="container py-4">
      <div className="mb-3 row align-items-start">
        <div className="col-md-2 mb-2">
          <label className="form-label mb-1">Brand:</label>
          <select
            className="form-select form-select-sm"
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
          >
            <option value="">All Brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>

        <div className="col-md-2 mb-2">
          <label className="form-label mb-1">Model:</label>
          <select
            className="form-select form-select-sm"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={!models.length}
          >
            <option value="">All Models</option>
            {models.map((model) => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>

        <div className="col-md-2 mb-2">
          <label className="form-label mb-1">Color:</label>
          <select
            className="form-select form-select-sm"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
          >
            <option value="">All Colors</option>
            <option value="White">White</option>
            <option value="silver_grey">Silver Grey</option>
            <option value="galaxy_black">Galaxy Black</option>
          </select>
        </div>

        <div className="col-md-6 mb-2">
          <label className="form-label mb-1">Categories:</label>
          <div className="d-flex flex-wrap gap-2">
            {Object.keys(selectedCategories).map((category) => (
              <div className="form-check form-check-inline" key={category}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={selectedCategories[category]}
                  onChange={() => handleCategoryChange(category)}
                  id={`cat-${category}`}
                />
                <label className="form-check-label" htmlFor={`cat-${category}`}>{category}</label>
              </div>
            ))}
          </div>

          {selectedCategories["Plates"] && (
            <div className="mt-2">
              <label className="form-label mb-1">Plates Subcategory:</label>
              <select
                className="form-select form-select-sm"
                value={selectedPlateSubcategory}
                onChange={(e) => setSelectedPlateSubcategory(e.target.value)}
              >
                {plateSubcategories.map((subcat) => (
                  <option key={subcat} value={subcat}>{subcat}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {loading && <div className="alert alert-info">Loading...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive">
        <table className="tm_round_border table align-items-center justify-content-center mb-0">
          <thead className="table-light">
            <tr>
              <th>SR NO</th>
              <th>Item Name</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Category</th>
             <th>{selectedColor ? `${selectedColor} MRP` : "MRP"}</th>
              <th>Qty</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => {
                const qty = product.qty || 1;
                const itemMrp = getMRP(product.itemcode);
                const displayPrice = itemMrp ?? product.price;

                return (
                  <tr key={product.id}>
                    <td>{index + 1}</td>
                    <td>{product.itemname || "Unknown"}</td>
                    <td>{product.brand || "N/A"}</td>
                    <td>{product.model || "N/A"}</td>
                    <td>{product.category || "N/A"}</td>
                    <td>₹{displayPrice?.toFixed(2) || "0.00"}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={qty}
                        onChange={(e) =>
                          handleQtyChange(product.id, parseInt(e.target.value) || 1)
                        }
                        className="form-control form-control-sm text-center"
                        style={{ width: 55 }}
                      />
                    </td>
                    <td>₹{(displayPrice * qty).toFixed(2)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="text-center text-muted py-3">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SwitchQuotatTable;
