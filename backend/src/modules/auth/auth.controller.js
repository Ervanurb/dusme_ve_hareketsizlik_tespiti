const authService = require("./auth.service");

const register = async (req, res) => {
  try {
    // Güvenlik: role alanı istemciden ALINMAZ; herkes "user" olarak kayıt olur.
    // Admin oluşturma sadece /api/admin/create-admin üzerinden (admin yetkisiyle) yapılır.
    const { full_name, email, password } = req.body;
    const user = await authService.register({ full_name, email, password });
    res.status(201).json({ message: "Kayıt başarılı", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const data = await authService.login(req.body);
    res.json(data);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

const refresh = async (req, res) => {
  try {
    const data = await authService.refresh(req.body);
    res.json(data);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

module.exports = { register, login, refresh };
