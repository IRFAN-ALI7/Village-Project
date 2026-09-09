require("dotenv").config();

const fs = require("fs");
const path = require("path");

const connectDB = require("../config/db");
const PostOffice = require("../models/locations/PostOffice");

const normalize = (value) =>
  String(value ?? "").trim();

const importPostOffices = async () => {
  try {
    await connectDB();

    const filePath = path.join(
      __dirname,
      "../data/postoffice.csv"
    );

    console.log("Post Office File: postoffice.csv");

    if (!fs.existsSync(filePath)) {
      throw new Error(
        "postoffice.csv file nahi mili."
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
        "postoffice.csv mein data nahi mila."
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

    const headers = parseCSVLine(lines[0]).map(
      (header) =>
        normalize(header)
          .toLowerCase()
          .replace(/[\s_]/g, "")
    );

    const getIndex = (name) =>
      headers.indexOf(name);

    const circleIndex =
      getIndex("circlename");

    const regionIndex =
      getIndex("regionname");

    const divisionIndex =
      getIndex("divisionname");

    const officeIndex =
      getIndex("officename");

    const pincodeIndex =
      getIndex("pincode");

    const officeTypeIndex =
      getIndex("officetype");

    const deliveryIndex =
      getIndex("delivery");

    const districtIndex =
      getIndex("district");

    const stateIndex =
      getIndex("statename");

    const latitudeIndex =
      getIndex("latitude");

    const longitudeIndex =
      getIndex("longitude");

    if (
      officeIndex === -1 ||
      pincodeIndex === -1 ||
      stateIndex === -1
    ) {
      throw new Error(
        "CSV mein Office Name, Pincode ya State Name column nahi mila."
      );
    }

    // -----------------------------------------
    // Build Post Office map
    // -----------------------------------------

    const postOfficeMap = new Map();

    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i]);

      const stateName = normalize(
        row[stateIndex]
      );

      // Sirf Jharkhand
      if (
        stateName.toUpperCase() !==
        "JHARKHAND"
      ) {
        continue;
      }

      const officeName = normalize(
        row[officeIndex]
      );

      const pincode = Number(
        normalize(row[pincodeIndex])
      );

      if (!officeName) continue;

      if (
        !Number.isInteger(pincode) ||
        pincode < 100000 ||
        pincode > 999999
      ) {
        continue;
      }

      const latitudeRaw =
        latitudeIndex !== -1
          ? normalize(row[latitudeIndex])
          : "";

      const longitudeRaw =
        longitudeIndex !== -1
          ? normalize(row[longitudeIndex])
          : "";

      const latitude =
        latitudeRaw &&
        Number.isFinite(Number(latitudeRaw))
          ? Number(latitudeRaw)
          : null;

      const longitude =
        longitudeRaw &&
        Number.isFinite(Number(longitudeRaw))
          ? Number(longitudeRaw)
          : null;

      // Same Pincode + Office ko duplicate nahi karenge
      const key =
        `${pincode}_${officeName.toLowerCase()}`;

      if (!postOfficeMap.has(key)) {
        postOfficeMap.set(key, {
          circleName:
            circleIndex !== -1
              ? normalize(row[circleIndex])
              : "",

          regionName:
            regionIndex !== -1
              ? normalize(row[regionIndex])
              : "",

          divisionName:
            divisionIndex !== -1
              ? normalize(row[divisionIndex])
              : "",

          officeName,

          pincode,

          officeType:
            officeTypeIndex !== -1
              ? normalize(row[officeTypeIndex])
              : "",

          delivery:
            deliveryIndex !== -1
              ? normalize(row[deliveryIndex])
              : "",

          district:
            districtIndex !== -1
              ? normalize(row[districtIndex])
              : "",

          stateName,

          latitude,

          longitude,
        });
      }
    }

    const postOffices = [
      ...postOfficeMap.values(),
    ];

    console.log(
      `Unique Jharkhand Post Offices: ${postOffices.length}`
    );

    if (!postOffices.length) {
      throw new Error(
        "Jharkhand ka koi valid Post Office record nahi mila."
      );
    }

    // -----------------------------------------
    // Delete old Jharkhand Post Offices
    // -----------------------------------------

    const deleted =
      await PostOffice.deleteMany({
        stateName: {
          $regex: /^JHARKHAND$/i,
        },
      });

    console.log(
      `Old Jharkhand Post Offices deleted: ${deleted.deletedCount}`
    );

    // -----------------------------------------
    // Insert
    // -----------------------------------------

    const inserted =
      await PostOffice.insertMany(
        postOffices
      );

    console.log(
      `New Jharkhand Post Offices inserted: ${inserted.length}`
    );

    // -----------------------------------------
    // Verification
    // -----------------------------------------

    const total =
      await PostOffice.countDocuments({
        stateName: {
          $regex: /^JHARKHAND$/i,
        },
      });

    const uniquePincodes =
      await PostOffice.distinct(
        "pincode",
        {
          stateName: {
            $regex: /^JHARKHAND$/i,
          },
        }
      );

    console.log("");
    console.log(
      "========================================"
    );
    console.log(
      "POST OFFICE IMPORT COMPLETED"
    );
    console.log(
      "========================================"
    );
    console.log(
      `Total Post Offices : ${total}`
    );
    console.log(
      `Unique Pincodes    : ${uniquePincodes.length}`
    );
    console.log(
      "========================================"
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "Post Office import failed:",
      error
    );

    process.exit(1);
  }
};

importPostOffices();