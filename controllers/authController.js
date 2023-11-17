const { User, Periode } = require("../models");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
// const config = require("../config/config.json");
// const secretKey = config.development.secretKey;

const dotenv = require("dotenv");
dotenv.config();

const secretKey = process.env.SECRET_KEY;

const register = async (req, res) => {
  const securePassword = async (password) => {
    try {
      const salt = await bcryptjs.genSalt(10);
      const passwordHash = await bcryptjs.hash(password, salt);
      return passwordHash;
    } catch (error) {
      throw new Error("Failed to hash the password");
    }
  };

  try {
    const nik = parseInt(req?.body?.nik, 10); // Parse the input to an integer

    if (isNaN(nik)) {
      return res.status(400).json({
        success: false,
        msg: "NIK harus angka.",
      });
    } else {
      const nikStr = nik.toString(); // Convert it back to a string
      if (nikStr.length < 16) {
        return res.status(400).json({
          success: false,
          msg: "NIK terlalu pendek. Minimal 16 angka.",
        });
      } else if (nikStr.length > 16) {
        return res.status(400).json({
          success: false,
          msg: "NIK terlalu panjang. Maksimal 16 Angka",
        });
      }
    }

    if (
      !req.body.nik ||
      !req.body.nama ||
      !req.body.notelpon ||
      !req.body.password
    ) {
      return res.status(400).json({
        success: false,
        msg: "Harap mengisi form yang kosong!",
      });
    }

    const spassword = await securePassword(req?.body?.password);

    const existingUser = await User.findOne({
      where: { nik: nik }, // Use the parsed 'nik' for lookup
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, msg: "NIK Sudah digunakan." });
    }

    // Create a new User instance with id equal to nik
    const user = new User({
      id: nik, // Set id to the parsed 'nik' value
      nama: req?.body?.nama,
      nik: nik, // Set nik to the parsed 'nik' value
      notelpon: req?.body?.notelpon,
      password: spassword,
      roleid: 2, // Set roleid to 2 (or as required)
    });

    //save user to database
    const newUser = await user.save();

    return res.status(201).json({
      success: true,
      msg: "Register berhasil",
      data: newUser,
    });
  } catch (error) {
    return res.status(500).json({ success: false, msg: error.message });
  }
};

const login = async (req, res) => {
  const { nik, password } = req.body;

  if (!nik || !password) {
    return res
      .status(400)
      .json({ msg: "NIK atau password tidak boleh kosong" });
  }

  try {
    // Check if the user with the provided NIK exists in the database
    const user = await User.findOne({ where: { nik } });

    if (!user) {
      return res.status(404).json({ msg: "NIK tidak terdaftar!" });
    }

    const currentDate = new Date(); // Move this line here

    // Find the corresponding periode for the user's roleid
    const periode = await Periode.findOne({
      where: { roleid: user.roleid },
    });

    const notActivePeriod = await Periode.findOne({
      where: {
        mulai: { [Op.lte]: currentDate },
        selesai: { [Op.gte]: currentDate },
      },
    });

    if (notActivePeriod) {
      const options = { day: "numeric", month: "long", year: "numeric" };

      const formattedMulai = notActivePeriod.mulai.toLocaleDateString(
        "id-ID",
        options
      );
      const formattedSelesai = notActivePeriod.selesai.toLocaleDateString(
        "id-ID",
        options
      );

      console.log(
        `Akses ditutup mulai dari ${formattedMulai} sampai ${formattedSelesai}`
      );
    } else {
      console.log("No active period found.");
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ msg: "Password salah" });
    }

    if (user.roleid === 1) {
      // Admin login
      console.log("Admin login within the all period");

      const token = jwt.sign({ userId: user.id, nik: user.nik }, secretKey, {
        expiresIn: "24h",
      });

      return res.status(200).json({
        token,
        role: user?.roleid,
        msg: "Admin login berhasil",
      });
    } else if (user.roleid === 2 && !notActivePeriod) {
      // Regular User login outside the active period
      const token = jwt.sign({ userId: user.id, nik: user.nik }, secretKey, {
        expiresIn: "24h",
      });
      return res.status(200).json({
        token,
        role: user?.roleid,
        msg: "User login berhasil",
      });
    } else if (
      user.roleid === 2 &&
      (notActivePeriod ||
        currentDate < notActivePeriod.mulai ||
        currentDate > notActivePeriod.selesai)
    ) {
      const { mulai, selesai } = notActivePeriod;

      // Format the dates using toLocaleDateString
      const formattedMulai = mulai.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const formattedSelesai = selesai.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      return res.status(401).json({
        msg: `Akses ditutup mulai dari ${formattedMulai} sampai ${formattedSelesai}`,
      });
    } else {
      // No conditions matched
      console.log("No conditions matched");

      return res.status(401).json({
        msg: "Silahkan hubungi admin perihal ini",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

const logout = (req, res) => {
  // Tanggapi permintaan logout dengan respons status 200 OK
  res.status(200).json({ msg: "Logout successful" });
};

module.exports = { register, login, logout };
