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

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ msg: "Password salah" });
    }

    // User is authenticated, generate a JWT token
    const token = jwt.sign({ userId: user.id, nik: user.nik }, secretKey, {
      expiresIn: "24h", // 24 Jam Token Kadaluarsa
    });

    if (user.roleid === 1) {
      return res.status(200).json({
        token,
        role: user?.roleid,
        msg: "Admin login berhasil",
      });
    } else if (user.roleid === 2) {
      return res.status(200).json({
        token,
        role: user?.roleid,
        msg: "User login berhasil",
      });
    } else {
      return res
        .status(200)
        .json({ token, role: user?.roleid, msg: "Login berhasil" });
    }
  } catch (error) {
    console.error(error);
    // res.status(500).json({ msg: "Internal Server Error" });
    return res.status(500).json({ success: false, msg: error.message });
  }
};
