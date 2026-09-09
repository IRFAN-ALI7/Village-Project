require("dotenv").config();

const XLSX = require("xlsx");
const path = require("path");

const connectDB = require("../config/db");
const State = require("../models/locations/State");
const District = require("../models/locations/District");
const SubDistrict = require("../models/locations/SubDistrict");

const importSubDistricts = async () => {
  try {
    // -----------------------------------------
    // 1. MongoDB connect
    // -----------------------------------------

    await connectDB();

    // -----------------------------------------
    // 2. File
    // -----------------------------------------

    const filePath = path.join(
      __dirname,
      "../data/subdistricts.xls"
    );

    console.log(
      "SubDistrict File: subdistricts.xls"
    );

    // -----------------------------------------
    // 3. Read Excel
    // -----------------------------------------

    const workbook = XLSX.readFile(filePath);

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    /*
      Actual file:

      Row 0 = Title
      Row 1 = Jharkhand + State Code 20
      Row 2 = Blank
      Row 3 = Headers
      Row 4 = Sub-header
      Row 5+ = Data
    */

    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      range: 3,
      defval: "",
    });

    if (!rows.length) {
      throw new Error(
        "subdistricts.xls mein koi data nahi mila."
      );
    }

    // rows[0] = headers
    // rows[1] = sub-header
    // rows[2+] = actual data

    const dataRows = rows.slice(2);

    console.log(
      `SubDistrict rows found: ${dataRows.length}`
    );

    // -----------------------------------------
    // 4. Excel → MongoDB
    // -----------------------------------------

    const subDistricts = dataRows
      .map((row) => {
        return {
          // S.No. → row[0]

          districtCode: Number(row[1]),

          districtName: String(
            row[2] || ""
          ).trim(),

          subDistrictCode: Number(row[3]),

          subDistrictVersion: Number(
            row[4]
          ),

          subDistrictName: String(
            row[5] || ""
          ).trim(),

          subDistrictNameLocal: String(
            row[6] || ""
          ).trim(),

          census2001Code: String(
            row[7] || ""
          ).trim(),

          census2011Code: String(
            row[8] || ""
          ).trim(),

          // File Jharkhand ka hai
          stateCode: 20,
        };
      })
      .filter(
        (subDistrict) =>
          Number.isFinite(
            subDistrict.districtCode
          ) &&
          Number.isFinite(
            subDistrict.subDistrictCode
          ) &&
          Number.isFinite(
            subDistrict.subDistrictVersion
          ) &&
          subDistrict.districtName &&
          subDistrict.subDistrictName
      );

    // -----------------------------------------
    // 5. Validation
    // -----------------------------------------

    if (!subDistricts.length) {
      throw new Error(
        "Excel se koi valid SubDistrict record nahi mila."
      );
    }

    console.log(
      `Valid SubDistrict records: ${subDistricts.length}`
    );

    // -----------------------------------------
    // 6. State relation
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
    // 7. District relation
    // -----------------------------------------

    const districtCodes = [
      ...new Set(
        subDistricts.map(
          (item) => item.districtCode
        )
      ),
    ];

    const existingDistricts =
      await District.find(
        {
          districtCode: {
            $in: districtCodes,
          },

          stateCode: 20,
        },
        {
          districtCode: 1,
        }
      ).lean();

    const existingDistrictCodes =
      new Set(
        existingDistricts.map(
          (district) =>
            district.districtCode
        )
      );

    const missingDistrictCodes =
      districtCodes.filter(
        (code) =>
          !existingDistrictCodes.has(code)
      );

    if (missingDistrictCodes.length) {
      throw new Error(
        `SubDistrict data mein invalid District Code mila: ${missingDistrictCodes.join(
          ", "
        )}`
      );
    }

    console.log(
      `District relation verified: ${districtCodes.length} Districts`
    );

    // -----------------------------------------
    // 8. Duplicate SubDistrict Code
    // -----------------------------------------

    const subDistrictCodes =
      subDistricts.map(
        (item) =>
          item.subDistrictCode
      );

    const uniqueSubDistrictCodes =
      new Set(subDistrictCodes);

    if (
      subDistrictCodes.length !==
      uniqueSubDistrictCodes.size
    ) {
      throw new Error(
        "Excel mein duplicate SubDistrict Code mila."
      );
    }

    // -----------------------------------------
    // 9. Delete old data
    // -----------------------------------------

    const deleted =
      await SubDistrict.deleteMany({});

    console.log(
      `Old SubDistrict records deleted: ${deleted.deletedCount}`
    );

    // -----------------------------------------
    // 10. Insert new data
    // -----------------------------------------

    const inserted =
      await SubDistrict.insertMany(
        subDistricts
      );

    console.log(
      `${inserted.length} SubDistrict records imported successfully.`
    );

    // -----------------------------------------
    // 11. Verification
    // -----------------------------------------

    const totalSubDistricts =
      await SubDistrict.countDocuments();

    const totalState20 =
      await SubDistrict.countDocuments({
        stateCode: 20,
      });

    console.log("--------------------------------");
    console.log(
      "SUBDISTRICT IMPORT COMPLETED"
    );
    console.log("--------------------------------");
    console.log(
      `Total SubDistricts : ${totalSubDistricts}`
    );
    console.log(
      `Jharkhand (20)     : ${totalState20}`
    );
    console.log("--------------------------------");

    process.exit(0);
  } catch (error) {
    console.error(
      "SubDistrict import failed:",
      error
    );

    process.exit(1);
  }
};

importSubDistricts();