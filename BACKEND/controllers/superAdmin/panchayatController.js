const Panchayat = require("../../models/locations/Panchayat");
const PanchayatVillage = require("../../models/locations/PanchayatVillage");
const SubDistrict = require("../../models/locations/SubDistrict");
const District = require("../../models/locations/District");
const State = require("../../models/locations/State");
const Admin = require("../../models/Admin");


// GET ALL PANCHAYATS
const getAllPanchayats = async (req, res) => {
  try {
    const {
      search = "",
      district = "",
      subDistrict = "",
      assigned = "",
    } = req.query;

    
    // Find Jharkhand from database
    const state = await State.findOne({
      stateName: /^Jharkhand$/i,
    })
      .select("stateCode stateName")
      .lean();

    if (!state) {
      return res.status(404).json({
        success: false,
        message: "Jharkhand state not found",
      });
    }

  
    // Get all Panchayats of this state
    const panchayats = await Panchayat.find({
      stateCode: state.stateCode,
    })
      .select(
        "stateCode districtCode panchayatCode panchayatName"
      )
      .sort({ panchayatName: 1 })
      .lean();

    if (!panchayats.length) {
      return res.status(200).json({
        success: true,
        count: 0,
        summary: {
          total: 0,
          assigned: 0,
          unassigned: 0,
        },
        data: [],
      });
    }

   
    // Get Panchayat -> SubDistrict mappings
    const panchayatCodes = panchayats.map(
      (panchayat) => panchayat.panchayatCode
    );

    const mappings = await PanchayatVillage.find({
      panchayatCode: {
        $in: panchayatCodes,
      },
    })
      .select(
        "panchayatCode subDistrictCode"
      )
      .lean();

    
    // Create Panchayat -> SubDistrict map
    const panchayatSubDistrictMap =
      new Map();

    for (const mapping of mappings) {
      if (
        mapping.panchayatCode == null ||
        mapping.subDistrictCode == null
      ) {
        continue;
      }

      if (
        !panchayatSubDistrictMap.has(
          mapping.panchayatCode
        )
      ) {
        panchayatSubDistrictMap.set(
          mapping.panchayatCode,
          mapping.subDistrictCode
        );
      }
    }


    // Get all SubDistricts
    const subDistrictCodes = [
      ...new Set(
        mappings
          .map(
            (mapping) =>
              mapping.subDistrictCode
          )
          .filter(
            (code) => code != null
          )
      ),
    ];

    const subDistricts =
      subDistrictCodes.length
        ? await SubDistrict.find({
            subDistrictCode: {
              $in: subDistrictCodes,
            },
          })
            .select(
              "stateCode districtCode subDistrictCode subDistrictName"
            )
            .lean()
        : [];


    // SubDistrict map
    const subDistrictMap = new Map();

    for (const subDistrict of subDistricts) {
      subDistrictMap.set(
        subDistrict.subDistrictCode,
        subDistrict
      );
    }

    // Get Districts
    const districtCodes = [
      ...new Set(
        subDistricts
          .map(
            (subDistrict) =>
              subDistrict.districtCode
          )
          .filter(
            (code) => code != null
          )
      ),
    ];

    // Also include districtCode directly
    // available in Panchayat documents
    for (const panchayat of panchayats) {
      if (panchayat.districtCode != null) {
        districtCodes.push(
          panchayat.districtCode
        );
      }
    }

    const uniqueDistrictCodes = [
      ...new Set(districtCodes),
    ];

    const districts =
      uniqueDistrictCodes.length
        ? await District.find({
            districtCode: {
              $in: uniqueDistrictCodes,
            },
          })
            .select(
              "stateCode districtCode districtName"
            )
            .lean()
        : [];

   
    // District map
    const districtMap = new Map();

    for (const district of districts) {
      districtMap.set(
        district.districtCode,
        district
      );
    }

    // Get Admins of this state
    const admins = await Admin.find({
      stateCode: state.stateCode,
    })
      .select(
        "_id name email phone profilePhoto stateCode districtCode subDistrictCode panchayatCode status"
      )
      .lean();

   
    // Admin map by exact Panchayat code
    const adminMap = new Map();

    for (const admin of admins) {
      if (admin.panchayatCode == null) {
        continue;
      }


      // One Panchayat = one assigned Admin
      if (
        !adminMap.has(admin.panchayatCode)
      ) {
        adminMap.set(
          admin.panchayatCode,
          admin
        );
      }
    }

    // Build final rows
    const rows = [];

    for (const panchayat of panchayats) {
      const panchayatCode =
        panchayat.panchayatCode;

      // Find SubDistrict
      const subDistrictCode =
        panchayatSubDistrictMap.get(
          panchayatCode
        );

      const subDistrict =
        subDistrictCode != null
          ? subDistrictMap.get(
              subDistrictCode
            )
          : null;

      // IMPORTANT:
      // Some old Panchayat documents may not
      // have districtCode.
      // So first use Panchayat.districtCode.
      // If missing, use SubDistrict.districtCode.

      const districtCode =
        panchayat.districtCode ??
        subDistrict?.districtCode ??
        null;

      const district =
        districtCode != null
          ? districtMap.get(districtCode)
          : null;

      // Assigned Admin
      const admin =
        adminMap.get(panchayatCode) ||
        null;

      rows.push({
        id: String(panchayatCode),

        state: state.stateName,
        stateCode: panchayat.stateCode,

        district:
          district?.districtName || "",

        districtCode: districtCode,

        subDistrict:
          subDistrict?.subDistrictName || "",

        subDistrictCode:
          subDistrictCode || null,

        panchayat:
          panchayat.panchayatName,

        panchayatCode:
          panchayat.panchayatCode,

        admin: admin
          ? {
              id: String(admin._id),
              name: admin.name,
              email: admin.email,
              phone: admin.phone,
              profilePhoto:
                admin.profilePhoto || "",
              status: admin.status,
            }
          : null,
      });
    }


    // FILTERS
    let filteredRows = rows;


    // Search
    const searchText =
      search.trim().toLowerCase();

    if (searchText) {
      filteredRows =
        filteredRows.filter((row) => {
          return (
            row.panchayat
              ?.toLowerCase()
              .includes(searchText) ||

            row.district
              ?.toLowerCase()
              .includes(searchText) ||

            row.subDistrict
              ?.toLowerCase()
              .includes(searchText) ||

            row.admin?.name
              ?.toLowerCase()
              .includes(searchText) ||

            row.admin?.email
              ?.toLowerCase()
              .includes(searchText)
          );
        });
    }

  
    // District filter
    if (district) {
      filteredRows =
        filteredRows.filter(
          (row) =>
            row.district === district
        );
    }

  
    // SubDistrict filter
    if (subDistrict) {
      filteredRows =
        filteredRows.filter(
          (row) =>
            row.subDistrict ===
            subDistrict
        );
    }

  
    // Assigned filter
    if (assigned === "assigned") {
      filteredRows =
        filteredRows.filter(
          (row) => row.admin !== null
        );
    }

    if (assigned === "unassigned") {
      filteredRows =
        filteredRows.filter(
          (row) => row.admin === null
        );
    }


    // SUMMARY
    const assignedCount =
      rows.filter(
        (row) => row.admin !== null
      ).length;

    const unassignedCount =
      rows.length - assignedCount;


    // RESPONSE
    return res.status(200).json({
      success: true,

      count: filteredRows.length,

      summary: {
        total: rows.length,
        assigned: assignedCount,
        unassigned: unassignedCount,
      },

      data: filteredRows,
    });
  } catch (error) {
    console.error(
      "Get all Panchayats error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch Panchayats",
      error: error.message,
    });
  }
};

