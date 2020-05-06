const User = require("../models/user");

let table = [];
initTable();

async function initTable() {
  const users = await User.find({});
  users.forEach((u) => {
    const data = { username: u.username, points: u.points };
    table.push(data);
  });
  //Arrange the list according to the points in descending order
  table.sort((u1, u2) => {
    return u2.points - u1.points;
  });
}

function getPosition(username) {
  const position = table.findIndex((u) => {
    return username === u.username;
  });
  return position + 1;
}

function calculatePoints(gameResult, winnerName, loserName) {
  let points = gameResult === "WIN" ? 2 : 1;
  const winnerPosition = getPosition(winnerName);
  const loserNamePositionFromTheEnd = table.length - getPosition(loserName) + 1;
  //get more points as much as winner position is lower and opponent position is higher
  points = points * (loserNamePositionFromTheEnd + winnerPosition);
  return points;
}

const updateTable = (gameResult, winnerName, loserName) => {
  let points = calculatePoints(gameResult, winnerName, loserName);
  const position = getPosition(winnerName);
  table[position - 1].points += points;
  if (gameResult === "DRAW") {
    points = calculatePoints(gameResult, loserName, winnerName);
    table[getPosition(loserName) - 1].points += points;
  }
  table.sort((u1, u2) => {
    return u2.points - u1.points;
  });
  return table;
};

//when new user signing up
const addUserToTable = ({ username }) => {
  const points = 0;
  table.push({ username, points });
  console.log(table);
};
const removeUserFromTable = ({ username }) => {
  const index = table.findIndex((user) => {
    return user.username === username;
  });
  if (index !== -1) {
    return table.splice(index, 1)[0];
  }
};

const getUserPoints = (username) => {
  const user = table.find((user) => {
    return user.username === username;
  });
  return user.points;
};

const getTableUsers = () => {
  return table;
};

module.exports = {
  getPosition,
  calculatePoints,
  updateTable,
  getUserPoints,
  addUserToTable,
  removeUserFromTable,
  getTableUsers,
};
