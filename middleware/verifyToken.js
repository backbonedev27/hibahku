const jwt = require("jsonwebtoken");
const { User } = require("../models");
// const config = require("../config/config.json");
// const secretKey = config.development.secretKey;

const dotenv = require("dotenv");
dotenv.config();

const secretKey = process.env.SECRET_KEY;

const verifyToken = async (req, res, next) => {
  const token = req?.headers?.authorization;

  if (!token) {
    return res.status(401).json({
      message: "Anda Harus login!",
    });
  }

  const jwtToken = token.split(" ").pop();

  try {
    const data = jwt.verify(jwtToken, secretKey);

    const user = await User.findByPk(data.userId); // Ensure correct user identifier

    if (!user) {
      return res.status(404).json({
        message: "User Tidak ditemukan!",
      });
    }
    req.user = user;

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      message: "Not Authorized!",
    });
  }
};

module.exports = verifyToken;
