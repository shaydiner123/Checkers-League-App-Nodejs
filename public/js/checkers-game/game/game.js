class Game {
  constructor() {
    this.setBoard();
    this.isWhiteTurn = true;
    this.whiteCheckersCount = 12;
    this.blackCheckersCount = 12;
    this.kingPriorCoord = undefined;
    this.endGame = false;
    this.draw = false;
  }

  setBoard() {
    this.board = [new Checker("b"),,new Checker("b"),,new Checker("b"),, new Checker("b"),
                  ,,new Checker("b"),,new Checker("b"),,new Checker("b"),,new Checker("b"),
                  new Checker("b"),,new Checker("b"),,new Checker("b"),,new Checker("b"),
                  ,,,,,,,,
                  ,,,,,,,,,
                  ,new Checker("w"),,new Checker("w"),,new Checker("w"),,new Checker("w"),
                  new Checker("w"),,new Checker("w"),,new Checker("w"),,new Checker("w"),
                  ,,new Checker("w"),,new Checker("w"),,new Checker("w"),,new Checker("w"),
                ];
  }

  toggleTurn(move) {
    if (!move.movedChecker.hasToEatAgain && !this.endGame) {
      this.isWhiteTurn = !this.isWhiteTurn;
    }
  }

  isEndGame(move) {
    let opponentColor = move.movedChecker.color === "w" ? "b" : "w";
    if (
      this.somePlayerIsOutOfMaterial() ||
      !this.playerHasMoves(opponentColor)
    ) {
      return true;
    }
    return this.isDraw();
  }

  getWinnerColor() {
    let winnerColor;
    if (this.draw) {
      return null;
    }
    if (!this.whiteCheckersCount || !this.blackCheckersCount) {
      return (winnerColor = this.whiteCheckersCount ? "w" : "b");
    }
    if (!this.playerHasMoves("w")) {
      return "b";
    }
    if (!this.playerHasMoves("b")) {
      return "w";
    }
  }

  somePlayerIsOutOfMaterial() {
    if (this.blackCheckersCount == 0 || this.whiteCheckersCount == 0) {
      return true;
    }
    return false;
  }

  getPlayerPieces(color) {
    let playerPieces = [];
    for (let i = 0; i < this.board.length; i++) {
      if (this.board[i] != undefined && this.board[i].color === color) {
        playerPieces.push(this.board[i]);
      }
    }
    return playerPieces;
  }

  getPlayerPiecesCoords(color, pices) {
    let playerPices = this.getPlayerPieces(color);
    let coords = [];
    let coord;
    for (let i = 0; i < playerPices.length; i++) {
      coord = this.board.indexOf(playerPices[i]);
      coords.push(coord);
    }
    return coords;
  }

  playerHasMoves(opponentColor) {
    let opponentCheckers = this.getPlayerPieces(opponentColor);
    let opponentCheckersCoords = this.getPlayerPiecesCoords(opponentColor);
    for (let i = 0; i < opponentCheckers.length; i++) {
      if (
        opponentCheckers[i].getMoves(opponentCheckersCoords[i], this).length !=0
      ) {
        return true;
      }
    }
    return false;
  }

  isDraw() {
    if (!this.playerHasMoves("w") && !this.playerHasMoves("b")) {
      this.draw = true;
      return true;
    }
    return false;
  }

  getCheckersCoordsInEatPosition(playerColor) {
    let checkersCoordsInEatPosition = [];
    let checkerCoord;
    let checkers = this.getPlayerPieces(playerColor);
    let checkersCoords = this.getPlayerPiecesCoords(playerColor);
    for (let i = 0; i < checkers.length; i++) {
      checkerCoord = checkersCoords[i];
      if (checkers[i].getCaptureMoves(checkerCoord, this).length != 0) {
        checkersCoordsInEatPosition.push(checkerCoord);
      }
    }
    return checkersCoordsInEatPosition;
  }

  updatePiecesCount(move) {
    if (move.capturedChecker != null) {
      move.capturedChecker.color === "w"
        ? this.whiteCheckersCount--
        : this.blackCheckersCount--;
    }
    if (move.burnedPicesCoords) {
      let picesAmount = move.burnedPicesCoords.length;
      if (move.movedChecker.color === "w") {
        this.whiteCheckersCount -= picesAmount;
      } else {
        this.blackCheckersCount -= picesAmount;
      }
    }
  }
  updateBoard(checkersCoordsInEatPosition, move) {
    ///remove captured piece
    if (move.capturedChecker != null) {
      this.board[move.capturedCheckerCoord] = undefined;
    }
    //remove burned pieces
    let currentPlayerHasToEat = checkersCoordsInEatPosition.length != 0;
    if (currentPlayerHasToEat && move.capturedChecker === null) {
      let burnedPicesCoords = this.removeBurnedCheckersFromBoard(
        checkersCoordsInEatPosition,
        move
      );
      move.burnedPicesCoords = burnedPicesCoords;
    }
  }

  removeBurnedCheckersFromBoard(checkersCoordsInEatPosition, move) {
    let burnedPicesCoords = [];
    for (let i = 0; i < checkersCoordsInEatPosition.length; i++) {
      if (checkersCoordsInEatPosition[i] == move.movedCheckerCoord) {
        this.board[move.destCoord] = undefined;
        burnedPicesCoords.push(move.destCoord);
      } else {
        this.board[checkersCoordsInEatPosition[i]] = undefined;
        burnedPicesCoords.push(checkersCoordsInEatPosition[i]);
      }
    }
    return burnedPicesCoords;
  }

  updateKingPriorCoord(priorMove) {
    if (priorMove.movedChecker instanceof King) {
      this.kingPriorCoord = priorMove.movedCheckerCoord;
    } else {
      this.kingPriorCoord = undefined;
    }
  }
}
