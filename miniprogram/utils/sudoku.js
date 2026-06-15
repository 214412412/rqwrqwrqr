class Sudoku {
  constructor() {
    this.BOARD_SIZE = 9;
    this.BOX_SIZE = 3;
  }

  generate(difficulty = 'medium') {
    const board = this.createEmptyBoard();
    this.fillBoard(board);
    const solution = this.copyBoard(board);
    const cellsToRemove = this.getDifficultyCells(difficulty);
    this.removeCells(board, cellsToRemove);
    return { board, solution };
  }

  createEmptyBoard() {
    return Array(this.BOARD_SIZE).fill(null).map(() => Array(this.BOARD_SIZE).fill(0));
  }

  copyBoard(board) {
    return board.map(row => [...row]);
  }

  fillBoard(board) {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    const shuffle = (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    const isValid = (board, row, col, num) => {
      for (let i = 0; i < this.BOARD_SIZE; i++) {
        if (board[row][i] === num) return false;
      }

      for (let i = 0; i < this.BOARD_SIZE; i++) {
        if (board[i][col] === num) return false;
      }

      const boxRow = Math.floor(row / this.BOX_SIZE) * this.BOX_SIZE;
      const boxCol = Math.floor(col / this.BOX_SIZE) * this.BOX_SIZE;
      for (let i = 0; i < this.BOX_SIZE; i++) {
        for (let j = 0; j < this.BOX_SIZE; j++) {
          if (board[boxRow + i][boxCol + j] === num) return false;
        }
      }

      return true;
    };

    const solve = (board) => {
      for (let row = 0; row < this.BOARD_SIZE; row++) {
        for (let col = 0; col < this.BOARD_SIZE; col++) {
          if (board[row][col] === 0) {
            const shuffledNumbers = shuffle([...numbers]);
            for (const num of shuffledNumbers) {
              if (isValid(board, row, col, num)) {
                board[row][col] = num;
                if (solve(board)) return true;
                board[row][col] = 0;
              }
            }
            return false;
          }
        }
      }
      return true;
    };

    solve(board);
  }

  getDifficultyCells(difficulty) {
    const difficultyMap = {
      easy: 35,
      medium: 45,
      hard: 55
    };
    return difficultyMap[difficulty] || 45;
  }

  removeCells(board, count) {
    let removed = 0;
    while (removed < count) {
      const row = Math.floor(Math.random() * this.BOARD_SIZE);
      const col = Math.floor(Math.random() * this.BOARD_SIZE);
      if (board[row][col] !== 0) {
        board[row][col] = 0;
        removed++;
      }
    }
  }

  checkCell(board, row, col, value) {
    if (value === 0) return true;
    
    for (let i = 0; i < this.BOARD_SIZE; i++) {
      if (i !== col && board[row][i] === value) return false;
    }

    for (let i = 0; i < this.BOARD_SIZE; i++) {
      if (i !== row && board[i][col] === value) return false;
    }

    const boxRow = Math.floor(row / this.BOX_SIZE) * this.BOX_SIZE;
    const boxCol = Math.floor(col / this.BOX_SIZE) * this.BOX_SIZE;
    for (let i = 0; i < this.BOX_SIZE; i++) {
      for (let j = 0; j < this.BOX_SIZE; j++) {
        const r = boxRow + i;
        const c = boxCol + j;
        if (r !== row && c !== col && board[r][c] === value) return false;
      }
    }

    return true;
  }

  isBoardComplete(board) {
    for (let row = 0; row < this.BOARD_SIZE; row++) {
      for (let col = 0; col < this.BOARD_SIZE; col++) {
        if (board[row][col] === 0) return false;
      }
    }
    return true;
  }

  isBoardValid(board) {
    for (let row = 0; row < this.BOARD_SIZE; row++) {
      for (let col = 0; col < this.BOARD_SIZE; col++) {
        if (board[row][col] !== 0 && !this.checkCell(board, row, col, board[row][col])) {
          return false;
        }
      }
    }
    return true;
  }

  calculateScore(timeUsed, difficulty, mistakes) {
    const baseScore = {
      easy: 1000,
      medium: 2000,
      hard: 3000
    };
    const timeBonus = Math.max(0, (600 - timeUsed) * 2);
    const mistakePenalty = mistakes * 100;
    return Math.max(0, baseScore[difficulty] + timeBonus - mistakePenalty);
  }
}

module.exports = Sudoku;