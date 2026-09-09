require("dotenv").config();

const XLSX = require("xlsx");
const path = require("path");

const connectDB = require("../config/db");

const Village = require("../models/locations/Village");
const Panchayat = require("../models/locations/Panchayat");
const PanchayatVillage = require("../models/locations/PanchayatVillage");
const State = require("../models/locations/State");

const STATE_CODE = 20;

const importVillages = async () => {
  try {
    // -----------------------------------------
    // 1. MongoDB
    // -----------------------------------------

    await connectDB();

    // -----------------------------------------
    // 2. File
    // -----------------------------------------

    const filePath = path.join(
      __dirname,
      "../data/villages.xls"
    );

    console.log("Village File: villages.xls");

    // -----------------------------------------
    // 3. Read Excel
    // -----------------------------------------

    const workbook = XLSX.readFile(filePath);

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    });

    console.log(`Village rows found: ${rows.length}`);

    if (!rows.length) {
      throw new Error(
        "villages.xls mein koi data nahi mila."
      );
    }

    // -----------------------------------------
    // 4. Find actual header
    // -----------------------------------------

    const headerIndex = rows.findIndex(
      (row) =>
        Array.isArray(row) &&
        String(row[9] ?? "").trim() === "Village Code"
    );

    if (headerIndex === -1) {
      throw new Error(
        "Village Code header nahi mila."
      );
    }

    console.log(
      `Village header row found at index: ${headerIndex}`
    );

    // Row 5 is the English sub-header.
    // Actual data starts from row 6.
    const dataRows = rows.slice(headerIndex + 2);

    // -----------------------------------------
    // 5. Maps
    // -----------------------------------------

    const villagesMap = new Map();
    const mappingsMap = new Map();

    for (const row of dataRows) {
      if (!Array.isArray(row)) continue;

      // ---------------------------------------
      // Exact Excel columns
      // ---------------------------------------

      const districtCode = Number(
        String(row[1] ?? "").trim()
      );

      const subDistrictCode = Number(
        String(row[5] ?? "").trim()
      );

      const villageCode = Number(
        String(row[9] ?? "").trim()
      );

      const villageName = String(
        row[10] ?? ""
      ).trim();

      const panchayatCodeRaw = String(
        row[13] ?? ""
      ).trim();

      // ---------------------------------------
      // Village validation
      // ---------------------------------------

      if (
        !Number.isFinite(districtCode) ||
        districtCode <= 0 ||
        !Number.isFinite(subDistrictCode) ||
        subDistrictCode <= 0 ||
        !Number.isFinite(villageCode) ||
        villageCode <= 0 ||
        !villageName
      ) {
        continue;
      }

      // ---------------------------------------
      // Village Master
      //
      // Panchayat mandatory nahi hai.
      // ---------------------------------------

      if (!villagesMap.has(villageCode)) {
        villagesMap.set(villageCode, {
          stateCode: STATE_CODE,
          districtCode,
          subDistrictCode,
          villageCode,
          villageName,
          pincode: null,
        });
      }

      // ---------------------------------------
      // Panchayat → Village
      //
      // Local Body Code blank hai to
      // mapping nahi banegi.
      // Village phir bhi database mein rahega.
      // ---------------------------------------

      if (!panchayatCodeRaw) {
        continue;
      }

      const panchayatCode = Number(
        panchayatCodeRaw
      );

      if (
        !Number.isFinite(panchayatCode) ||
        panchayatCode <= 0
      ) {
        continue;
      }

      const mappingKey =
        `${subDistrictCode}_${panchayatCode}_${villageCode}`;

      if (!mappingsMap.has(mappingKey)) {
        mappingsMap.set(mappingKey, {
          subDistrictCode,
          panchayatCode,
          villageCode,
        });
      }
    }

    const villages = [
      ...villagesMap.values(),
    ];

    const mappings = [
      ...mappingsMap.values(),
    ];

    console.log(
      `Unique Village records: ${villages.length}`
    );

    console.log(
      `Panchayat-Village mappings: ${mappings.length}`
    );

    // -----------------------------------------
    // 6. Validation
    // -----------------------------------------

    if (!villages.length) {
      throw new Error(
        "Koi valid Village record nahi mila."
      );
    }

    // -----------------------------------------
    // 7. State verification
    // -----------------------------------------

    const state = await State.findOne({
      stateCode: STATE_CODE,
    }).lean();

    if (!state) {
      throw new Error(
        "State Code 20 ka State record nahi mila."
      );
    }

    console.log(
      `State verified: ${state.stateName} (Code: ${STATE_CODE})`
    );

    // -----------------------------------------
    // 8. Panchayat verification
    // -----------------------------------------

    const panchayatCodes = [
      ...new Set(
        mappings.map(
          (item) => item.panchayatCode
        )
      ),
    ];

    const existingPanchayats =
      panchayatCodes.length
        ? await Panchayat.find({
            stateCode: STATE_CODE,
            panchayatCode: {
              $in: panchayatCodes,
            },
          })
            .select("panchayatCode")
            .lean()
        : [];

    const existingCodes = new Set(
      existingPanchayats.map(
        (item) => item.panchayatCode
      )
    );

    const missingCodes =
      panchayatCodes.filter(
        (code) => !existingCodes.has(code)
      );

    if (missingCodes.length > 0) {
      throw new Error(
        `Database mein ${missingCodes.length} Panchayat codes nahi mile: ${missingCodes
          .slice(0, 50)
          .join(", ")}`
      );
    }

    console.log(
      `Panchayat relation verified: ${existingCodes.size} Panchayats`
    );

    // -----------------------------------------
    // 9. Delete old Village records
    // -----------------------------------------

    const deletedVillages =
      await Village.deleteMany({
        stateCode: STATE_CODE,
      });

    console.log(
      `Old Village records deleted: ${deletedVillages.deletedCount}`
    );

    // -----------------------------------------
    // 10. Delete old mappings
    // -----------------------------------------

    const deletedMappings =
      await PanchayatVillage.deleteMany({});

    console.log(
      `Old PanchayatVillage mappings deleted: ${deletedMappings.deletedCount}`
    );

    // -----------------------------------------
    // 11. Insert Villages
    // -----------------------------------------

    const insertedVillages =
      await Village.insertMany(villages);

    console.log(
      `New Village records inserted: ${insertedVillages.length}`
    );

    // -----------------------------------------
    // 12. Insert Panchayat-Village mappings
    // -----------------------------------------

    let insertedMappings = [];

    if (mappings.length > 0) {
      insertedMappings =
        await PanchayatVillage.insertMany(
          mappings
        );
    }

    console.log(
      `New Panchayat-Village mappings inserted: ${insertedMappings.length}`
    );

    // -----------------------------------------
    // 13. Final verification
    // -----------------------------------------

    const totalVillages =
      await Village.countDocuments({
        stateCode: STATE_CODE,
      });

    const totalMappings =
      await PanchayatVillage.countDocuments();

    console.log("--------------------------------");
    console.log("VILLAGE IMPORT COMPLETED");
    console.log("--------------------------------");

    console.log(
      `Total Villages       : ${totalVillages}`
    );

    console.log(
      `Total PV Mappings    : ${totalMappings}`
    );

    console.log("--------------------------------");

    process.exit(0);
  } catch (error) {
    console.error(
      "Village import failed:",
      error
    );

    process.exit(1);
  }
};

importVillages();