// GET PANCHAYAT BY CODE
const getPanchayatByCode = async (
  req,
  res
) => {
  try {
    const { panchayatCode } =
      req.params;

 
    // Convert URL parameter to Number
    const code = Number(
      panchayatCode
    );

    if (!Number.isInteger(code)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Panchayat code",
      });
    }

    // Find Panchayat
    const panchayat =
      await Panchayat.findOne({
        panchayatCode: code,
      })
        .select(
          "stateCode districtCode panchayatCode panchayatName"
        )
        .lean();

    if (!panchayat) {
      return res.status(404).json({
        success: false,
        message:
          "Panchayat not found",
      });
    }


    // Find Panchayat -> SubDistrict mapping
    const mapping =
      await PanchayatVillage.findOne({
        panchayatCode: code,
      })
        .select(
          "panchayatCode subDistrictCode"
        )
        .lean();

    if (!mapping) {
      return res.status(404).json({
        success: false,
        message:
          "Sub-district mapping not found for this Panchayat",
      });
    }

    // Find SubDistrict
    const subDistrict =
      await SubDistrict.findOne({
        subDistrictCode:
          mapping.subDistrictCode,
      })
        .select(
          "stateCode districtCode subDistrictCode subDistrictName"
        )
        .lean();

    if (!subDistrict) {
      return res.status(404).json({
        success: false,
        message:
          "Sub-district not found",
      });
    }

    // District Code
    const districtCode =
      panchayat.districtCode ??
      subDistrict.districtCode ??
      null;

    // Find District
    let district = null;

    if (districtCode != null) {
      district =
        await District.findOne({
          districtCode:
            districtCode,
        })
          .select(
            "stateCode districtCode districtName"
          )
          .lean();
    }

    if (!district) {
      return res.status(404).json({
        success: false,
        message:
          "District not found",
      });
    }


    // Find assigned Admin
    const admin =
      await Admin.findOne({
        stateCode:
          panchayat.stateCode,

        districtCode:
          district.districtCode,

        subDistrictCode:
          subDistrict.subDistrictCode,

        panchayatCode:
          panchayat.panchayatCode,
      })
        .select(
          "_id name email phone profilePhoto status stateCode districtCode subDistrictCode panchayatCode"
        )
        .lean();

    // FINAL RESPONSE
    return res.status(200).json({
      success: true,

      data: {
        id: String(
          panchayat.panchayatCode
        ),

        state:
          "Jharkhand",

        stateCode:
          panchayat.stateCode,

        district:
          district.districtName,

        districtCode:
          district.districtCode,

        subDistrict:
          subDistrict.subDistrictName,

        subDistrictCode:
          subDistrict.subDistrictCode,

        panchayat:
          panchayat.panchayatName,

        panchayatCode:
          panchayat.panchayatCode,

        admin: admin
          ? {
              id: String(admin._id),
              name: admin.name,
              email: admin.email,
              phone: admin.phone,
              profilePhoto:
                admin.profilePhoto || "",
              status: admin.status,
            }
          : null,
      },
    });
  } catch (error) {
    console.error(
      "Get Panchayat details error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch Panchayat details",
      error: error.message,
    });
  }
};

// EXPORTS
module.exports = {
  getAllPanchayats,
  getPanchayatByCode,
};