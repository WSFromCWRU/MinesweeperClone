const TILE_STATUSES = {
    HIDDEN: "hidden",
    MINE: "mine",
    NUMBER: "number",
    MARKED: "marked",
  }
    
  function createBoard(boardSize, numberOfMines) {
    const board = []
    const minePositions = getMinePositions(boardSize, numberOfMines)
  
    for (let x = 0; x < boardSize; x++) {
      const row = []
      for (let y = 0; y < boardSize; y++) {
        const element = document.createElement("div")
        element.dataset.status = TILE_STATUSES.HIDDEN
  
        const tile = {
          element,
          x,
          y,
          mine: minePositions.some(positionMatch.bind(null, { x, y })),
          get status() {
            return this.element.dataset.status
          },
          set status(value) {
            this.element.dataset.status = value
          },
        }
  
        row.push(tile)
      }
      board.push(row)
    }
  
    return board
  }
  
  function markTile(tile) {
    if (
      tile.status !== TILE_STATUSES.HIDDEN &&
      tile.status !== TILE_STATUSES.MARKED
    ) {
      return
    }
  
    if (tile.status === TILE_STATUSES.MARKED) {
      tile.status = TILE_STATUSES.HIDDEN
    } else {
      tile.status = TILE_STATUSES.MARKED
    }
  }
  
  function revealTile(board, tile) {
    if (tile.status !== TILE_STATUSES.HIDDEN) {
      return
    }
  
    if (tile.mine) {
      tile.status = TILE_STATUSES.MINE
      return
    }
  
    tile.status = TILE_STATUSES.NUMBER
    const adjacentTiles = nearbyTiles(board, tile)
    const mines = adjacentTiles.filter(t => t.mine)
    if (mines.length === 0) {
      adjacentTiles.forEach(revealTile.bind(null, board))
    } else {
      tile.element.textContent = mines.length
    }
  }
  
  function checkWin(board) {
    return board.every(row => {
      return row.every(tile => {
        return (
          tile.status === TILE_STATUSES.NUMBER ||
          (tile.mine &&
            (tile.status === TILE_STATUSES.HIDDEN ||
              tile.status === TILE_STATUSES.MARKED))
        )
      })
    })
  }
  
  function checkLose(board) {
    return board.some(row => {
      return row.some(tile => {
        return tile.status === TILE_STATUSES.MINE
      })
    })
  }
  
  function getMinePositions(boardSize, numberOfMines) {
    const positions = []
  
    while (positions.length < numberOfMines) {
      const position = {
        x: randomNumber(boardSize),
        y: randomNumber(boardSize),
      }
  
      if (!positions.some(positionMatch.bind(null, position))) {
        positions.push(position)
      }
    }
  
    return positions
  }
  
  function positionMatch(a, b) {
    return a.x === b.x && a.y === b.y
  }
  
  function randomNumber(size) {
    return Math.floor(Math.random() * size)
  }
  
  function nearbyTiles(board, { x, y }) {
    const tiles = []
  
    for (let xOffset = -1; xOffset <= 1; xOffset++) {
      for (let yOffset = -1; yOffset <= 1; yOffset++) {
        const tile = board[x + xOffset]?.[y + yOffset]
        if (tile) tiles.push(tile)
      }
    }
  
    return tiles
  }
    
  
  
  
  $(document).ready(function() {
      document.getElementById('mode-toggle').addEventListener("click", function(){
        const currentTheme = document.documentElement.getAttribute('theme');
        const newTheme = currentTheme === 'light' ? 'dark':'light';
        document.documentElement.setAttribute('theme', newTheme);
      })
    
      document.getElementById('easy').addEventListener('click', function(){
        resetGame(10,10,60);
        document.querySelector('.dropdown-content').style.display = 'none';
        resetStopWatch();
      })
      document.getElementById('medium').addEventListener('click', function(){
        resetGame(40,18,40);
        document.querySelector('.dropdown-content').style.display = 'none';
        resetStopWatch();
      })
      document.getElementById('hard').addEventListener('click', function(){
        resetGame(99,24,30);
        document.querySelector('.dropdown-content').style.display = 'none';
        resetStopWatch();
      })
      document.getElementById('difficulty').addEventListener('click', function() {
        var dropdownContent = document.querySelector('.dropdown-content');
        dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
      });
      document.getElementById('reset').addEventListener('click', function() {
        resetGame(NUMBER_OF_MINES, BOARD_SIZE);
        resetStopWatch();
      });
      document.getElementById('howto').addEventListener('click', function() {
        document.querySelector('.noshow').style.display = "block";
      });
      document.getElementById('patterns').addEventListener('click', function() {
        document.querySelector('.patterns1').style.display = "flex";
        document.querySelector('.patterns2').style.display = "flex";
      });
      document.getElementById('reset-container').addEventListener('click', function() {
        boardElement.removeEventListener("click", stopProp, { capture: true });
        boardElement.removeEventListener("contextmenu", stopProp, { capture: true });
        document.getElementById('gameOver').style.display = 'none';
        resetGame(NUMBER_OF_MINES, BOARD_SIZE);
        resetStopWatch();
        messageText.textContent = "";
        messageClicks.textContent = "";
        messageTime.textContent = "";
        numClicks = 1;
      });
    });
    
    // minesweeper
    
    let BOARD_SIZE = 10
    let NUMBER_OF_MINES = 10
    
    let firstClick = true;
    let numClicks = 1;
    
    let board;
    let boardElement;
    let minesLeftText;
    let messageText;
    let messageTime;
    let messageClicks;
    
    initializeGame();
    
    function initializeGame() {
      board = createBoard(BOARD_SIZE, NUMBER_OF_MINES);
      boardElement = document.querySelector(".board");
      minesLeftText = document.querySelector("[data-mine-count]");
      messageText = document.querySelector(".game-over");
      messageTime = document.querySelector(".time");
      messageClicks = document.querySelector(".clicks");
    
    
      board.forEach(row => {
        row.forEach(tile => {
          boardElement.append(tile.element);
          tile.element.addEventListener("click", () => {
            if (firstClick) {
              handleFirstClick(tile);
            } else {
              numClicks+=1;
              revealTile(board, tile);
              checkGameEnd();
            }
          });
          tile.element.addEventListener("contextmenu", e => {
            numClicks+=1;
            e.preventDefault();
            markTile(tile);
            listMinesLeft();
          });
        });
      });
      boardElement.style.setProperty("--size", BOARD_SIZE);
      minesLeftText.textContent = NUMBER_OF_MINES;
    }
    
    function handleFirstClick(tile) {
      while (0 !== nearbyTiles(board, tile).filter(t => t.mine).length || tile.mine) {
        resetGame(NUMBER_OF_MINES, BOARD_SIZE);
        tile = board[tile.x][tile.y];
      }
      startStopWatch();
      firstClick = false;
      revealTile(board, tile);
      checkGameEnd();
    }
    
    
    
    function listMinesLeft() {
      const markedTilesCount = board.reduce((count, row) => {
        return (
          count + row.filter(tile => tile.status === TILE_STATUSES.MARKED).length
        )
      }, 0)
    
      minesLeftText.textContent = NUMBER_OF_MINES - markedTilesCount
    }
    
    function checkGameEnd() {
      const win = checkWin(board)
      const lose = checkLose(board)
    
      if (win || lose) {
        boardElement.addEventListener("click", stopProp, { capture: true })
        boardElement.addEventListener("contextmenu", stopProp, { capture: true })
        stopStopWatch();
        document.getElementById('gameOver').style.display = 'block';
        messageTime.textContent = "Your time was: " + document.getElementById('stopwatch').textContent;
        messageClicks.textContent = "Your amount of clicks was: " + numClicks
    
      }
    
      if (win) {
        messageText.textContent = "You Win!"
        document.querySelector('.game-over').style.color = "lime";
      }
      if (lose) {
        messageText.textContent = "You Lose..."
        document.querySelector('.game-over').style.color = "red";
        board.forEach(row => {
          row.forEach(tile => {
            if (tile.status === TILE_STATUSES.MARKED) markTile(tile)
            if (tile.mine) revealTile(board, tile)
          })
        })
      }
    }
    
    function stopProp(e) {
      e.stopImmediatePropagation()
    }
    
    function resetGame(numMines, boardSize) {
      firstClick = true;
      NUMBER_OF_MINES = numMines;
      BOARD_SIZE = boardSize;
      boardElement.innerHTML = "";
      initializeGame();
    }
  
    let timerInterval;
    let seconds = 0;
    let minutes = 0;
    let hours = 0;
    
    const stopwatchDisplay = document.getElementById('stopwatch');
    
    function startStopWatch() {
        timerInterval = setInterval(updateTimer, 1000);
    }
    
    function stopStopWatch() {
      clearInterval(timerInterval);
      updateDisplay();
    }
    
    function resetStopWatch() {
        clearInterval(timerInterval);
        seconds = 0;
        minutes = 0;
        hours = 0;
        updateDisplay();
    }
    
    function updateTimer() {
      seconds++;
      if (seconds === 60) {
        seconds = 0;
        minutes++;
        if (minutes === 60) {
          minutes = 0;
          hours++;
        }
      }
      updateDisplay();
    }
    
    function updateDisplay() {
      const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      const formattedHours = hours < 10 ? `0${hours}` : hours;
      stopwatchDisplay.textContent = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }