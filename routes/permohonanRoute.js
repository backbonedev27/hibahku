const express = require("express");
const path = require("path");
const permohonanController = require("../controllers/permohonanController");
const verifyToken = require("../middleware/verifyToken");
const multer = require("multer");
const bodyparser = require("body-parser");
const fs = require("fs");

const permohonanRoute = express();

permohonanRoute.use(bodyparser.json());
permohonanRoute.use(bodyparser.urlencoded({ extended: true }));
permohonanRoute.use(express.static("public"));

const deleteUploadedFiles = async (files) => {
  files.forEach(async (file) => {
    if (file && file.length > 0) {
      const filePath = file[0].path;
      try {
        fs.unlinkSync(filePath); // Delete the file
      } catch (err) {
        console.error("Error deleting file:", err);
      }
    }
  });
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/"); // Set the directory for uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueFileName =
      file.fieldname +
      "-" +
      Date.now() +
      "." +
      file.originalname.split(".").pop();
    cb(null, uniqueFileName); // Set the filename for the uploaded file
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== "application/pdf") {
    req.pdfUploadError = "Hanya bisa upload file PDF";
    cb(null, false);
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 10, // File size limit (10MB)
  },
}).fields([
  { name: "file_ktp" },
  { name: "file_rab" },
  { name: "file_proposal" },
  { name: "file_suket" },
  { name: "file_burek" },
  { name: "file_asetrekom" },
  { name: "file_suratpermohonan" },
  { name: "file_sk" },
]);

// Setting up the route to handle POST requests
permohonanRoute.post(
  "/uploads",
  upload,

  verifyToken,
  permohonanController.permohonan
);

module.exports = permohonanRoute;
