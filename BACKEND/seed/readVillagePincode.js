require("dotenv").config();

const fs = require("fs");
const path = require("path");

const connectDB = require("../config/db");
const Village = require("../models/locations/Village");

const normalize = (value) =>
  String(value ?? "").trim();

const importVillagePincodes = async () => {
  try {
    await connectDB();

    const filePath = path.join(
      __dirname,
      "../data/villagepincodes.csv"
    );

    console.log(
      "Village Pincode File: villagepincodes.csv"
    );

    if (!fs.existsSync(filePath)) {
      throw new Error(
        "villagepincodes.csv file nahi mili."
      );
    }

    const csvData = fs.readFileSync(
      filePath,
      "utf8"
    );

    const lines = csvData
      .split(/\r?\n/)
      .filter((line) => line.trim());

    if (lines.length < 2) {
      throw new Error(
        "villagepincodes.csv mein data nahi mila."
      );
    }

    // -----------------------------------------
    // CSV parser
    // -----------------------------------------

    const parseCSVLine = (line) => {
      const values = [];
      let value = "";
      let insideQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          if (
            insideQuotes &&
            line[i + 1] === '"'
          ) {
            value += '"';
            i++;
          } else {
            insideQuotes = !insideQuotes;
          }
        } else if (
          char === "," &&
          !insideQuotes
        ) {
          values.push(value.trim());
          value = "";
        } else {
          value += char;
        }
      }

      values.push(value.trim());

      return values;
    };

    // -----------------------------------------
    // Header
    // -----------------------------------------

    const headers = parseCSVLine(
      lines[0]
    ).map((header) =>
      normalize(header)
        .toLowerCase()
        .replace(/[\s_]/g, "")
    );

    const getIndex = (name) =>
      headers.indexOf(name);

    const villageCodeIndex =
      getIndex("villagecode");

    const pincodeIndex =
      getIndex("pincode");

    const stateCodeIndex =
      getIndex("statecode");

    if (
      villageCodeIndex === -1 ||
      pincodeIndex === -1
    ) {
      throw new Error(
        "CSV mein Village Code ya Pincode column nahi mila."
      );
    }

    // -----------------------------------------
    // Build Village → Pincode map
    // -----------------------------------------

    const villagePincodeMap =
      new Map();

    for (
      let i = 1;
      i < lines.length;
      i++
    ) {
      const row =
        parseCSVLine(lines[i]);

      const villageCode =
        Number(
          normalize(
            row[villageCodeIndex]
          )
        );

      const pincode =
        Number(
          normalize(
            row[pincodeIndex]
          )
        );

      const stateCode =
        stateCodeIndex !== -1
          ? Number(
              normalize(
                row[stateCodeIndex]
              )
            )
          : 20;

      // Sirf Jharkhand
      if (stateCode !== 20) {
        continue;
      }

      if (
        !Number.isInteger(
          villageCode
        ) ||
        villageCode <= 0
      ) {
        continue;
      }

      if (
        !Number.isInteger(
          pincode
        ) ||
        pincode < 100000 ||
        pincode > 999999
      ) {
        continue;
      }

      // Same village ka different pincode
      // mila to immediately stop.
      if (
        villagePincodeMap.has(
          villageCode
        ) &&
        villagePincodeMap.get(
          villageCode
        ) !== pincode
      ) {
        throw new Error(
          `Village ${villageCode} ke multiple Pincode mile.`
        );
      }

      villagePincodeMap.set(
        villageCode,
        pincode
      );
    }

    console.log(
      `Unique Village-Pincode mappings: ${villagePincodeMap.size}`
    );

    if (!villagePincodeMap.size) {
      throw new Error(
        "Koi valid Village-Pincode mapping nahi mili."
      );
    }

    // -----------------------------------------
    // Validate villages
    // -----------------------------------------

    const villageCodes = [
      ...villagePincodeMap.keys(),
    ];

    const existingVillages =
      await Village.find({
        villageCode: {
          $in: villageCodes,
        },
      })
        .select(
          "villageCode villageName pincode"
        )
        .lean();

    const existingVillageCodes =
      new Set(
        existingVillages.map(
          (v) => v.villageCode
        )
      );

    const missingVillages =
      villageCodes.filter(
        (code) =>
          !existingVillageCodes.has(
            code
          )
      );

    console.log(
      `Villages found in database: ${existingVillages.length}`
    );

    if (missingVillages.length) {
      throw new Error(
        `Database mein ${missingVillages.length} Village codes nahi mile: ${missingVillages.slice(
          0,
          50
        ).join(", ")}`
      );
    }

    // -----------------------------------------
    // Update Village records
    // -----------------------------------------

    const operations = [];

    for (
      const [
        villageCode,
        pincode,
      ] of villagePincodeMap
    ) {
      operations.push({
        updateOne: {
          filter: {
            villageCode,
          },
          update: {
            $set: {
              pincode,
            },
          },
        },
      });
    }

    const result =
      await Village.bulkWrite(
        operations,
        {
          ordered: false,
        }
      );

    // -----------------------------------------
    // Verification
    // -----------------------------------------

    const villagesWithPincode =
      await Village.countDocuments({
        stateCode: 20,
        pincode: {
          $ne: null,
        },
      });

    console.log("");
    console.log(
      "========================================"
    );
    console.log(
      "VILLAGE PINCODE IMPORT COMPLETED"
    );
    console.log(
      "========================================"
    );

    console.log(
      `CSV Unique Mappings : ${villagePincodeMap.size}`
    );

    console.log(
      `Matched Villages    : ${existingVillages.length}`
    );

    console.log(
      `Modified            : ${result.modifiedCount}`
    );

    console.log(
      `Jharkhand Villages with Pincode: ${villagesWithPincode}`
    );

    console.log(
      "========================================"
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "Village Pincode import failed:",
      error
    );

    process.exit(1);
  }
};

importVillagePincodes();