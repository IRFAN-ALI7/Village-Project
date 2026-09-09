require("dotenv").config();

const XLSX = require("xlsx");
const path = require("path");

const connectDB = require("../config/db");
const State = require("../models/locations/State");

const importStates = async () => {
  try {
    // -----------------------------------------
    // 1. MongoDB connect
    // -----------------------------------------

    await connectDB();

    // -----------------------------------------
    // 2. State Excel file
    // -----------------------------------------

    const filePath = path.join(
      __dirname,
      "../data/states.xlsx"
    );

    console.log("State File: states.xlsx");

    // -----------------------------------------
    // 3. Excel read
    // -----------------------------------------

    const workbook = XLSX.readFile(filePath);

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Original State file mein first row title hai,
    // isliye header ke baad actual data read kar rahe hain.
    const rows = XLSX.utils.sheet_to_json(sheet, {
      range: 1,
      defval: "",
    });

    console.log(`States found: ${rows.length}`);

    if (!rows.length) {
      throw new Error(
        "states.xlsx mein koi data nahi mila."
      );
    }

    // -----------------------------------------
    // 4. Excel → MongoDB format
    // -----------------------------------------

    const states = rows
      .map((row) => {
        const stateOrUT = String(
          row["State or UT"] || ""
        )
          .trim()
          .toUpperCase();

        let type;

        if (stateOrUT === "S") {
          type = "STATE";
        } else if (stateOrUT === "U") {
          type = "UT";
        }

        return {
          stateCode: Number(
            row["State Code"]
          ),

          stateName: String(
            row["State Name (In English)"] || ""
          ).trim(),

          stateNameLocal: String(
            row["State Name (In Local)"] || ""
          ).trim(),

          stateVersion:
            row["State Version"] !== "" &&
            row["State Version"] != null
              ? Number(row["State Version"])
              : undefined,

          census2001Code:
            row["Census 2001 Code"] !== "" &&
            row["Census 2001 Code"] != null
              ? Number(row["Census 2001 Code"])
              : undefined,

          census2011Code:
            row["Census 2011 Code"] !== "" &&
            row["Census 2011 Code"] != null
              ? Number(row["Census 2011 Code"])
              : undefined,

          type,
        };
      })
      .filter(
        (state) =>
          Number.isFinite(state.stateCode) &&
          state.stateName &&
          ["STATE", "UT"].includes(state.type)
      );

    // -----------------------------------------
    // 5. Validation
    // -----------------------------------------

    if (!states.length) {
      throw new Error(
        "Excel se koi valid State/UT record nahi mila."
      );
    }

    // Duplicate State Code check
    const stateCodes = states.map(
      (state) => state.stateCode
    );

    const uniqueStateCodes = new Set(
      stateCodes
    );

    if (
      stateCodes.length !==
      uniqueStateCodes.size
    ) {
      throw new Error(
        "Excel mein duplicate State Code mila."
      );
    }

    console.log(
      `Valid State/UT records: ${states.length}`
    );

    // -----------------------------------------
    // 6. Delete old data
    // -----------------------------------------

    const deleted = await State.deleteMany({});

    console.log(
      `Old State/UT records deleted: ${deleted.deletedCount}`
    );

    // -----------------------------------------
    // 7. Insert fresh data
    // -----------------------------------------

    const inserted = await State.insertMany(
      states
    );

    console.log(
      `${inserted.length} State/UT records imported successfully.`
    );

    // -----------------------------------------
    // 8. Verification
    // -----------------------------------------

    const totalStates =
      await State.countDocuments({
        type: "STATE",
      });

    const totalUTs =
      await State.countDocuments({
        type: "UT",
      });

    console.log("--------------------------------");
    console.log("STATE IMPORT COMPLETED");
    console.log("--------------------------------");
    console.log(`Total States : ${totalStates}`);
    console.log(`Total UTs    : ${totalUTs}`);
    console.log(
      `Total        : ${totalStates + totalUTs}`
    );
    console.log("--------------------------------");

    process.exit(0);
  } catch (error) {
    console.error(
      "State import failed:",
      error
    );

    process.exit(1);
  }
};

importStates();