const socket = io.connect("/games");

// Options
const { userColor } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

//elements
const $players = document.getElementById("players");

//templates
const playersTemplate = document.getElementById("players-template").innerHTML;

socket.emit("joinGame", (myName, opponentName) => {
  let html = Mustache.render(playersTemplate, { myName, opponentName });
  $players.innerHTML = html;
  const $myName = document.getElementsByClassName("myName")[0];
  const $vs = document.getElementsByClassName("vs")[0];
  const $opponentName = document.getElementsByClassName("opponentName")[0];
  $myName.style.color = userColor === "w" ? "red" : "black";
  $vs.style.color = "white";
  $vs.style.fontSize = "1.5em";
  $opponentName.style.color = userColor === "w" ? "black" : "red";
});

socket.on("error", (message) => {
  alert(message);
  //Unauthorized message from socketio middleware
  if (message == "Unauthorized") {
    location.href = "/";
  }
  //other errors related to the game - the timeout makes the user first disconnect the games ns and only then connect to loby ns
  else {
    setTimeout(() => {
      location.href = "/stats.html";
    }, 1000);
  }
});

socket.on("quitGame", () => {
  alert(
    "your opponent has quit the game, please click ok to return the main page"
  );
  location.href = "/stats.html";
});

class GameManager {
  constructor() {
    this.gameUI = new GameUI();
    this.game = new Game();
  }

  runGame() {
    let gameUI = this.gameUI;
    let game = this.game;
    let startCoord;
    gameUI.setVisualCells();
    gameUI.setVisualPices();
    gameUI.showTurn("w");
    gameUI.rotateBoardIfNecessary(userColor);
    gameUI.showQuitOption(socket);
    document.getElementById("board").onclick = (e) => {
      let moves = [];
      if (gameUI.isPiece(e, userColor)) {
        let currentTurnColor = game.isWhiteTurn ? "w" : "b";
        if (userColor === currentTurnColor) {
          gameUI.removeHighlight();
          gameUI.highlightPiece(e.target);
          startCoord = Number(e.target.parentNode.getAttribute("id"));
          moves = game.board[startCoord].getCheckerMoves(startCoord, game);
          for (let i = 0; i < moves.length; i++) {
            document.getElementById(moves[i].destCoord).onclick = (
              e,
              sourceCoord = startCoord
            ) => {
              gameUI.removeHighlight();
              e.stopPropagation();
              let destCoord = Number(e.target.id);
              let move = this.getMatchingMove(moves, destCoord, sourceCoord);
              move.executeMove(
                game.getCheckersCoordsInEatPosition(move.movedChecker.color),
                game
              );
              game.toggleTurn(move);
              gameUI.render(move, userColor);
              gameUI.removeCellsClickEvent(moves);
              currentTurnColor = game.isWhiteTurn ? "w" : "b";
              gameUI.showTurn(currentTurnColor);
              socket.emit("move", move, move.isKingMove(), currentTurnColor, (e) => {
                  alert(e);
                  location.href = "/stats.html";
                }
              );
              if (game.endGame) {
                let winnerColor = game.getWinnerColor();
                socket.emit("endGame", winnerColor);
              }
            };
          }
        }
      }
    };
    socket.on("opponentMove", (move, isKingMove, currentTurnColor) => {
      let moveToExecute = this.getMoveInstance(move, isKingMove);
      moveToExecute.executeMove(
        game.getCheckersCoordsInEatPosition(moveToExecute.movedChecker.color),
        game
      );
      game.toggleTurn(moveToExecute);
      gameUI.render(moveToExecute, userColor);
      gameUI.showTurn(currentTurnColor);
    });
    socket.on("endGame", (winnerName, winnerColor) => {
      gameUI.showGameOverMessage(winnerName, winnerColor);
      gameUI.removeBoardClickEvent();
      gameUI.makeQuitAsLinkToLoby();
    });
  }

  getMatchingMove(moves, destCoord, sourceCoord) {
    for (let i = 0; i < moves.length; i++) {
      if (
        moves[i].movedCheckerCoord === sourceCoord &&
        moves[i].destCoord === destCoord
      ) {
        return moves[i];
      }
    }
    return null;
  }

  getMoveInstance(moveObject, isKingMove) {
    let movedChecker = isKingMove ? new King() : new Checker();
    movedChecker.color = moveObject.movedChecker.color;
    movedChecker.hasToEatAgain = moveObject.movedChecker.hasToEatAgain;
    return new Move(
      movedChecker,
      moveObject.movedCheckerCoord,
      moveObject.destCoord,
      moveObject.capturedChecker
        ? new Checker(moveObject.capturedChecker.color)
        : null,
      moveObject.capturedCheckerCoord,
      moveObject.burnedPicesCoords
    );
  }
}
