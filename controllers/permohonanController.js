const {
  Keagamaan,
  Permohonan,
  Ktp,
  Proposal,
  Asetrekom,
  Burek,
  Rab,
  Sk,
  Suket,
  Suratpermohonan,
} = require("../models");
const fs = require("fs");

// Fungsi untuk menyimpan file
const saveFile = async (file, Model) => {
  try {
    if (file && file.length > 0) {
      const fileData = new Model({
        namafile: file[0].filename,
        size: file[0].size,
        path: file[0].path,
      });
      const saved = await fileData.save();

      console.log("Saved File Data:", saved);

      return saved || null; // Mengembalikan null jika penyimpanan gagal
    }
  } catch (error) {
    console.error("Error saving file:", error);
    return null;
  }
};

// Fungsi untuk menghapus file terunggah
const deleteUploadedFiles = async (files) => {
  files.forEach(async (file) => {
    if (file && file.length > 0) {
      const filePath = file[0].path;
      try {
        fs.unlinkSync(filePath); // Menghapus file
      } catch (err) {
        console.error("Error deleting file:", err);
      }
    }
  });
};

const permohonan = async (req, res) => {
  const { body, files, user } = req;

  const {
    file_ktp,
    file_rab,
    file_suket,
    file_burek,
    file_sk,
    file_suratpermohonan,
    file_asetrekom,
    file_proposal,
  } = files;

  const keagamaanID = body.keagamaanid;
  const existingKeagamaan = await Keagamaan.findByPk(keagamaanID);

  if (!existingKeagamaan) {
    await deleteUploadedFiles([
      file_ktp,
      file_rab,
      file_suket,
      file_burek,
      file_sk,
      file_proposal,
      file_suratpermohonan,
      file_asetrekom,
    ]);
    return res.status(404).json({ message: "ID agama tidak terdaftar" });
  }

  const existingPermohonan = await Permohonan.findOne({
    where: { keagamaanid: keagamaanID },
    order: [["createdAt", "DESC"]],
  });

  if (existingPermohonan) {
    const currentDate = new Date();
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(currentDate.getFullYear() - 2);

    if (existingPermohonan.createdAt > twoYearsAgo) {
      await deleteUploadedFiles([
        file_ktp,
        file_rab,
        file_suket,
        file_burek,
        file_sk,
        file_proposal,
        file_suratpermohonan,
        file_asetrekom,
      ]);
      return res.status(403).json({
        message:
          "ID agama telah digunakan dalam permohonan dalam dua tahun terakhir. Silakan coba lagi setelah 2 tahun.",
      });
    }
  }

  try {
    const savedFiles = await Promise.all([
      saveFile(file_ktp, Ktp),
      saveFile(file_rab, Rab),
      saveFile(file_suket, Suket),
      saveFile(file_burek, Burek),
      saveFile(file_sk, Sk),
      saveFile(file_proposal, Proposal),
      saveFile(file_suratpermohonan, Suratpermohonan),
      saveFile(file_asetrekom, Asetrekom),
    ]);
    console.log("Saved Files:", savedFiles);

    const permohonanData = new Permohonan({
      keagamaanid: body.keagamaanid,
      pengajuandana: body.pengajuandana,
      tujuan: body.tujuan,
      norek: body.norek,
      statusid: 1,
      ktpid: savedFiles[0].id,
      rabid: savedFiles[1].id,
      suketid: savedFiles[2].id,
      burekid: savedFiles[3].id,
      skid: savedFiles[4].id,
      suratpermohonanid: savedFiles[5].id,
      asetrekomid: savedFiles[6].id,
      proposalid: savedFiles[7].id,
      prosesid: 3,
      userid: user.nik,
    });
    console.log("Permohonan Data:", permohonanData);
    await permohonanData.save();

    return res.status(201).json({ message: "Permohonan berhasil" });
  } catch (error) {
    // If an error occurs during the database save, delete the uploaded files
    await deleteUploadedFiles([
      file_ktp,
      file_rab,
      file_suket,
      file_burek,
      file_sk,
      file_proposal,
      file_suratpermohonan,
      file_asetrekom,
    ]);
    return res.status(500).json({ message: "Gagal menyimpan file" });
  }
};

module.exports = {
  permohonan,
};
