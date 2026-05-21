const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../../config/db");

const register = async ({ full_name, email, password, role = "user" }) => {
  const exists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (exists.rows.length > 0) throw new Error("Bu email zaten kayıtlı");

  const password_hash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES ($1, $2, $3, $4) RETURNING id, full_name, email, role`,
    [full_name, email, password_hash, role]
  );
  return result.rows[0];
};

const login = async ({ email, password }) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  const user = result.rows[0];
  if (!user) throw new Error("Kullanıcı bulunamadı");

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error("Şifre hatalı");

  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
    [user.id, refreshToken, expiresAt]
  );

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, full_name: user.full_name, role: user.role }
  };
};

module.exports = { register, login };
