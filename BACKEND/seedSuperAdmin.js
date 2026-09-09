require("dotenv").config();

const connectDB = require("./config/db");
const SuperAdmin = require("./models/SuperAdmin");

const createSuperAdmin = async () => {
  try {
    await connectDB();

    const existingSuperAdmin = await SuperAdmin.findOne();

    if (existingSuperAdmin) {
      console.log("Super Admin already exists.");
      process.exit(0);
    }

    const superAdmin = await SuperAdmin.create({
      name: "Super Admin",
      email: "ali78692irfan@gmail.com",
      phone: "9523005636",
      password: "SuperAdmin@123",
    });

    process.exit(0);
  } catch (error) {
    console.error("Error creating Super Admin:", error);
    process.exit(1);
  }
};

createSuperAdmin();