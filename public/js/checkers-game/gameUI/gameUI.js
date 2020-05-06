class GameUI {
  constructor() {
    this.$clickedCells = [];
  }

  setVisualCells() {
    let $board = document.getElementById("board");
    let cellsNumber = 63, rowNumber = 1;
    let cellColor = "black_cell";
    let $divToAdd, $cellDiv;
    for (let id = 0; id <= cellsNumber; id++) {
      $cellDiv = document.createElement("div");
      $cellDiv.setAttribute("id", id);
      $cellDiv.classList.add("cell");
      if (rowNumber % 2 !== 0) {
        $cellDiv.classList.add(cellColor);
        cellColor = cellColor === "black_cell" ? "white_cell" : "black_cell";
      } else {
        cellColor = cellColor === "black_cell" ? "white_cell" : "black_cell";
        $cellDiv.classList.add(cellColor);
      }
      $board.appendChild($cellDiv);
      if (id % 8 === 7) {
        rowNumber++;
        $divToAdd = document.createElement("div");
        $divToAdd.setAttribute("class", "no_wrap");
        $board.appendChild($divToAdd);
      }
    }
  }

  setVisualPices() {
    let cellClassName = "";
    let $pieceDiv;
    for (let id = 0; id <= 63; id++) {
      cellClassName = document.getElementById(id).getAttribute("class");
      if (cellClassName.indexOf("black_cell") != -1) {
        $pieceDiv = document.createElement("div");
        if (id >= 0 && id <= 23) {
          $pieceDiv.classList.add("checker", "b_checker");
        } else {
          if (id >= 40 && id <= 63) {
            $pieceDiv.classList.add("checker", "w_checker");
          }
        }
        document.getElementById(id).appendChild($pieceDiv);
      }
    }
  }

  render(move, userColor) {
    let $movedCheckerCell = document.getElementById(move.movedCheckerCoord);
    let $destCell = document.getElementById(move.destCoord);
    $destCell.innerHTML = $movedCheckerCell.innerHTML;
    $movedCheckerCell.innerHTML = "";
    if (move.capturedChecker) {
      let $capturedCheckerCell = document.getElementById(
        move.capturedCheckerCoord
      );
      $capturedCheckerCell.innerHTML = "";
    }
    if (move.burnedPicesCoords) {
      for (let i = 0; i < move.burnedPicesCoords.length; i++) {
        document.getElementById(move.burnedPicesCoords[i]).innerHTML = "";
      }
    }
    this.handlePromotionUI(move.destCoord, userColor);
  }

  removeCellsClickEvent(moves) {
    for (let i = 0; i < moves.length; i++) {
      document.getElementById(moves[i].destCoord).onclick = null;
    }
  }

  removeBoardClickEvent() {
    document.getElementById("board").onclick = null;
  }

  showGameOverMessage(winnerName, winnerColor) {
    const text =
      winnerColor !== null
        ? winnerName + " won the game"
        : "The game ended in a draw";
    const $winMessageDiv = document.getElementById("win_message");
    if (winnerColor !== null) {
      $winMessageDiv.style.backgroundColor =
        winnerColor == "b" ? "black" : "red";
    } else {
      $winMessageDiv.style.backgroundColor = "green";
    }
    const $textnode = document.createTextNode(text);
    $winMessageDiv.style.borderStyle = "solid";
    $winMessageDiv.style.borderColor = "yellow";
    $winMessageDiv.style.width = "40vw";
    $winMessageDiv.style.height = "15vh";
    $winMessageDiv.appendChild($textnode);
  }

  handlePromotionUI(destCellId, userColor) {
    const $kingCell = document.getElementById(destCellId);
    let $img, kingColor;
    if (!$kingCell.getElementsByTagName("img").length) {
      if (destCellId >= 0 && destCellId <= 7) {
        kingColor = "w";
      }
      if (destCellId >= 56 && destCellId <= 63) {
        kingColor = "b";
      }
      if (kingColor) {
        $kingCell.innerHTML = "";
        $img = document.createElement("img");
        $img.src = `/images/${kingColor}-king.png`;
        $img.classList.add(`${kingColor}_king`, "king");
        $kingCell.appendChild($img);
        if (userColor === "b") {
          $img.classList.add("rotated");
        }
      }
    }
  }

  isPiece(event, color) {
    return (
      event.target.className.split(" ").includes(`${color}_checker`) ||
      event.target.className.includes(`${color}_king`)
    );
  }

  showTurn(color) {
    let $message = document.getElementById("current_turn_message");
    if (color === "w") {
      $message.innerHTML = "White Turn";
      $message.style.backgroundColor = "red";
    } else {
      $message.innerHTML = "Black Turn";
      $message.style.backgroundColor = "black";
    }
  }

  rotateBoardIfNecessary(userColor) {
    if (userColor == "b") {
      const $board = document.getElementById("board");
      $board.className = "rotated";
    }
  }

  showQuitOption(socket) {
    const $quitDiv = document.getElementById("quit-game");
    $quitDiv.innerText = "Quit Game";
    $quitDiv.onclick = () => {
      try {
        socket.emit("quitGame", () => {
          location.href = "/stats.html";
        });
      } catch (e) {
        alert("you are disconnected, please return to main page");
      }
    };
  }

  makeQuitAsLinkToLoby() {
    document.getElementById("quit-game").onclick = () => {
      location.href = "/stats.html";
    };
  }

  highlightPiece(piece) {
    const $cell = piece.parentNode;
    this.$clickedCells.push($cell);
    $cell.classList.add("highlight");
  }

  removeHighlight() {
    for (let i = 0; i < this.$clickedCells.length; i++) {
      this.$clickedCells[i].classList.remove("highlight");
    }
    this.$clickedCells = [];
  }
}
