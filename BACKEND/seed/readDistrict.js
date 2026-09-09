require("dotenv").config();

const XLSX = require("xlsx");
const path = require("path");

const connectDB = require("../config/db");
const District = require("../models/locations/District");
const State = require("../models/locations/State");

const importDistricts = async () => {
  try {
    // -----------------------------------------
    // 1. MongoDB connect
    // -----------------------------------------

    await connectDB();

    // -----------------------------------------
    // 2. District file
    // -----------------------------------------

    const filePath = path.join(
      __dirname,
      "../data/districts.xls"
    );

    console.log("District File: districts.xls");

    // -----------------------------------------
    // 3. Excel read
    // -----------------------------------------

    const workbook = XLSX.readFile(filePath);

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    /*
      Actual file structure:

      Row 0 = Title
      Row 1 = Jharkhand + State Code 20
      Row 2 = Blank
      Row 3 = Main headers
      Row 4 = Sub headers
      Row 5+ = District data

      Isliye raw rows ko range 3 se read kar rahe hain.
    */

    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      range: 3,
      defval: "",
    });

    if (!rows.length) {
      throw new Error(
        "districts.xls mein koi data nahi mila."
      );
    }

    // -----------------------------------------
    // 4. Actual data rows
    // -----------------------------------------

    /*
      rows[0] = main headers
      rows[1] = sub headers
      rows[2] onward = actual districts
    */

    const dataRows = rows.slice(2);

    console.log(
      `District rows found: ${dataRows.length}`
    );

    // -----------------------------------------
    // 5. Excel → MongoDB format
    // -----------------------------------------

    const districts = dataRows
      .map((row) => {
        return {
          // Column 1
          districtCode: Number(row[1]),

          // Column 2
          districtVersion: Number(row[2]),

          // Column 3
          districtName: String(
            row[3] || ""
          ).trim(),

          // Column 4
          districtNameLocal: String(
            row[4] || ""
          ).trim(),

          // Column 5
          census2001Code: String(
            row[5] || ""
          ).trim(),

          // Column 6
          census2011Code: String(
            row[6] || ""
          ).trim(),

          // File Jharkhand ka hai
          stateCode: 20,
        };
      })
      .filter(
        (district) =>
          Number.isFinite(
            district.districtCode
          ) &&
          Number.isFinite(
            district.districtVersion
          ) &&
          district.districtName
      );

    // -----------------------------------------
    // 6. Validation
    // -----------------------------------------

    if (!districts.length) {
      throw new Error(
        "Excel se koi valid District record nahi mila."
      );
    }

    console.log(
      `Valid District records: ${districts.length}`
    );

    // -----------------------------------------
    // 7. State relation validation
    // -----------------------------------------

    const state = await State.findOne({
      stateCode: 20,
    }).lean();

    if (!state) {
      throw new Error(
        "State Code 20 ka State record nahi mila. Pehle readState.js run karo."
      );
    }

    console.log(
      `State relation verified: ${state.stateName} (Code: 20)`
    );

    // -----------------------------------------
    // 8. Duplicate District Code check
    // -----------------------------------------

    const districtCodes = districts.map(
      (district) => district.districtCode
    );

    const uniqueDistrictCodes = new Set(
      districtCodes
    );

    if (
      districtCodes.length !==
      uniqueDistrictCodes.size
    ) {
      throw new Error(
        "Excel mein duplicate District Code mila."
      );
    }

    // -----------------------------------------
    // 9. Delete old District data
    // -----------------------------------------

    const deleted =
      await District.deleteMany({});

    console.log(
      `Old District records deleted: ${deleted.deletedCount}`
    );

    // -----------------------------------------
    // 10. Insert new District data
    // -----------------------------------------

    const inserted =
      await District.insertMany(
        districts
      );

    console.log(
      `${inserted.length} District records imported successfully.`
    );

    // -----------------------------------------
    // 11. Verification
    // -----------------------------------------

    const totalDistricts =
      await District.countDocuments();

    const state20Districts =
      await District.countDocuments({
        stateCode: 20,
      });

    console.log("--------------------------------");
    console.log(
      "DISTRICT IMPORT COMPLETED"
    );
    console.log("--------------------------------");
    console.log(
      `Total Districts : ${totalDistricts}`
    );
    console.log(
      `Jharkhand (20)  : ${state20Districts}`
    );
    console.log("--------------------------------");

    process.exit(0);
  } catch (error) {
    console.error(
      "District import failed:",
      error
    );

    process.exit(1);
  }
};

importDistricts();