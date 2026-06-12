const authService = require("../auth/auth.service");

exports.createAdmin = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Sadece admin yeni admin oluşturabilir"
      });
    }

    const admin = await authService.register({
      ...req.body,
      role: "admin"
    });

    res.status(201).json(admin);
  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
};