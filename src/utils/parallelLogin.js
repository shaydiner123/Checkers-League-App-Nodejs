const User = require("../models/user");
const { isOnlineUser } = require("./onlineUsers");
const getReqHeaderValue = require("./headersExtraction");

const checkParallelLogin = async (req) => {
  //checke parallel login, from the same account
  if (isOnlineUser(req.body.username)) {
    throw new Error(
      "You allready loged-in with this account , you cannot log in twice from same account"
    );
  }
  //check parallel login from another account in same browser
  else {
    let user;
    const token = getReqHeaderValue(req, "AuthToken");
    if (token) {
      user = await User.findOne({ "tokens.token": token });
      if (user && isOnlineUser(user.username)) {
        throw new Error(
          `You are allready loged in with ${user.username} username in other tab, please log out first! or try to log in
          in another browser.`
        );
      }
    }
  }
};

module.exports = checkParallelLogin;
