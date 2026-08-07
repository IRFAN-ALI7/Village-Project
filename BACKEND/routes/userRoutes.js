const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const upload = require("../middlewares/cloudinaryStorage");
const { 
    registerUser,
     loginUser,
     getProfile,
     getCurrUser,
     updateUsers,
     deleteUsers,
     changePassword,
     forgotPassword,
         } = require("../controllers/userController");

const router = express.Router();
const {protect, userOnly} = require("../middlewares/protect");
const { userValidate } = require("../middlewares/Validation");

router.post(
  "/register",
  upload.single("profileImage"),
  userValidate,
  wrapAsync(registerUser)
);
router.post(
    "/login",
    wrapAsync(loginUser)
 );

//Read route
router.get("/profile",protect, userOnly,wrapAsync(getProfile));

router.get("/me", protect, userOnly,wrapAsync(getCurrUser));

//changePassword
router.put("/change-password",protect,userOnly,wrapAsync(changePassword));

//Update
router.put(
  "/:id",
  protect,
  userOnly,
  upload.single("profileImage"),
  wrapAsync(updateUsers)
);

//Delete
router.delete("/:id",protect, userOnly, wrapAsync(deleteUsers));


router.post("/forgot-password", wrapAsync(forgotPassword));

module.exports = router;
