const socketio = require("socket.io");
const User = require("../../models/user");

const { addUser, removeUser, getUserBySocketId,
        getSocketId, getOnlineUsers, getUser,
} = require("../../utils/onlineUsers");

const server = require("../../app");
const io = socketio(server);
const socketAuth = require("../socketio-middleware");
const getReqHeaderValue = require("../../utils/headersExtraction");

const { addRequest, getRequesterName, removeRequest,
        getRequest, getGameRequests,
} = require("../../utils/gameRequestsTracking");

const { getTableUsers } = require("../../utils/tabale-management");

const stats = io.of("/stats");

stats.on("connection", (socket) => {
  console.log("New websocket connection");
  socket.use(socketAuth.bind(socket));

  socket.on("login", async (callback) => {
    try {
      const token = getReqHeaderValue(socket.handshake, "AuthToken");
      const userInDb = await User.findOne({ "tokens.token": token });
      const points = userInDb.points;
      const user = addUser(socket.id, userInDb.username, points, false);
      stats.emit(
        "updateLists",
        { users: getOnlineUsers() },
        { users: getTableUsers() }
      );
    } catch (e) {
      callback("Server error");
    }
  });

  socket.on("game start request", (responserName, callback) => {
    let requesterName;
    try {
      if (responserName === getUserBySocketId(socket.id).username) {
        return callback("Sorry, you cannot play against yourself");
      }
      if (getUser(responserName) === undefined) {
        throw new Error( "This user is probably not online,refresh the page to ensure that");
      }
      if (getUser(responserName).isPlaying) {
        return callback( `${responserName}  is currently playing against another player, please try again later`);
      }
      const username = getUserBySocketId(socket.id).username;
      //To avoid sending the same request twice
      if (!getRequest(username)) {
        requesterName = username;
        addRequest(requesterName, responserName);
        stats.to(getSocketId(responserName))
          .emit("game start request", requesterName);
      }
    } catch (e) {
      removeRequest(requesterName);
      callback(e.message);
    }
  });

  socket.on("game start response", (isAccept, callback) => {
    let responserName, requesterName;
    try {
      responserName = getUserBySocketId(socket.id).username;
      requesterName = getRequesterName(responserName);
      if (!isAccept) {
        removeRequest(requesterName);
        stats.to(getSocketId(requesterName))
          .emit(
            "rejected request",
            `${responserName} has rejected your request to start a game`
          );
      } else {
        let requesterSocketId = getSocketId(requesterName);
        // if the requester  disconnect before the responser has replied
        if (!requesterSocketId) {
          throw new Error("Your opponent loged out, you can try to play with someone else");
        }
        stats.to(requesterSocketId)
          .emit("run game", "w")
          .to(getSocketId(responserName))
          .emit("run game", "b");
      }
    } catch (e) {
      removeRequest(responserName);
      callback(e.message);
    }
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    console.log("User disconnected");
    if (user) {
      console.log(user);
      const users = getOnlineUsers();
      stats.emit("updateLists", { users: getOnlineUsers() });
    }
  });
});

module.exports = io;
