const User = require("../../models/user");

const { addUser, removeUser,
        getUserBySocketId, getSocketId,
        getOnlineUsers, getUser,
} = require("../../utils/onlineUsers");

const io = require("./stats");
const socketAuth = require("../socketio-middleware");

const { getResponserName, getRequesterName,
        removeRequest, getGameRequests,
        getRequest, getOpponentName,
} = require("../../utils/gameRequestsTracking");

const getReqHeaderValue = require("../../utils/headersExtraction");
const { updateTable,  getUserPoints, getTableUsers, } = require("../../utils/tabale-management");

const games = io.of("/games");

games.on("connection", (socket) => {
  console.log("New game  websocket connection");
  socket.use(socketAuth.bind(socket));

  socket.on("joinGame", async (callback) => {
    //update online users array
    try {
      let token = getReqHeaderValue(socket.handshake, "AuthToken");
      let userInDb = await User.findOne({ "tokens.token": token });
      let points = userInDb.points;
      let user = addUser(socket.id, userInDb.username, points, true);
      io.of("/stats").emit("updateLists", {
        users: getOnlineUsers(),
      });
      let username = user.username;

      if (getRequest(username)) {
        callback(username, getOpponentName(username));
        //in case the user has allready leave the game before (page refresh or connection problems)
      } else {
        user.isPlaying = false;
        games
          .to(socket.id)
          .emit(
            "error",
            "You may have had an internet connection problem or you refreshed the page and so you out of the game, please click OK to return to the main page"
          );
      }
    } catch (e) {
      games.to(socket.id).emit("error", "Server error");
    }
  });

  socket.on("move", (move, isKingMove, currentTurnColor, callback) => {
    try {
      const user = getUserBySocketId(socket.id);
      //If the user has disconnected from the socket connection  because of internet problems
      if (!user) {
        throw new Error(
          "You disconnected from the game and therefore you lost, click ok to return the main page"
        );
      }
      let username = user.username;
      let opponentName = getOpponentName(username);
      games
        .to(getSocketId(opponentName))
        .emit("opponentMove", move, isKingMove, currentTurnColor);
    } catch (e) {
      callback(e.message);
    }
  });

  socket.on("endGame", async (winnerColor) => {
    try {
      let username = getUserBySocketId(socket.id).username;
      let winnerName, loserName;
      if (winnerColor !== null) {
        winnerName = winnerColor === "w"
          ? getRequesterName(username)
          : getResponserName(username);
        loserName = winnerColor === "w"
          ? getResponserName(username)
          : getRequesterName(username);
        //update table array
        updateTable("WIN", winnerName, loserName);
        //update db-  It is not necessary to update the online users array because every socket connection it is updated according the db
      } else {
        // in that option- there is no meaning to the winner's name and  loser's name except the names themselves
        updateTable("DRAW", winnerName, loserName);
        await User.updateOne(
          { username: loserName },
          { points: getUserPoints(loserName) }
        );
      }
      await User.updateOne(
        { username: winnerName },
        { points: getUserPoints(winnerName) }
      );
      games.to(getSocketId(winnerName))
        .to(getSocketId(loserName))
        .emit("endGame", winnerName, winnerColor);
      //update loser status
      getUser(loserName).isPlaying = false;
      //update winner status
      getUser(winnerName).isPlaying = false;
    } catch (e) {
      console.log(e);
    }
  });

  socket.on("quitGame", async (callback) => {
    try {
      const loserName = getUserBySocketId(socket.id).username;
      const winnerName = getOpponentName(loserName);
      updateTable("WIN", winnerName, loserName);
      await User.updateOne(
        { username: winnerName },
        { points: getUserPoints(winnerName) }
      );
      games.to(getSocketId(winnerName)).emit("quitGame");
      //update loser status
      getUser(loserName).isPlaying = false;
      //update winner status
      getUser(winnerName).isPlaying = false;
      callback();
    } catch (e) {
      console.log(e);
    }
  });

  socket.on("disconnect", async () => {
    try {
      const user = getUserBySocketId(socket.id);
      if (user.isPlaying) {
        // if user leave in middle of the game, so need to let the opponent know
        const opponentName = getOpponentName(user.username);
        const opponentUser = getUser(opponentName);
        updateTable("WIN", opponentName, user.username);
        await User.updateOne(
          { username: opponentName },
          { points: getUserPoints(opponentName) }
        );
        opponentUser.isPlaying = false;
        games.to(opponentUser.socketId)
          .emit(
            "error",
            "Your opponent leave the game, so you won, please click OK to return the main page"
          );
      }
      console.log(`${user.username} disconnected from the game`);
      removeRequest(user.username);
      console.log(getGameRequests());
      removeUser(socket.id);
      io.of("/stats").emit("updateLists",
        { users: getOnlineUsers() },
        { users: getTableUsers() }
      );
    } catch (e) {
      console.log(e);
    }
  });
});

module.exports = io;
