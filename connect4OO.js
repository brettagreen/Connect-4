/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

class Player {
  constructor(color) {
    //validation code courtesy of https://thewebdev.info/2022/01/19/how-to-check-if-string-is-valid-css-color-with-javascript/
    //works with hex, too!
    if (CSS.supports('color', color)) {
      this.color = color;
    }
  }
}

class ComputerPlayer {
  constructor() {
    this.color = `rgb(${Math.round(Math.random()*256)}, ${Math.round(Math.random()*256)}, ${Math.round(Math.random()*256)})`;
  }
}

class Game {
    constructor(width, height, playerArray) {
      if (Number.isFinite(width) && width > 0 && width < 100) {
          this.WIDTH = width != undefined ? width : 7;
      }
      if (Number.isFinite(height) && height > 0 && height < 100) {
          this.HEIGHT = height != undefined ? height: 6;
      }
      this.board = [];
      this.playerArray = playerArray;
      this.currPlayer = playerArray[0];
      this.makeVirtualBoard();
      this.makeHtmlBoard();
      console.log(this.playerArray);
    }
    //let currPlayer = 1; // active player: 1 or 2
    //const board = []; // array of rows, each row is array of cells  (board[y][x])
    
    /** makeBoard: create in-JS board structure:
      *    board = array of rows, each row is array of cells  (board[y][x])
      */
    
    makeVirtualBoard() {
      for (let x = 0; x < this.WIDTH; x++) {
        this.board[x] = [];
        for (let y = 0; y < this.HEIGHT; y++) {
          this.board[x][y] = undefined;
        }
      }
    }

