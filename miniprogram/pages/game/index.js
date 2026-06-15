const Sudoku = require('../../utils/sudoku.js');

Page({
  data: {
    board: [],
    solution: [],
    initialBoard: [],
    difficulty: 'medium',
    difficultyText: '中等',
    selectedCell: null,
    timeUsed: 0,
    formattedTime: '00:00',
    score: 0,
    mistakes: 0,
    showGameOver: false,
    finalTime: 0,
    formattedFinalTime: '00:00',
    finalScore: 0,
    errorCells: [],
    cellClasses: []
  },

  timer: null,
  sudoku: null,

  onLoad(options) {
    const difficulty = options?.difficulty || 'medium';
    const difficultyMap = {
      easy: '简单',
      medium: '中等',
      hard: '困难'
    };

    this.setData({
      difficulty,
      difficultyText: difficultyMap[difficulty]
    });

    this.sudoku = new Sudoku();
    this.initGame();
  },

  initGame() {
    const { board, solution } = this.sudoku.generate(this.data.difficulty);
    const initialBoard = board.map(row => [...row]);

    this.setData({
      board,
      solution,
      initialBoard,
      selectedCell: null,
      timeUsed: 0,
      formattedTime: '00:00',
      score: 0,
      mistakes: 0,
      showGameOver: false,
      errorCells: [],
      cellClasses: this.generateCellClasses(board, initialBoard, null, [])
    });

    this.startTimer();
  },

  generateCellClasses(board, initialBoard, selectedCell, errorCells) {
    const classes = [];
    for (let row = 0; row < 9; row++) {
      classes[row] = [];
      for (let col = 0; col < 9; col++) {
        let cls = '';
        if (initialBoard[row][col] === 0) {
          cls += 'editable';
        }
        if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
          cls += ' selected';
        }
        if (errorCells.includes(`${row}-${col}`)) {
          cls += ' error';
        }
        classes[row][col] = cls.trim();
      }
    }
    return classes;
  },

  startTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(() => {
      const newTimeUsed = this.data.timeUsed + 1;
      const formattedTime = this.formatTime(newTimeUsed);
      this.setData({
        timeUsed: newTimeUsed,
        formattedTime
      });
      this.updateScore();
    }, 1000);
  },

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  updateScore() {
    const score = this.sudoku.calculateScore(
      this.data.timeUsed,
      this.data.difficulty,
      this.data.mistakes
    );
    this.setData({ score });
  },

  onCellTap(e) {
    const { row, col } = e.currentTarget.dataset;
    const rowNum = parseInt(row);
    const colNum = parseInt(col);

    if (this.data.initialBoard[rowNum][colNum] === 0) {
      const selectedCell = { row: rowNum, col: colNum };
      this.setData({
        selectedCell,
        cellClasses: this.generateCellClasses(
          this.data.board,
          this.data.initialBoard,
          selectedCell,
          this.data.errorCells
        )
      });
    }
  },

  onNumberTap(e) {
    const num = parseInt(e.currentTarget.dataset.num);
    this.inputNumber(num);
  },

  onEraseTap() {
    this.inputNumber(0);
  },

  inputNumber(num) {
    if (!this.data.selectedCell) return;

    const { row, col } = this.data.selectedCell;
    if (this.data.initialBoard[row][col] !== 0) return;

    const newBoard = this.data.board.map(r => [...r]);
    newBoard[row][col] = num;

    let newErrorCells = [...this.data.errorCells];
    let newMistakes = this.data.mistakes;

    const cellKey = `${row}-${col}`;
    const errorIndex = newErrorCells.indexOf(cellKey);

    if (num !== 0) {
      if (num !== this.data.solution[row][col]) {
        if (errorIndex === -1) {
          newErrorCells.push(cellKey);
          newMistakes++;
        }
      } else {
        if (errorIndex !== -1) {
          newErrorCells.splice(errorIndex, 1);
        }
      }
    } else {
      if (errorIndex !== -1) {
        newErrorCells.splice(errorIndex, 1);
      }
    }

    this.setData({
      board: newBoard,
      errorCells: newErrorCells,
      mistakes: newMistakes,
      cellClasses: this.generateCellClasses(
        newBoard,
        this.data.initialBoard,
        this.data.selectedCell,
        newErrorCells
      )
    });

    this.updateScore();
    this.checkWin();
  },

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  checkWin() {
    if (this.sudoku.isBoardComplete(this.data.board) &&
        this.sudoku.isBoardValid(this.data.board)) {
      this.gameOver();
    }
  },

  gameOver() {
    this.stopTimer();
    
    const finalScore = this.sudoku.calculateScore(
      this.data.timeUsed,
      this.data.difficulty,
      this.data.mistakes
    );

    this.setData({
      showGameOver: true,
      finalTime: this.data.timeUsed,
      formattedFinalTime: this.formatTime(this.data.timeUsed),
      finalScore
    });

    this.saveScore(finalScore);
  },

  saveScore(score) {
    const db = wx.cloud.database();
    db.collection('scores').add({
      data: {
        score,
        difficulty: this.data.difficulty,
        timeUsed: this.data.timeUsed,
        mistakes: this.data.mistakes,
        createTime: new Date()
      }
    }).then(res => {
      console.log('Score saved:', res);
    }).catch(err => {
      console.error('Save score failed:', err);
    });
  },

  restartGame() {
    this.initGame();
  },

  goHome() {
    this.stopTimer();
    wx.navigateBack();
  },

  onUnload() {
    this.stopTimer();
  }
});