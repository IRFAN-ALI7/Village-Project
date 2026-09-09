require("dotenv").config();

const XLSX = require("xlsx");
const path = require("path");

const connectDB = require("../config/db");

const SubDistrict = require("../models/locations/SubDistrict");
const Panchayat = require("../models/locations/Panchayat");
const Village = require("../models/locations/Village");
const PanchayatVillage = require("../models/locations/PanchayatVillage");

const normalizeName = (value) => {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[().]/g, "");
};

const importPanchayatVillages = async () => {
  try {
    await connectDB();

    // EXCEL FILE

    const filePath = path.join(
      __dirname,
      "../data/panchayat-village.xlsx"
    );

    const workbook = XLSX.readFile(filePath);

    const sheet =
      workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    });

    if (!rows.length) {
      throw new Error(
        "panchayat-village.xlsx mein koi data nahi mila."
      );
    }

    // READ PANCHAYAT-VILLAGE DATA

    const excelRows = [];

    for (const row of rows) {
      if (!Array.isArray(row)) continue;

      const districtCode = Number(row[1]);

      const developmentBlockCode =
        Number(row[3]);

      const developmentBlockName =
        String(row[4] ?? "").trim();

      const panchayatCode =
        Number(row[5]);

      const villageCode =
        Number(row[7]);

      if (
        districtCode !== 328 ||
        !Number.isInteger(developmentBlockCode) ||
        !developmentBlockName ||
        !Number.isInteger(panchayatCode) ||
        !Number.isInteger(villageCode)
      ) {
        continue;
      }

      excelRows.push({
        developmentBlockCode,
        developmentBlockName,
        panchayatCode,
        villageCode,
      });
    }

    if (!excelRows.length) {
      throw new Error(
        "Excel se koi valid Panchayat-Village record nahi mila."
      );
    }

    console.log(
      `Excel Panchayat-Village rows: ${excelRows.length}`
    );

    // EXISTING SUBDISTRICT DATABASE

    const subDistricts =
      await SubDistrict.find({
        districtCode: 328,
      })
        .select(
          "districtCode subDistrictCode subDistrictName"
        )
        .lean();

    if (!subDistricts.length) {
      throw new Error(
        "Garhwa ke SubDistrict database mein koi record nahi mila."
      );
    }

    // SUBDISTRICT NAME MAP

    const subDistrictMap = new Map();

    for (const subDistrict of subDistricts) {
      const key = normalizeName(
        subDistrict.subDistrictName
      );

      subDistrictMap.set(
        key,
        subDistrict.subDistrictCode
      );
    }

    const manualNameMap = {
      bargad: 6329,
      ketar: 2497,
      manjhiaon: 2499,
      meral: 2508,
      "nagar untari": 2503,
    };

    // DEVELOPMENT BLOCK TO SUBDISTRICT

    const developmentBlockMap = new Map();

    const missingBlocks = new Set();

    for (const row of excelRows) {
      const normalizedName =
        normalizeName(
          row.developmentBlockName
        );

      let dbSubDistrictCode =
        manualNameMap[normalizedName];

      if (!dbSubDistrictCode) {
        dbSubDistrictCode =
          subDistrictMap.get(
            normalizedName
          );
      }

      if (!dbSubDistrictCode) {
        missingBlocks.add(
          `${row.developmentBlockCode} - ${row.developmentBlockName}`
        );

        continue;
      }

      developmentBlockMap.set(
        row.developmentBlockCode,
        dbSubDistrictCode
      );
    }

    if (missingBlocks.size) {
      throw new Error(
        `In Development Blocks ka SubDistrict database mein match nahi mila:\n${[
          ...missingBlocks,
        ].join("\n")}`
      );
    }

    console.log(
      `Development Block → SubDistrict mappings: ${developmentBlockMap.size}`
    );

    // CREATE FINAL MAPPINGS

    const mappings = [];

    for (const row of excelRows) {
      const subDistrictCode =
        developmentBlockMap.get(
          row.developmentBlockCode
        );

      if (!subDistrictCode) {
        throw new Error(
          `SubDistrict mapping missing for Development Block Code ${row.developmentBlockCode}`
        );
      }

      mappings.push({
        subDistrictCode,
        panchayatCode: row.panchayatCode,
        villageCode: row.villageCode,
      });
    }

    // REMOVE DUPLICATE MAPPINGS

    const uniqueMappings = new Map();

    for (const mapping of mappings) {
      const key =
        `${mapping.subDistrictCode}-` +
        `${mapping.panchayatCode}-` +
        `${mapping.villageCode}`;

      uniqueMappings.set(
        key,
        mapping
      );
    }

    const finalMappings = [
      ...uniqueMappings.values(),
    ];

    console.log(
      `Unique Panchayat-Village mappings: ${finalMappings.length}`
    );

    // VALIDATE PANCHAYATS

    const panchayatCodes = [
      ...new Set(
        finalMappings.map(
          (item) =>
            item.panchayatCode
        )
      ),
    ];

    const panchayats =
      await Panchayat.find({
        panchayatCode: {
          $in: panchayatCodes,
        },
        districtCode: 328,
      })
        .select(
          "panchayatCode districtCode"
        )
        .lean();

    const panchayatSet =
      new Set(
        panchayats.map(
          (item) =>
            item.panchayatCode
        )
      );

    const missingPanchayats =
      panchayatCodes.filter(
        (code) =>
          !panchayatSet.has(code)
      );

    if (missingPanchayats.length) {
      throw new Error(
        `Garhwa database mein ${missingPanchayats.length} Panchayat codes nahi mile: ${missingPanchayats.join(", ")}`
      );
    }

    console.log(
      `Panchayat validation passed: ${panchayatCodes.length}`
    );

    // VALIDATE VILLAGES

    const villageCodes = [
      ...new Set(
        finalMappings.map(
          (item) =>
            item.villageCode
        )
      ),
    ];

    const villages =
      await Village.find({
        villageCode: {
          $in: villageCodes,
        },
        districtCode: 328,
      })
        .select(
          "villageCode districtCode subDistrictCode"
        )
        .lean();

    const villageSet =
      new Set(
        villages.map(
          (item) =>
            item.villageCode
        )
      );

    const missingVillages =
      villageCodes.filter(
        (code) =>
          !villageSet.has(code)
      );

    if (missingVillages.length) {
      throw new Error(
        `Garhwa database mein ${missingVillages.length} Village codes nahi mile: ${missingVillages.join(", ")}`
      );
    }

    console.log(
      `Village validation passed: ${villageCodes.length}`
    );

    // UPSERT GARHWA MAPPINGS

    const operations = finalMappings.map(
      (mapping) => ({
        updateOne: {
          filter: {
            subDistrictCode:
              mapping.subDistrictCode,
            panchayatCode:
              mapping.panchayatCode,
            villageCode:
              mapping.villageCode,
          },
          update: {
            $set: {
              subDistrictCode:
                mapping.subDistrictCode,
              panchayatCode:
                mapping.panchayatCode,
              villageCode:
                mapping.villageCode,
            },
          },
          upsert: true,
        },
      })
    );

    const result =
      await PanchayatVillage.bulkWrite(
        operations
      );

    console.log(
      `Garhwa mappings matched: ${result.matchedCount}`
    );

    console.log(
      `Garhwa mappings modified: ${result.modifiedCount}`
    );

    console.log(
      `Garhwa mappings inserted: ${result.upsertedCount}`
    );

    // FINAL COUNT

    const totalMappings =
      await PanchayatVillage.countDocuments();

    console.log(
      `Total Panchayat-Village mappings in database: ${totalMappings}`
    );

    // COMPLETED

    console.log("");
    console.log(
      "========================================"
    );
    console.log(
      "PANCHAYAT-VILLAGE IMPORT COMPLETED"
    );
    console.log(
      "========================================"
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "Panchayat-Village import failed:",
      error
    );

    process.exit(1);
  }
};

importPanchayatVillages();