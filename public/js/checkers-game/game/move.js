class Move {
  constructor(
    movedChecker,
    movedCheckerCoord,
    destCoord,
    capturedChecker,
    capturedCheckerCoord,
    burnedPicesCoords
  ) {
    this.movedChecker = movedChecker;
    this.movedCheckerCoord = movedCheckerCoord;
    this.destCoord = destCoord;
    this.capturedChecker = capturedChecker;
    this.capturedCheckerCoord = capturedCheckerCoord;
  }

  executeMove(checkersEatingCoords, game) {
    let board = game.board;
    let movedChecker = this.movedChecker;
    this.moveChecker(board);
    this.handlePromotion(board);
    game.updateBoard(checkersEatingCoords, this);
    game.updatePiecesCount(this);
    let endGame = game.isEndGame(this);
    if (!endGame) {
      if (movedChecker.isDoubleEatPossible(this, game)) {
        movedChecker.hasToEatAgain = true;
      } else {
        movedChecker.hasToEatAgain = false;
      }
      game.updateKingPriorCoord(this);
    } else {
      game.endGame = !game.endGame;
    }
  }

  isPromotion() {
    if (
      this.movedChecker.color === "w" &&
      !(this.movedChecker instanceof King)
    ) {
      if (this.destCoord >= 0 && this.destCoord <= 7) {
        return true;
      }
    }
    if (
      this.movedChecker.color === "b" &&
      !(this.movedChecker instanceof King)
    ) {
      if (this.destCoord >= 56 && this.destCoord <= 63) {
        return true;
      }
    }
    return false;
  }

  handlePromotion(board) {
    if (this.isPromotion()) {
      let pieceColor = this.movedChecker.color;
      board[this.destCoord] = new King(pieceColor);
    }
  }
  moveChecker(board) {
    let movedCheckerCoord = this.movedCheckerCoord;
    board[movedCheckerCoord] = undefined;
    board[this.destCoord] = this.movedChecker;
  }

  isKingMove() {
    return this.movedChecker instanceof King;
  }
}
