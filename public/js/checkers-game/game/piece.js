class Checker {
  constructor(color) {
    this.color = color;
    this.hasToEatAgain = false;
  }

  getMoves(coord, game) {
    let noCaptureMoves = this.getNoCaptureMoves(coord, game.board);
    let captureMoves = this.getCaptureMoves(coord, game);
    let moves = noCaptureMoves.concat(captureMoves);
    return moves;
  }

  getNoCaptureMoves(coord, board) {
    const stepsAmount = [7, 9];
    let moves = [];
    let movesIndex = 0, destCoord = 0, destinationCell;
    for (let i = 0; i < 2; i++) {
      destCoord =
        this.color == "w" ? coord + -stepsAmount[i] : coord + stepsAmount[i];
      if (
        Utils.isOnBoard(destCoord) &&
        !Utils.nextStepIsExclusion(coord, this, stepsAmount[i], false)
      ) {
        destinationCell = board[destCoord];
        if (destinationCell === undefined) {
          moves[movesIndex] = new Move(this, coord, destCoord, null, -1);
          movesIndex++;
        }
      }
    }
    return moves;
  }

  getCaptureMoves(coord, game) {
    let board = game.board;
    let stepsAmount = [7, 9];
    let captureMoves = [] , captureMovesIndex = 0;
    let destCoord = 0, cupturedCheckerCoord = 0;
    for (let i = 0; i < 2; i++) {
      destCoord = this.color === "w" ? coord + -stepsAmount[i] * 2 : coord + stepsAmount[i] * 2;
      cupturedCheckerCoord = this.color === "w" ? coord + -stepsAmount[i] : coord + stepsAmount[i];
      if (Utils.isOnBoard(destCoord) &&
          !Utils.nextStepIsExclusion(coord, this, stepsAmount[i], true)
      ) {
        if (
          board[cupturedCheckerCoord] != undefined &&
          board[cupturedCheckerCoord].color != this.color &&
          board[destCoord] === undefined
        ) {
          captureMoves[captureMovesIndex] = new Move(
            this, coord,
            destCoord, board[cupturedCheckerCoord],
            cupturedCheckerCoord
          );
          captureMovesIndex++;
        }
      }
    }
    return captureMoves;
  }

  getCheckerMoves(coord, game) {
    let checker = game.board[coord];
    let checkerMoves;
    let playerColor = checker.color;
    let checkersCoordsInEatPosition = game.getCheckersCoordsInEatPosition(
      playerColor
    );
    let playerHasToEat = checkersCoordsInEatPosition.length !== 0;
    if (checker.hasToEatAgain) {
      checkerMoves = checker.getCaptureMoves(coord, game);
    } else {
      checkerMoves = checker.getMoves(coord, game);
    }
    return checkerMoves;
  }

  isDoubleEatPossible(priorMove, game) {
    let board = game.board;
    let currentCoord = priorMove.destCoord;
    let isAteInPriorMove = priorMove.capturedChecker != null;
    let isAbleToEat = this.getCaptureMoves(currentCoord, game).length != 0;
    return isAbleToEat && isAteInPriorMove;
  }
}
