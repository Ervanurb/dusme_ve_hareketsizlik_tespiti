const router = require("express").Router();
const { body } = require("express-validator");
const { register, login } = require("./auth.controller");
const validate = require("../../middleware/validate");

const registerRules = [
  body("full_name").notEmpty().withMessage("İsim zorunlu"),
  body("email").isEmail().withMessage("Geçerli email girin"),
  body("password").isLength({ min: 6 }).withMessage("Şifre en az 6 karakter olmalı"),
];

const loginRules = [
  body("email").isEmail().withMessage("Geçerli email girin"),
  body("password").notEmpty().withMessage("Şifre zorunlu"),
];

router.post("/register", registerRules, validate, register);
router.post("/login", loginRules, validate, login);

module.exports = router;
