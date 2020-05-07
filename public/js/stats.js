const socket = io.connect("/stats");

//elements
const $onlineUsers = document.querySelector("#onlineUsers");
const $myUsername = document.querySelector("#myUsername");
const $myPoints = document.querySelector("#myPoints");
const $scoreTable = document.querySelector("#table");

//templates
const onlineUsersTemplate = document.querySelector("#onlineUsers-template")
  .innerHTML;
const scoreTableTemplate = document.querySelector("#scoreTable-template")
  .innerHTML;

socket.on("error", (errorMessage) => {
  alert(errorMessage);
  if (errorMessage === "Unauthorized") {
    location.href = "/";
  }
});

const logout = () => {
  const form = document.createElement("form");
  form.action = "/users/logout";
  form.method = "post";
  const submit = document.createElement("input");
  form.appendChild(submit);
  document.body.appendChild(form);
  form.submit();
};

const deleteAccount = () => {
  const isDelete = confirm("Are you sure you want to delete your account?");
  if (isDelete) {
    fetch("/users/me", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
    });
    location.href = "/";
  }
};

socket.on("updateLists", (onlineUsers, tableUsers) => {
  //update online users

  let html = Mustache.render(onlineUsersTemplate, onlineUsers);
  $onlineUsers.innerHTML = html;
  $usersList = document.getElementsByClassName("usersnames");
  for (let i = 0; i < $usersList.length; i++) {
    $usersList[i].addEventListener("click", (e) => {
      const responserName = e.target.innerHTML;
      socket.emit("game start request", responserName, (message) => {
        alert(message);
      });
    });
  }

  //update score table
  if (tableUsers) {
    html = Mustache.render(scoreTableTemplate, tableUsers);
    $scoreTable.innerHTML = html;
  }
});

socket.on("game start request", (requesterName) => {
  const isAccept = confirm(
    `${requesterName}  wants to start playing with you, please reply to him`
  );
  socket.emit("game start response", isAccept, (e) => {
    alert(e);
  });
});

socket.on("rejected request", (message) => {
  alert(message);
});

socket.on("run game", (color) => {
  location.href = `/checkers.html?userColor=${color}`;
});

socket.emit("login", (e) => {
  alert(e);
});
