class King extends Checker {
  constructor(color) {
    super(color);
  }

  getNoCaptureMoves(coord, board) {
    let moves = [],  movesIndex = 0;
    let nextCoord , isValidDestCell;
    let currentCoord = coord;
    let stepsAmount = [-9, -7, 7, 9];
    for(let i = 0; i < stepsAmount.length; i++) {
      isValidDestCell = true;
      nextCoord = coord + stepsAmount[i];
      while(board[nextCoord] === undefined && isValidDestCell) {
        if(Utils.isOnBoard(nextCoord) &&
           !Utils.nextStepIsExclusion(currentCoord,this,stepsAmount[i],false) &&
           board[nextCoord] === undefined)
        {
          moves[movesIndex] = new Move(this, coord, nextCoord, null, -1);
          movesIndex++;
        }else {
          isValidDestCell = false;
        }
        currentCoord = nextCoord;
        nextCoord += stepsAmount[i];
      }
      currentCoord = coord;
    }
    return moves;
  }

  getCaptureMoves(coord, game) {
    let board = game.board,  moves = [];
    let optionalCuptureCoord , nextCellAfterCupturedChecker;
    let stepsAmount = [-9, -7, 7, 9];
    let cupturedCheckerCoord;
    for(let i = 0; i < stepsAmount.length; i++) {
      optionalCuptureCoord = coord + stepsAmount[i];
      cupturedCheckerCoord = this.getOptionalCuptureCoord(optionalCuptureCoord,coord,stepsAmount[i],board);
      if(cupturedCheckerCoord != -1)
      {
        nextCellAfterCupturedChecker = cupturedCheckerCoord;
        if(board[cupturedCheckerCoord].color != this.color) {
          while (Utils.isValidDestCell(nextCellAfterCupturedChecker, stepsAmount[i],
                                       coord, game))
          {
            nextCellAfterCupturedChecker += stepsAmount[i];
            moves.push(new Move(this,coord, nextCellAfterCupturedChecker,
                                board[cupturedCheckerCoord], cupturedCheckerCoord));
          }
        }
      }
    }
    return moves;
  }

  getOptionalCuptureCoord(optionalCuptureCoord, kingCoord, stepsAmount, board) {
    let king = this;
    let isEmptyCell = true, isValidCell = true;
    while (isEmptyCell && isValidCell) {
      if (Utils.isOnBoard(optionalCuptureCoord) &&
          !Utils.nextStepIsExclusion(kingCoord, king, stepsAmount, true)
      ) {
        if (board[optionalCuptureCoord] === undefined) {
          kingCoord = optionalCuptureCoord;
          optionalCuptureCoord += stepsAmount;
        } else {
          isEmptyCell = false;
        }
      } else {
        isValidCell = false;
      }
    }
    return isValidCell ? optionalCuptureCoord : -1;
  }
}
