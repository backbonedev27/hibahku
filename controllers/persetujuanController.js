const {
  Permohonan,
  Ktp,
  Rab,
  Proposal,
  Suket,
  Burek,
  Asetrekom,
  Suratpermohonan,
  Sk,
  Status,
  Keagamaan,
  Kategori,
  User,
  Proses,
} = require("../models");
const { Op } = require("sequelize");

const path = require("path");
const fs = require("fs"); // Module untuk menghapus file

// APPROVAL MERUBAH STATUS
const createPersetujuan = async (req, res) => {
  const { id, newStatus } = req.body;

  try {
    // Cari permohonan berdasarkan ID
    const existingPermohonan = await Permohonan.findByPk(id);

    if (!existingPermohonan) {
      return res.status(404).json({ message: "Permohonan tidak ditemukan" });
    }

    // Lakukan pembaruan status dan keterangan
    existingPermohonan.statusid = newStatus;
    if (newStatus === 2) {
      existingPermohonan.prosesid = 10;
    } else if (newStatus === 1) {
      existingPermohonan.prosesid = 1;
    }

    // Simpan perubahan ke dalam database
    await existingPermohonan.save();

    return res.status(200).json({
      success: true,
      message: "Data permohonan berhasil diperbarui",
      data: existingPermohonan,
    });
  } catch (error) {
    console.error("Error:", error);

    // Catat pesan kesalahan ke dalam log
    // Sebaiknya disesuaikan dengan cara Anda melakukan logging
    // Contoh penggunaan log:
    // logger.error('Gagal memperbarui data permohonan', error);

    return res
      .status(500)
      .json({ message: "Gagal memperbarui data permohonan" });
  }
};

const allPersetujuan = async (req, res) => {
  const page = parseInt(req?.query?.page) || 0;
  const limit = parseInt(req?.query?.limit) || 10;
  const search = req?.query?.keagamaanid || "";

  const offset = limit * page;

  const totalRows = await Permohonan.count({
    where: {
      keagamaanid: {
        [Op.like]: `%${search}%`,
      },
    },
  });

  const totalPage = Math.ceil(totalRows / limit);

  try {
    const data = await Permohonan.findAll({
      where: {
        keagamaanid: {
          [Op.like]: `%${search}%`,
        },
      },
      include: [
        { model: User, as: "User", attributes: ["nama", "notelpon"] },
        {
          model: Keagamaan,
          as: "Keagamaan",
          attributes: ["nama", "wilayah", "alamat"],
          include: [
            {
              model: Kategori,
              as: "Kategori",
              attributes: ["id", "nama"],
            },
          ],
        },
        {
          model: Status,
          as: "Status",
          attributes: ["id", "nama"],
        },
        {
          model: Proses,
          as: "Proses",
          attributes: ["id", "nama", "keterangan"],
        },
        { model: Ktp, as: "Ktp", attributes: ["namafile"] },
        { model: Suket, as: "Suket", attributes: ["namafile"] },
        {
          model: Suratpermohonan,
          as: "Suratpermohonan",
          attributes: ["namafile"],
        },
        { model: Sk, as: "Sk", attributes: ["namafile"] },
        { model: Proposal, as: "Proposal", attributes: ["namafile"] },
        { model: Burek, as: "Burek", attributes: ["namafile"] },
        { model: Asetrekom, as: "Asetrekom", attributes: ["namafile"] },
        { model: Rab, as: "Rab", attributes: ["namafile"] },
      ],
      offset: offset,
      limit: limit,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: data,
      page: page + 1,
      limit: limit,
      totalItems: totalRows,
      totalPage: totalPage,
      hasMore: data.length >= limit ? true : false,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat data Rumah Ibadah",
    });
  }
};

//MENAMPILKAN PERMOHONAN BY ID
const detailPersetujuan = async (req, res) => {
  const permohonanId = req?.params?.id;

  try {
    const permohonan = await Permohonan.findByPk(permohonanId, {
      include: [
        { model: User, as: "User", attributes: ["nama", "notelpon"] },
        {
          model: Keagamaan,
          as: "Keagamaan",
          attributes: ["nama", "wilayah", "alamat"],
          include: [
            {
              model: Kategori,
              as: "Kategori",
              attributes: ["id", "nama"],
            },
          ],
        },
        {
          model: Status,
          as: "Status",
          attributes: ["id", "nama"],
        },
        {
          model: Proses,
          as: "Proses",
          attributes: ["id", "nama", "keterangan"],
        },
        { model: Ktp, as: "Ktp", attributes: ["namafile"] },
        { model: Suket, as: "Suket", attributes: ["namafile"] },
        {
          model: Suratpermohonan,
          as: "Suratpermohonan",
          attributes: ["namafile"],
        },
        { model: Sk, as: "Sk", attributes: ["namafile"] },
        { model: Proposal, as: "Proposal", attributes: ["namafile"] },
        { model: Burek, as: "Burek", attributes: ["namafile"] },
        { model: Asetrekom, as: "Asetrekom", attributes: ["namafile"] },
        { model: Rab, as: "Rab", attributes: ["namafile"] },

        // Pastikan semua entitas terkait telah didefinisikan dengan benar di model Anda
        // Ganti entitas "Status", "Keagamaan", dan lainnya dengan nama entitas yang benar jika tidak sesuai
      ],
    });

    if (!permohonan) {
      return res
        .status(404)
        .json({ message: "Data Permohonan Tidak Ditemukan" });
    }

    // Konversi objek Sequelize ke JSON dan buat salinan objek
    permohonans = JSON.parse(JSON.stringify(permohonan));

    // Hapus properti yang tidak diinginkan
    delete permohonans.userid;
    delete permohonans.skid;
    delete permohonans.ktpid;
    delete permohonans.suratpermohonanid;
    delete permohonans.asetrekomid;
    delete permohonans.suketid;
    delete permohonans.burekid;
    delete permohonans.proposalid;
    delete permohonans.rabid;
    delete permohonans.statusid;
    delete permohonans.keagamaanid;

    return res.status(200).json({ success: true, data: permohonans });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Gagal memuat detail permohonan" });
  }
};

