const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const {
  addUserToTable,
  removeUserFromTable,
} = require("../utils/tabale-management");
const checkParallelLogin = require("../utils/parallelLogin");
const router = new express.Router();

//signup
router.post("/users", async (req, res) => {
  const user = new User(req.body);
  user.points = 0;
  try {
    await user.save();
    addUserToTable(user);
    res.status(201).redirect("/signed-up.html");
  } catch (e) {
    let message = e.message.includes("username")
      ? "This username is allready in use, please pick another one, as well make sure the email is valid and uniqe"
      : "One of the  details is invalid. Please make sure  the email is valid and uniqe or the password contains at least 7 characters.";
    res.status(400).render("error", {
      errorStatus: "400",
      errorMessage: message,
    });
  }
});

router.post("/users/login", async (req, res) => {
  try {
    await checkParallelLogin(req);
    const user = await User.findByCredentials(
      req.body.username,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.cookie("AuthToken", token);
    res.redirect("/stats.html");
  } catch (e) {
    res.status(400).render("error", {
      errorStatus: "400",
      errorMessage: e,
    });
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.redirect("/index.html");
  } catch (e) {
    res.status(500).render(
      ("error",
      {
        errorStatus: "500",
        errorMessage: "Internal Server Error",
      })
    );
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    removeUserFromTable(req.user);
  } catch (e) {
    res.status(500).render(
      ("error",
      {
        errorStatus: "500",
        errorMessage: "Internal Server Error",
      })
    );
  }
});

module.exports = router;