      /** checkForWin: check board cell-by-cell for "does a win start here?" */
    checkForWin() {
      function _win(cells) {
        // Check four cells to see if they're all color of current player
        //  - cells: list of four (y, x) cells
        //  - returns true if all are legal coordinates & all match currPlayer
        return cells.every(
          ([y, x]) =>
            y >= 0 &&
            y < this.HEIGHT &&
            x >= 0 &&
            x < this.WIDTH &&
            this.board[x][y] === this.currPlayer.color
        );
      }
    
      //captures 4 board values - i.e. [x, y] - for diag left, diag right, vert, horiz
      //to check for winning combos. the [[x,y],[x,y],[x,y],[x,y]] array is passed to _win
      //which then sees if all four subarrays in any given array match the value (1,2) of 
      //the current player variable.
    
      for (var y = 0; y < this.HEIGHT; y++) {
        for (var x = 0; x < this.WIDTH; x++) {
          const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
          const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
          const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
          const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];
    
          if (_win.call(this,horiz) || _win.call(this,vert) || _win.call(this,diagDR) || _win.call(this,diagDL)) {
            return true;
          }
        }
      }
    }
    
    /** makeHtmlBoard: make HTML table and row of column tops. */
    
    makeHtmlBoard() {
      //create table row on top of board which is responsive to clicks.
      //clicking on a cell will drop a piece in that respective column
      const htmlBoard = document.querySelector('#board');
      const top = document.createElement("tr");
      top.setAttribute("id", "column-top");
      top.addEventListener("click", this.handleClick.bind(this));
    
      //create top table row w/ # of td cells based on WIDTH value
      //append to <table> element
      for (let x = 0; x < this.WIDTH; x++) {
        const headCell = document.createElement("td");
        headCell.setAttribute("id", x);
        top.append(headCell);
      }

      htmlBoard.append(top);
      //create 2d array of td cells which comprise the game board
      //append to <table> element
      for (let x = 0; x < this.HEIGHT; x++) {
        const row = document.createElement("tr");
        for (let y = 0; y < this.WIDTH; y++) {
          const cell = document.createElement("td");
          cell.setAttribute("id", `${y}-${x}`);
          row.append(cell);
        }
        htmlBoard.append(row);
      }
    }
    
    
    findSpotForCol(x) {
      //since game pieces need to fall to the lowest unnoccupied tile,
      //so we start our loop at the highest y index and work our way toward 0.
      //for the column that the player clicked on (value x), get the corresponding
      //element in that column that does not have any child nodes: document.getElementById(`${x}-${y}`
      //elements that don't have any child nodes are unnoccupied by a game piece.
      //if all pieces in a column are occupied, throw a custom error.
      for (let y = this.HEIGHT - 1; y >= 0; y--) {
          const square = document.getElementById(`${x}-${y}`);
          if (!square.hasChildNodes()) {
            return y;
          }
      }
      throw "no tiles available in vertical.";
    }
    
    /** placeInTable: update DOM to place piece into HTML table of board */
    
    placeInTable(y, x) {
      //make a div for each piece and insert into correct table cell
      const piece = document.createElement('div');

      for (let x= 0; x < this.playerArray.length; x++) {
        if (this.currPlayer === this.playerArray[x]) {
          piece.style.backgroundColor = this.playerArray[x].color;
          break;
        }
      }

      piece.classList.add('piece');
      const cell = document.getElementById(`${y}-${x}`);
      if (cell != null) cell.append(piece);
      return cell;
    }
    
    //endGame: announce game end 
    //reset game board
    endGame(msg) {
      console.log('here');
      alert(msg);
      
      //reset game board
      const trs = document.querySelectorAll('tr');
      for (const tr of trs) {
        tr.remove();
      }
      
    }
    
    /** handleClick: handle click of column top to play piece */
      handleClick(evt) {
        console.log(evt);
    
        //get column from ID of clicked cell
        const column = evt.target.id;
    
        //get next spot in column (if none, ignore click)
        let y;
        try { 
          y = this.findSpotForCol(column);
        } catch (err) {
          console.log(err);
        }
    
        if (y === null) {
          return;
        }
    
        //mark board[][] value w/ value of currPlayer.
        //this is needed to correctly determine a game winner
        this.board[column][y] = this.currPlayer.color;
    
        //place piece in board and add to HTML table
        const cell = this.placeInTable(column, y);
    
        if (cell != null) {
            const allTDs = Array.from(document.querySelectorAll('td')).splice(this.WIDTH); //all table td elements, header row removed
            const filled = allTDs.every(val => val.hasChildNodes());
    
            //console.log('filled'.concat(` ${ filled}`));
            
            //if etire board is filled and there's no winner, announce tie and don't process any further event code
            if (filled) {
              this.endGame('We have a tie!');
            }
            
            //check for win
            if (this.checkForWin()) {
                setTimeout(() => {
                  for (let x = 0; x < this.playerArray.length; x++) {
                    if (this.currPlayer === this.playerArray[x]) {
                      this.endGame(`Player${x+1} won!`);
                    }
                  }                  
                }, 300)
            };
            //switch players after each turn
            for (let x = 0; x < this.playerArray.length; x++) {
              if (this.currPlayer === this.playerArray[x]) {
                if (x + 1 === this.playerArray.length) {
                  this.currPlayer = this.playerArray[0];
                } else {
                  this.currPlayer = this.playerArray[x+1];
                }
                break;
              }
            }
            if (this.currPlayer instanceof ComputerPlayer) {
              while(true) {
                  let column = Math.round(Math.random()*(this.WIDTH-1));
                  console.log(column)
                  for (y=0; y<this.HEIGHT; y++) {
                    console.log(document.getElementById(`${column}-${y}`));
                    if (!document.getElementById(`${column}-${y}`).hasChildNodes()) {
                        document.getElementById(column).click();
                        return false;
                    }
                  }
              }
            }
          }
      }
  }

document.getElementById('start').addEventListener('click', function(e) {
    e.preventDefault();

    const inputs = document.querySelectorAll('#colorForm input');
    const playerArray = [];
    inputs.forEach(val => {
      playerArray.push(new Player(val.value));
    });
    if (playerArray.length === 1) {
      playerArray.push(new ComputerPlayer());
    }
    new Game(6, 7, playerArray);
});

document.getElementById('playersForm').addEventListener('change', function() {
  const startButton = document.getElementById('start');
  const parent = startButton.parentElement;
  const inputs = document.querySelectorAll('.colorbox');
  const spans = document.querySelectorAll('.colorbox-text');

  let currInputs = inputs.length;
  let currSpans = spans.length;

  if (currInputs > numPlayers.value) {
    for (let x = currInputs - 1; x > numPlayers.value - 1; x--) {
      inputs[x].remove();
      spans[x].remove();
    }

  } else if (currInputs < numPlayers.value || currInputs === numPlayers.value) {
      for (let x = currInputs; x < numPlayers.value; x++) {
        const input = document.createElement('input');
        const span = document.createElement('span');
        span.classList.add('colorbox-text');
        span.innerText = `Player${x+1}:`
        input.setAttribute('type', 'color');
        input.setAttribute('id', `player${x+1}`);
        input.classList.add('colorbox');
        parent.insertBefore(span, startButton);
        parent.insertBefore(input, startButton);
      }
  } 

  colorInputs.style.visibility = 'visible'
});

const numPlayers = document.querySelector('#numPlayers');
const colorInputs = document.querySelector('#colorForm');