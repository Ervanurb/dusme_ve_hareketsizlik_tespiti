const app = require("./src/app");
const pool = require("./src/config/db");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await pool.query("SELECT NOW()");
    console.log("PostgreSQL bağlantısı başarılı");

    app.listen(PORT, () => {
      console.log(`Sunucu ${PORT} portunda çalışıyor`);
    });
  } catch (error) {
    console.error("Veritabanı bağlantı hatası:", error.message);
  }
}

startServer();