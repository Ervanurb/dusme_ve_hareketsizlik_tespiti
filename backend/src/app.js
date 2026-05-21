const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./modules/auth/auth.routes");
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Düşme ve Hareketsizlik Tespiti API çalışıyor",
  });
});
const authGuard = require("./middleware/auth");

app.get("/api/korumali-veri", authGuard, (req, res) => {
  res.json({ 
    message: "Tebrikler! Güvenlik duvarını aştın.", 
    kullanici_bilgileri: req.user 
  });
});
module.exports = app;
