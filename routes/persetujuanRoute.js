const express = require("express");

const persetujuanController = require("../controllers/persetujuanController");
const verifyToken = require("../middleware/verifyToken");
const { roleCheck } = require("../middleware/roleCheck");

const persetujuanRoute = express.Router();

persetujuanRoute.get(
  "/list",
  verifyToken,
  roleCheck,
  persetujuanController.allPersetujuan
);

persetujuanRoute.post(
  "/approve/:id",
  verifyToken,
  roleCheck,
  persetujuanController.createPersetujuan
);

persetujuanRoute.get(
  "/detail/:id",
  verifyToken,
  roleCheck,
  persetujuanController.detailPersetujuan
);

persetujuanRoute.get(
  "/download/:fileName",
  verifyToken,
  roleCheck,
  persetujuanController.downloadfile
);

persetujuanRoute.delete(
  "/:id",
  verifyToken,
  roleCheck,
  persetujuanController.hapusPersetujuan
);

module.exports = persetujuanRoute;
