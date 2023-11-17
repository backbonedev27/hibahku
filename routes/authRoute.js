const express = require("express");
const authController = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");

const authRoute = express.Router();

authRoute.post("/register", authController.register);

authRoute.post("/login", authController.login);

authRoute.post("/logout", verifyToken, authController.logout);

module.exports = authRoute;
