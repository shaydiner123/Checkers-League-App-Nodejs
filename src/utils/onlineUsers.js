const users = [];

class User {
  constructor(socketId, username, points, isPlaying) {
    this.socketId = socketId;
    this.username = username;
    this.points = points;
    this.isPlaying = isPlaying;
  }
}

const addUser = (socketId, username, points, curremtGame) => {
  //clean the data
  let user;
  username = username.trim().toLowerCase();
  //store user
  const existingUser = users.find((user) => {
    return user.username === username;
  });

  if (existingUser === undefined) {
    user = new User(socketId, username, points, curremtGame);
    users.push(user);
  }
  return user;
};

const removeUser = (socketId) => {
  const index = users.findIndex((user) => {
    return user.socketId === socketId;
  });

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUserBySocketId = (socketId) => {
  return users.find((user) => {
    return user.socketId === socketId;
  });
};

const getSocketId = (username) => {
  const user = users.find((user) => {
    return user.username == username;
  });
  if (user) {
    return user.socketId;
  }
};

const getOnlineUsers = () => {
  return users;
};

const isOnlineUser = (username) => {
  return users.find((user) => {
    return user.username === username;
  });
};

const getUser = (username) => {
  return getUserBySocketId(getSocketId(username));
};

module.exports = {
  addUser,
  removeUser,
  getUserBySocketId,
  getUser,
  getSocketId,
  getOnlineUsers,
  isOnlineUser,
};
