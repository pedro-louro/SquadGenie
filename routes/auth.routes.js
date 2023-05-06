const router = require("express").Router();
const User = require("../models/User.model");
const bcrypt = require("bcryptjs");

router.get("/signup", (req, res) => {
    res.render("auth/signup");
});

router.get("/login", (req, res) => {
    res.render("auth/login");
});

module.exports = router;