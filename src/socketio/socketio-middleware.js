const jwt = require("jsonwebtoken");
const User = require("../models/user");
const getReqHeaderValue = require("../utils/headersExtraction");

const socketAuth = async function (packet, next) {
  const socket = this;
  const token = getReqHeaderValue(socket.handshake, "AuthToken");
  let user;
  if (token) {
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
    try {
      user = await User.findOne({
        _id: decodedPayload._id,
        "tokens.token": token,
      });
    } catch (e) {
      return next(new Error("Server error"));
    }
  }
  if (!user) {
    next(new Error("Unauthorized"));
    setTimeout(() => {
      socket.disconnect(true);
    }, 2000);
  } else {
    next();
  }
};

module.exports = socketAuth;
