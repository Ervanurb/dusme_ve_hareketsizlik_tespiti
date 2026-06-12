const bcrypt = require("bcrypt");
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

// Refresh token ile yeni access token üretir.
// Token hem imza olarak doğrulanır hem de veritabanındaki kayıtla eşleştirilir.
const refresh = async ({ refreshToken }) => {
  if (!refreshToken) throw new Error("Refresh token gerekli");

  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new Error("Geçersiz veya süresi dolmuş refresh token");
  }

  const stored = await pool.query(
    `SELECT id FROM refresh_tokens WHERE user_id=$1 AND token=$2 AND expires_at > NOW() LIMIT 1`,
    [payload.id, refreshToken]
  );
  if (stored.rows.length === 0) throw new Error("Refresh token bulunamadı veya süresi dolmuş");

  const result = await pool.query("SELECT id, full_name, role FROM users WHERE id = $1", [payload.id]);
  const user = result.rows[0];
  if (!user) throw new Error("Kullanıcı bulunamadı");

  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return { accessToken, user };
};

module.exports = { register, login, refresh };
