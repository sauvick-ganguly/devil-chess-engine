export function createInitialBoard() {
  const board = Array.from({ length: 8 }, () =>
    Array(8).fill(null)
  );

  const backRank = ["R", "W", "D", "K", "K", "D", "W", "R"];

  for (let col = 0; col < 8; col++) {

    board[0][col] = {
      type: backRank[col],
      color: "b",
      hasMoved: false,
    };

    if (backRank[col] === "K") {
      board[0][col].id = col === 3 ? 1 : 2;
    }
    if (backRank[col] === "D") {
  board[0][col].revived = false;
  board[0][col].home = { row: 0, col };
}

    board[1][col] = {
      type: "P",
      color: "b",
    };

    board[6][col] = {
      type: "P",
      color: "w",
    };

    board[7][col] = {
      type: backRank[col],
      color: "w",
      hasMoved: false,
    };
    if (backRank[col] === "D") {
  board[7][col].revived = false;
  board[7][col].home = { row: 7, col };
}
    if (backRank[col] === "K") {
      board[7][col].id = col === 3 ? 1 : 2;
    }
  }

  return board;
}