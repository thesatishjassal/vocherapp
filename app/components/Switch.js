
  const artisa_swcolors = [
        {
        "item_code": "R0110",
        "silver_grey_mrp": 250,
        "galaxy_black_mrp": 250,
        "brand": "wipro",
        "model": "artisa"
        },
        {
        "item_code": "R011",
        "White_mrp": 310,
        "silver_grey_mrp": 370,
        "galaxy_black_mrp": 370,
        "brand": "wipro",
        "model": "artisa"
        },
    ]

    const swithcItems = [{
        "id":4285,
        "hsncode":"PLWIP142",
        "itemcode":"AS311",
        "itemname":"Wipro Nowa Switch Bell Push 6A with Ind 1M",
        "description":"Wipro Nowa Switch Bell Push 6A with Ind 1M",
        "unit":"Box",
        "category":"Switches",
        "subcategory":"Regular Switch",
        "price":390,
        "quantity":10,
        "rackcode":"J12",
        "thumbnail":NULL,
        "size":"1M",
        "color":"White/Silver Grey/Matt Black",
        "model":"Nowa",
        "brand":"Wipro",
        "reorderqty":5,
        "message":NULL,
        "invoucher_items":NULL,
        },
        {
        "id":4295,
        "hsncode":"PLWIP152",
        "itemcode":"AP933",
        "itemname":"Wipro Nowa 3M Plate with frame 3M",
        "description":"Wipro Nowa 3M Plate with frame 3M",
        "unit":"Box",
        "category":"Plates",
        "subcategory":"Frame Plate",
        "price":205,
        "quantity":10,
        "rackcode":"J12",
        "thumbnail":NULL,
        "size":"3M",
        "color":"White/Silver Grey/Matt Black",
        "model":"Nowa",
        "brand":"Wipro",
        "reorderqty":5,
        "message":NULL,
        "invoucher_items":NULL,
        }
    ]
    
    const FilteredProducts = [];
    FilteredProducts = swithcItems.filter(item => item.itemcode === item_code && item.brand === brand && item.model === model);
    const artisaswcolors  = artisa_swcolors.filter(item => item.brand === swithcItems.brand && item.model === swithcItems.model)

    console.log("Artisa Products:", artisaswcolors);
    console.log("Filtered Products:", FilteredProducts)

    if (brand == "Wipro" && model == "artisa") {
        price_col =  <artisaColorMRP fillterItems = {FilteredProducts} /> ;
    } else if (brand == "Wipro" && model == "nowa") {
        price_col = <nowaColorMRP fillterItems = {FilteredProducts} />;
    } else if (brand == "Wipro" && model == "venia") {
        price_col =  <veniaColorMRP fillterItems = {FilteredProducts} />;
    } else {
        price_col = <regularPriceMRP fillterItems = {FilteredProducts} /> ;
    }
    