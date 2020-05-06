const jwt = require("jsonwebtoken");
const User = require("../models/user");
const getReqHeaderValue = require("../utils/headersExtraction");

const auth = async (req, res, next) => {
  try {
    const token = getReqHeaderValue(req, "AuthToken");
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decodedPayload._id,
      "tokens.token": token,
    });
    if (!user) {
      throw new Error();
    }
    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).render("error", {
      errorStatus: "401",
      errorMessage: "You are not authorized",
    });
  }
};

module.exports = auth;
