const { Op } = require("sequelize");
const { Periode } = require("../models");

const periodeCheck = async (req, res, next) => {
  try {
    const { user } = req.session;

    // Log the user's roleid to the console
    console.log("User:", user);
    console.log("User Role ID:", user ? user.roleid : "Undefined");

    const currentDate = new Date();

    const notActivePeriod = await Periode.findOne({
      where: {
        mulai: { [Op.lte]: currentDate },
        selesai: { [Op.gte]: currentDate },
      },
    });

    if (notActivePeriod && user && user.roleid === 1) {
      const { selesai } = notActivePeriod;

      return res.status(403).json({
        message: `Mohon Maaf, Akses Ditutup hingga ${selesai}. Silakan coba lagi nanti.`,
      });
    }

    next();
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat memeriksa periode." });
  }
};

module.exports = periodeCheck;
