class Utils {
  static isOnBoard(coord) {
    if (coord >= 0 && coord <= 63) {
      return true;
    }
    return false;
  }

  static isOnSpecificColumn(columnNumber, coord) {
    let remain;
    switch (columnNumber) {
      case 1:
        remain = 0;
        break;
      case 2:
        remain = 1;
        break;
      case 7:
        remain = 6;
        break;
      case 8:
        remain = 7;
        break;
    }
    if (coord % 8 === remain) {
      return true;
    }
    return false;
  }

  static nextStepIsExclusion(coord, checker, stepsAmount, isCaptureMove) {
    let destCoord = coord + stepsAmount;
    if (stepsAmount < 0) {
      stepsAmount *= -1;
    }
    let isWProblematicCoord = Utils.isWProblematicCoord(
      coord,
      stepsAmount,
      isCaptureMove
    );
    let isBProblematicCoord = Utils.isBProblematicCoord(
      coord,
      stepsAmount,
      isCaptureMove
    );
    if (checker instanceof King) {
      if (checker.color === "w" && destCoord > coord) {
        return isBProblematicCoord;
      }
      if (checker.color === "b" && destCoord < coord) {
        return isWProblematicCoord;
      }
    }
    if (checker.color === "w") {
      return isWProblematicCoord;
    }
    return isBProblematicCoord;
  }

  static isBProblematicCoord(coord, stepsAmount, isCaptureMove) {
    return (
      (Utils.isOnSpecificColumn(1, coord) &&
        stepsAmount === 7 &&
        !isCaptureMove) ||
      (Utils.isOnSpecificColumn(8, coord) &&
        stepsAmount === 9 &&
        !isCaptureMove) ||
      (Utils.isOnSpecificColumn(7, coord) &&
        stepsAmount === 9 &&
        isCaptureMove) ||
      (Utils.isOnSpecificColumn(2, coord) && stepsAmount === 7 && isCaptureMove)
    );
  }

  static isWProblematicCoord(coord, stepsAmount, isCaptureMove) {
    return (
      (Utils.isOnSpecificColumn(1, coord) &&
        stepsAmount === 9 &&
        !isCaptureMove) ||
      (Utils.isOnSpecificColumn(8, coord) &&
        stepsAmount === 7 &&
        !isCaptureMove) ||
      (Utils.isOnSpecificColumn(7, coord) &&
        stepsAmount === 7 &&
        isCaptureMove) ||
      (Utils.isOnSpecificColumn(2, coord) && stepsAmount === 9 && isCaptureMove)
    );
  }

  //function for king move(check move direction when he eats twice or more)
  static isReturnToPriorCoord(kingCoord, destCoord, kingPriorCoord) {
    if (kingPriorCoord != undefined) {
      let isBackTowardsSomeSide =
        (kingCoord - kingPriorCoord) % 9 == 0 &&
        (kingCoord - destCoord) % 9 == 0 &&
        ((kingCoord > kingPriorCoord && kingPriorCoord > destCoord) ||
          (kingCoord < kingPriorCoord && kingPriorCoord < destCoord));

      let isBackTowardsAnotherSide =
        (kingCoord - kingPriorCoord) % 7 == 0 &&
        (kingCoord - destCoord) % 7 == 0 &&
        ((kingCoord > kingPriorCoord && kingPriorCoord > destCoord) ||
          (kingCoord < kingPriorCoord && kingPriorCoord < destCoord));

      return isBackTowardsAnotherSide || isBackTowardsSomeSide;
    }
    return false;
  }

  //function for king move
  static isValidDestCell(
    nextCellAfterCupturedChecker,
    stepsAmount,
    kingCoord,
    game
  ) {
    //when the function get called for the first time,the "nextCellAfterCupturedChecker" parameter is equal to the captured checker coordinate
    let board = game.board;
    let kingPriorCoord = game.kingPriorCoord;
    let destCoord = nextCellAfterCupturedChecker + stepsAmount;
    return (
      board[destCoord] === undefined &&
      Utils.isOnBoard(destCoord) &&
      !Utils.isOnSpecificColumn(1, nextCellAfterCupturedChecker) &&
      !Utils.isOnSpecificColumn(8, nextCellAfterCupturedChecker) &&
      !Utils.isReturnToPriorCoord(kingCoord, destCoord, kingPriorCoord)
    );
  }
}
