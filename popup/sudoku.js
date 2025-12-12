// Grid state: 0 represents empty cell
let grid = Array(9).fill(null).map(() => Array(9).fill(0));
let selectedRow = 0;
let selectedCol = 0;

// Initialize the popup
document.addEventListener('DOMContentLoaded', () => {
  createGrid();
  loadGame();
  
  document.getElementById('newGameBtn').addEventListener('click', newGame);
  document.addEventListener('keydown', handleKeyPress);
});

// Create the 9x9 grid HTML
function createGrid() {
  const gridContainer = document.getElementById('sudokuGrid');
  gridContainer.innerHTML = '';
  
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = row;
      cell.dataset.col = col;
      
      cell.addEventListener('click', () => {
        selectedRow = row;
        selectedCol = col;
        updateSelection();
      });
      
      gridContainer.appendChild(cell);
    }
  }
  
  updateSelection();
}

// Update which cell is selected
function updateSelection() {
  document.querySelectorAll('.cell').forEach(cell => {
    cell.classList.remove('selected');
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    
    if (row === selectedRow && col === selectedCol) {
      cell.classList.add('selected');
    }
  });
}

// Render the current grid state
function renderGrid() {
  document.querySelectorAll('.cell').forEach(cell => {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    const value = grid[row][col];
    
    cell.textContent = value === 0 ? '' : value;
  });
}

// Handle keyboard input
function handleKeyPress(e) {
  // Arrow key navigation
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedRow = Math.max(0, selectedRow - 1);
    updateSelection();
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedRow = Math.min(8, selectedRow + 1);
    updateSelection();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    selectedCol = Math.max(0, selectedCol - 1);
    updateSelection();
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    selectedCol = Math.min(8, selectedCol + 1);
    updateSelection();
  }
  
  // Number input (1-9)
  const num = parseInt(e.key);
  if (num >= 1 && num <= 9) {
    grid[selectedRow][selectedCol] = num;
    renderGrid();
    saveGame();
  }
  
  // Delete/Backspace to clear cell
  if (e.key === 'Delete' || e.key === 'Backspace') {
    grid[selectedRow][selectedCol] = 0;
    renderGrid();
    saveGame();
  }
}

// Generate a new game
function newGame() {
  // TODO: Implement sudoku generation algorithm
  // For now, just clear the grid
  grid = Array(9).fill(null).map(() => Array(9).fill(0));
  renderGrid();
  saveGame();
}

// SUDOKU LOGIC

function generateSolvedRecursive(grid, selectedRow, selectedCol){
    //backtracking complete
    if(selectedRow === 8 && selectedCol === 9) {
        return true;
    }
    //if last column reached, move to next row
    if(selectedCol === 9) {
        selectedRow++;
        selectedCol = 0;
    }
    //check for empty cell, use zero as empty indicator
    if(grid[selectedRow][selectedCol] != 0) {
        return generateSolvedRecursive(grid, selectedRow, selectedCol + 1)
    }

    //insert digits
    for(let digit = 1; digit <= 9; digit++){
        //check if digit is valid to insert
        if(isDigitSafe(grid, selectedRow, selectedCol, digit)){
            grid[selectedRow][selectedCol] = digit;
            if(generateSolvedRecursive(grid, selectedRow, selectedCol)){
                return true;
            }
            grid[selectedRow][selectedCol] = 0;
        }
    }
    return false;
}

function isDigitSafe(grid, selectedRow, selectedCol, digit){
    let safe = false;

    //start by checking the 3x3
    if(validateBoxes(grid, selectedRow, selectedCol, digit)) {
        safe = true;
    }

    // check rows and columns
    if(safe && validateRows(grid, selectedRow, digit)) {
        safe = true;
    }
    if(safe && validateCols(grid, selectedCol, digit)){
        safe = true;
    }
    return safe;
}

function removeDigits(){

}

function validateBoxes(grid, selectedRow, selectedCol, digit){

}
function validateRows(grid, selectedRow, digit){}
function validateCols(){grid, selectedCol, digit}

// SAVE STATE HANDLING

// Save game state to browser storage
function saveGame() {
  browser.storage.local.set({
    grid: grid,
    selectedRow: selectedRow,
    selectedCol: selectedCol
  });
}

// Load game state from browser storage
function loadGame() {
  browser.storage.local.get(['grid', 'selectedRow', 'selectedCol']).then(result => {
    if (result.grid) {
      grid = result.grid;
      selectedRow = result.selectedRow || 0;
      selectedCol = result.selectedCol || 0;
      renderGrid();
      updateSelection();
    }
  });
}