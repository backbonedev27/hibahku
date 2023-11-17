const { User } = require("../models");

const roleCheck = async (req, res, next) => {
  const { user } = req;

  if (user && user.roleid !== 1) {
    // Check if user is defined before accessing properties
    return res.status(403).json({
      msg: "Maaf hanya Admin yang bisa mengakses halaman ini!",
    });
  }

  next();
};

module.exports = {
  roleCheck,
};
