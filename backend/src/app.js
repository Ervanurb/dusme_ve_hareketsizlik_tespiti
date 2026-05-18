const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Düşme ve Hareketsizlik Tespiti API çalışıyor",
  });
});

module.exports = app;