//DOWNLOAD FILE
const downloadfile = (req, res) => {
  const fileName = req.params.fileName;
  const directoryPath = "public/uploads/"; // Sesuaikan dengan direktori penyimpanan Anda

  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Gagal mendownload file." + err,
      });
    }
  });
};

//HAPUS PERSETUJUAN
const deleteFile = async (fileId, filePath) => {
  try {
    // Check if the file exists
    await fs.promises.access(filePath, fs.constants.F_OK);

    // If the file exists, proceed with deletion
    await fs.promises.unlink(filePath);
    console.log(`File deleted: ${filePath}`);
  } catch (error) {
    if (error.code === "ENOENT") {
      // The file doesn't exist; log a message or handle it as needed
      console.log(`File not found: ${filePath}`);
    } else {
      // Other errors; log and propagate the error
      console.error("Error deleting file:", error);
      throw error;
    }
  }
};

const deleteRelatedFiles = async (deletedPermohonan) => {
  const fileFields = [
    "skid",
    "ktpid",
    "suratpermohonanid",
    "asetrekomid",
    "suketid",
    "burekid",
    "proposalid",
    "rabid",
  ];

  for (const field of fileFields) {
    const fileId = deletedPermohonan.getDataValue(field);

    if (fileId) {
      const fileModel = getModelForField(field); // Function to get the Sequelize model based on the field
      const file = await fileModel.findByPk(fileId);

      if (file) {
        await deleteFile(fileId, file.path);
      }
    }
  }

  // Additional code to delete KTP file and entry
  const ktpId = deletedPermohonan.getDataValue("ktpid");
  if (ktpId) {
    const ktp = await Ktp.findByPk(ktpId);

    if (ktp) {
      await deleteFile(ktpId, ktp.path);
      await ktp.destroy();
    }
  }
  const skId = deletedPermohonan.getDataValue("skid");
  if (skId) {
    const sk = await Sk.findByPk(skId); // Change ktpId to skId

    if (sk) {
      await deleteFile(skId, sk.path);
      await sk.destroy();
    }
  }

  const burekId = deletedPermohonan.getDataValue("burekid");
  if (burekId) {
    const burek = await Burek.findByPk(burekId);

    if (burek) {
      await deleteFile(burekId, burek.path);
      await burek.destroy();
    }
  }

  const asetrekomId = deletedPermohonan.getDataValue("asetrekomid");
  if (asetrekomId) {
    const asetrekom = await Asetrekom.findByPk(asetrekomId);

    if (asetrekom) {
      await deleteFile(asetrekomId, asetrekom.path);
      await asetrekom.destroy();
    }
  }

  const proposalId = deletedPermohonan.getDataValue("proposalid");
  if (proposalId) {
    const proposal = await Proposal.findByPk(proposalId);

    if (proposal) {
      await deleteFile(proposalId, proposal.path);
      await proposal.destroy();
    }
  }

  const rabId = deletedPermohonan.getDataValue("rabid");
  if (rabId) {
    const rab = await Rab.findByPk(rabId);

    if (rab) {
      await deleteFile(rabId, rab.path);
      await rab.destroy();
    }
  }

  const suratpermohonanId = deletedPermohonan.getDataValue("suratpermohonanid");
  if (suratpermohonanId) {
    const suratpermohonan = await Suratpermohonan.findByPk(suratpermohonanId);

    if (suratpermohonan) {
      await deleteFile(suratpermohonanId, suratpermohonan.path);
      await suratpermohonan.destroy();
    }
  }

  const suketId = deletedPermohonan.getDataValue("suketid");
  if (suketId) {
    const suket = await Suket.findByPk(suketId);

    if (suket) {
      await deleteFile(suketId, suket.path);
      await suket.destroy();
    }
  }
};

const getModelForField = (field) => {
  switch (field) {
    case "skid":
      return Sk;
    case "ktpid":
      return Ktp;
    case "suratpermohonanid":
      return Suratpermohonan;
    case "asetrekomid":
      return Asetrekom;
    case "suketid":
      return Suket;
    case "burekid":
      return Burek;
    case "proposalid":
      return Proposal;
    case "rabid":
      return Rab;
    default:
      throw new Error("Invalid field name");
  }
};

const hapusPersetujuan = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPermohonan = await Permohonan.findByPk(id);

    if (!deletedPermohonan) {
      return res
        .status(404)
        .json({ message: "Data permohonan tidak ditemukan" });
    }

    await deleteRelatedFiles(deletedPermohonan);

    await deletedPermohonan.destroy();

    return res.status(200).json({
      message: "Data permohonan dan file-file terkait berhasil dihapus",
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Gagal menghapus data permohonan" });
  }
};

module.exports = {
  createPersetujuan,
  allPersetujuan,
  detailPersetujuan,
  hapusPersetujuan,
  downloadfile,
};
