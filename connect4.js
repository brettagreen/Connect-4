/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

const WIDTH = 7;
const HEIGHT = 6;

let currPlayer = 1; // active player: 1 or 2
const board = []; // array of rows, each row is array of cells  (board[y][x])

/** makeBoard: create in-JS board structure:
 *    board = array of rows, each row is array of cells  (board[y][x])
 */

function makeBoard() {
  for (let x = 0; x < WIDTH; x++) {
    board[x] = [];
    for (let y = 0; y < HEIGHT; y++) {
      board[x][y] = undefined;
    }
  }
}

/** makeHtmlBoard: make HTML table and row of column tops. */

function makeHtmlBoard() {
  //create table row on top of board which is responsive to clicks.
  //clicking on a cell will drop a piece in that respective column
  const htmlBoard = document.querySelector('#board');
  const top = document.createElement("tr");
  top.setAttribute("id", "column-top");
  top.addEventListener("click", handleClick);

  //create top table row w/ # of td cells based on WIDTH value
  //append to <table> element
  for (let x = 0; x < WIDTH; x++) {
    const headCell = document.createElement("td");
    headCell.setAttribute("id", x);
    top.append(headCell);
  }
  htmlBoard.append(top);

  //create 2d array of td cells which comprise the game board
  //append to <table> element
  for (let x = 0; x < HEIGHT; x++) {
    const row = document.createElement("tr");
    for (let y = 0; y < WIDTH; y++) {
      const cell = document.createElement("td");
      cell.setAttribute("id", `${y}-${x}`);
      row.append(cell);
    }
    htmlBoard.append(row);
  }
}


function findSpotForCol(x) {
  //since game pieces need to fall to the lowest unnoccupied tile,
  //so we start our loop at the highest y index and work our way toward 0.
  //for the column that the player clicked on (value x), get the corresponding
  //element in that column that does not have any child nodes: document.getElementById(`${x}-${y}`
  //elements that don't have any child nodes are unnoccupied by a game piece.
  //if all pieces in a column are occupied, throw a custom error.
  for (let y = HEIGHT - 1; y >= 0; y--) {
      const square = document.getElementById(`${x}-${y}`);
      if (!square.hasChildNodes()) {
        return y;
      }
  }
  throw "no tiles available in vertical.";
}

/** placeInTable: update DOM to place piece into HTML table of board */

function placeInTable(y, x) {
  //make a div for each piece and insert into correct table cell
  const piece = document.createElement('div');
  piece.classList.add(currPlayer === 1 ? 'player1' : 'player2');
  piece.classList.add('piece');
  const cell = document.getElementById(`${y}-${x}`);
  if (cell != null) cell.append(piece);
  return cell;
}

//endGame: announce game end 
//reset game board
function endGame(msg) {
  alert(msg);
  
  //reset game board
  currPlayer = 1;
  const trs = document.querySelectorAll('tr');
  for (const tr of trs) {
    tr.remove();
  }
  makeBoard()
  makeHtmlBoard();
}

/** handleClick: handle click of column top to play piece */
  function handleClick(evt) {

    //get column from ID of clicked cell
    const column = evt.target.id;

    //get next spot in column (if none, ignore click)
    let y;
    try { 
      y = findSpotForCol(column);
    } catch (err) {
      console.log(err);
    }

    if (y === null) {
      return;
    }

    //mark board[][] value w/ value of currPlayer.
    //this is needed to correctly determine a game winner
    board[column][y] = currPlayer;

    //place piece in board and add to HTML table
    const cell = placeInTable(column, y);

    if (cell != null) {
        const allTDs = Array.from(document.querySelectorAll('td')).splice(7); //all table td elements, header row removed
        const filled = allTDs.every(val => val.hasChildNodes());

        //console.log('filled'.concat(` ${ filled}`));
        
        //if etire board is filled and there's no winner, announce tie and don't process any further event code
        if (filled) {
          endGame('We have a tie!');
        }
        
        //check for win
        if (checkForWin()) {
            setTimeout(() => {
              endGame(`Player ${currPlayer === 1 ? 2: 1} won!`);
            }, 500)
        };
        //switch players after each turn
        currPlayer = currPlayer === 1 ? 2: 1;
      }
}

/** checkForWin: check board cell-by-cell for "does a win start here?" */
function checkForWin() {
  function _win(cells) {
    // Check four cells to see if they're all color of current player
    //  - cells: list of four (y, x) cells
    //  - returns true if all are legal coordinates & all match currPlayer
    console.log(cells);
    return cells.every(
      ([y, x]) =>
        y >= 0 &&
        y < HEIGHT &&
        x >= 0 &&
        x < WIDTH &&
        board[x][y] === currPlayer
    );
  }

  //captures 4 board values - i.e. [x, y] - for diag left, diag right, vert, horiz
  //to check for winning combos. the [[x,y],[x,y],[x,y],[x,y]] array is passed to _win
  //which then sees if all four subarrays in any given array match the value (1,2) of 
  //the current player variable.

  for (var y = 0; y < HEIGHT; y++) {
    for (var x = 0; x < WIDTH; x++) {
      const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
      const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
      const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
      const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

      if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
        return true;
      }
    }
  }
}

makeBoard();
makeHtmlBoard();
