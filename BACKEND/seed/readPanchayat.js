require("dotenv").config();

const XLSX = require("xlsx");
const path = require("path");

const connectDB = require("../config/db");
const Panchayat = require("../models/locations/Panchayat");
const State = require("../models/locations/State");
const District = require("../models/locations/District");

const STATE_CODE = 20;

const importPanchayats = async () => {
  try {
    // 1. MongoDB connect
    await connectDB();

    // 2. Local Body file
    const filePath = path.join(
      __dirname,
      "../data/localbodies.xls"
    );

    console.log("LocalBody File: localbodies.xls");

    // 3. Excel read
    const workbook = XLSX.readFile(filePath);

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    });

    console.log(
      `LocalBody rows found: ${rows.length}`
    );

    if (!rows.length) {
      throw new Error(
        "localbodies.xls mein koi data nahi mila."
      );
    }

    // 4. Extract Gram Panchayats
    const panchayatMap = new Map();

    for (const row of rows) {
      if (!Array.isArray(row)) continue;

      const values = row.map((value) =>
        String(value ?? "").trim()
      );

      const lowerValues = values.map((value) =>
        value.toLowerCase()
      );

      // Header rows skip
      if (
        lowerValues.includes("local body code") ||
        lowerValues.includes("local body name") ||
        lowerValues.includes("local body type") ||
        lowerValues.includes("localbody code") ||
        lowerValues.includes("localbody name") ||
        lowerValues.includes("localbody type name")
      ) {
        continue;
      }

      let code = null;
      let name = "";
      let type = "";

      // Find numeric Local Body Code
      for (const value of values) {
        if (
          !code &&
          /^\d{5,}$/.test(value)
        ) {
          code = Number(value);
          break;
        }
      }

      if (!Number.isFinite(code)) {
        continue;
      }

      // Find Local Body Type
      for (const value of lowerValues) {
        if (
          value === "gram panchayat" ||
          value === "gram panchayats" ||
          value === "gp"
        ) {
          type = "gram panchayat";
          break;
        }

        // Panchayat Samiti ko explicitly ignore
        if (
          value === "panchayat samiti" ||
          value.includes("panchayat samiti")
        ) {
          type = "panchayat samiti";
          break;
        }
      }

      // Sirf Gram Panchayat
      if (type !== "gram panchayat") {
        continue;
      }

      // Find Panchayat Name
      for (const value of values) {
        if (
          value &&
          !/^\d+$/.test(value) &&
          value.toLowerCase() !==
            "gram panchayat" &&
          value.toLowerCase() !==
            "gram panchayats" &&
          value.toLowerCase() !== "gp"
        ) {
          name = value;
          break;
        }
      }

      if (!name) {
        continue;
      }

      // Duplicate Panchayat Code
      if (!panchayatMap.has(code)) {
        panchayatMap.set(code, {
          stateCode: STATE_CODE,
          panchayatCode: code,
          panchayatName: name,
        });
      }
    }

    const panchayats = [
      ...panchayatMap.values(),
    ];

    console.log(
      `Gram Panchayats found: ${panchayats.length}`
    );

    // 5. Validation
    if (!panchayats.length) {
      throw new Error(
        "Excel se koi valid Gram Panchayat record nahi mila."
      );
    }

    // Expected Jharkhand Gram Panchayat count
    if (panchayats.length !== 4345) {
      throw new Error(
        `Expected 4345 Gram Panchayats, lekin ${panchayats.length} mile. Import roka gaya.`
      );
    }

    // 6. State validation
    const state = await State.findOne({
      stateCode: STATE_CODE,
    }).lean();

    if (!state) {
      throw new Error(
        "State Code 20 ka State record nahi mila. Pehle readState.js run karo."
      );
    }

    console.log(
      `State verified: ${state.stateName} (Code: ${STATE_CODE})`
    );

    // 7. Read villages.xls for District mapping
    const villageFilePath = path.join(
      __dirname,
      "../data/villages.xls"
    );

    console.log(
      "Reading villages.xls for Panchayat-District mapping..."
    );

    const villageWorkbook =
      XLSX.readFile(villageFilePath);

    const villageSheet =
      villageWorkbook.Sheets[
        villageWorkbook.SheetNames[0]
      ];

    const villageRows =
      XLSX.utils.sheet_to_json(
        villageSheet,
        {
          header: 1,
          defval: "",
        }
      );

    if (!villageRows.length) {
      throw new Error(
        "villages.xls mein koi data nahi mila."
      );
    }

    // 8. Create Panchayat -> District mapping
    const panchayatDistrictMap = new Map();

    for (const row of villageRows) {
      if (!Array.isArray(row)) continue;

      /*
        villages.xls actual columns:

        Index 1  = District Code
        Index 13 = Local Body Code
      */

      const districtCode = Number(
        String(row[1] ?? "").trim()
      );

      const panchayatCode = Number(
        String(row[13] ?? "").trim()
      );

      if (
        !Number.isFinite(districtCode) ||
        !Number.isFinite(panchayatCode)
      ) {
        continue;
      }

      // Sirf hamare Gram Panchayats ke codes
      if (!panchayatMap.has(panchayatCode)) {
        continue;
      }

      const existingDistrictCode =
        panchayatDistrictMap.get(
          panchayatCode
        );

      // Same Panchayat multiple districts me nahi hona chahiye
      if (
        existingDistrictCode &&
        existingDistrictCode !== districtCode
      ) {
        throw new Error(
          `Panchayat ${panchayatCode} multiple Districts se mapped hai: ${existingDistrictCode}, ${districtCode}`
        );
      }

      panchayatDistrictMap.set(
        panchayatCode,
        districtCode
      );
    }

    console.log(
      `Panchayat-District mappings found: ${panchayatDistrictMap.size}`
    );

    // 9. Validate every Panchayat has District Code
    const missingDistrictMappings = [];

    for (const panchayat of panchayats) {
      if (
        !panchayatDistrictMap.has(
          panchayat.panchayatCode
        )
      ) {
        missingDistrictMappings.push(
          panchayat.panchayatCode
        );
      }
    }

    if (missingDistrictMappings.length) {
      throw new Error(
        `District Code mapping missing for ${missingDistrictMappings.length} Panchayats. First codes: ${missingDistrictMappings
          .slice(0, 20)
          .join(", ")}`
      );
    }

    // 10. Verify Districts exist
    const districtCodes = [
      ...new Set(
        panchayatDistrictMap.values()
      ),
    ];

    const districts = await District.find({
      stateCode: STATE_CODE,
      districtCode: {
        $in: districtCodes,
      },
    }).lean();

    const existingDistrictCodes = new Set(
      districts.map(
        (district) => district.districtCode
      )
    );

    const missingDistricts =
      districtCodes.filter(
        (districtCode) =>
          !existingDistrictCodes.has(
            districtCode
          )
      );

    if (missingDistricts.length) {
      throw new Error(
        `Database mein ye District Codes nahi mile: ${missingDistricts.join(
          ", "
        )}`
      );
    }

    console.log(
      `Districts verified: ${existingDistrictCodes.size}`
    );

    // 11. Add District Code to Panchayat data
    for (const panchayat of panchayats) {
      panchayat.districtCode =
        panchayatDistrictMap.get(
          panchayat.panchayatCode
        );
    }

    // 12. Duplicate code validation
    const codes = panchayats.map(
      (item) => item.panchayatCode
    );

    const uniqueCodes = new Set(codes);

    if (
      codes.length !== uniqueCodes.size
    ) {
      throw new Error(
        "Duplicate Panchayat Code mila."
      );
    }

    // 13. Remove old Panchayat data
    const deleted =
      await Panchayat.deleteMany({
        stateCode: STATE_CODE,
      });

    console.log(
      `Old Panchayat records deleted: ${deleted.deletedCount}`
    );

    // 14. Insert fresh Panchayat data
    const inserted =
      await Panchayat.insertMany(
        panchayats
      );

    console.log(
      `${inserted.length} Panchayat records imported successfully.`
    );

    // 15. Final verification
    const totalPanchayats =
      await Panchayat.countDocuments({
        stateCode: STATE_CODE,
      });

    const missingDistrictCode =
      await Panchayat.countDocuments({
        stateCode: STATE_CODE,
        $or: [
          {
            districtCode: {
              $exists: false,
            },
          },
          {
            districtCode: null,
          },
        ],
      });

    // Panchayat Samiti codes must not exist
    const samitiCodes = [
      274813,
      274810,
      274811,
      274812,
      299750,
    ];

    const samitiCount =
      await Panchayat.countDocuments({
        stateCode: STATE_CODE,
        panchayatCode: {
          $in: samitiCodes,
        },
      });

    if (samitiCount !== 0) {
      throw new Error(
        `${samitiCount} Panchayat Samiti records database mein mil gaye.`
      );
    }

    if (missingDistrictCode !== 0) {
      throw new Error(
        `${missingDistrictCode} Panchayat records mein districtCode missing hai.`
      );
    }

    console.log("--------------------------------");
    console.log(
      "PANCHAYAT IMPORT COMPLETED"
    );
    console.log("--------------------------------");
    console.log(
      `Total Panchayats : ${totalPanchayats}`
    );
    console.log(
      `Jharkhand (20)   : ${totalPanchayats}`
    );
    console.log(
      `Missing District : ${missingDistrictCode}`
    );
    console.log(
      `Panchayat Samiti : ${samitiCount}`
    );
    console.log("--------------------------------");

    process.exit(0);
  } catch (error) {
    console.error(
      "Panchayat import failed:",
      error
    );

    process.exit(1);
  }
};

importPanchayats();