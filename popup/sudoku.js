// Grid state: 0 represents empty cell
let grid = Array(9).fill(null).map(() => Array(9).fill(0));
let givenCells = Array(9).fill(null).map(() => Array(9).fill(false)); // Track which cells are part of the puzzle
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
    
    // Style given cells vs user input
    cell.classList.remove('given', 'user-input', 'error');
    if (value !== 0) {
      if (givenCells[row][col]) {
        cell.classList.add('given');
      } else {
        cell.classList.add('user-input');
        // Check if this cell creates a conflict
        if (hasCellConflict(row, col)) {
          cell.classList.add('error');
        }
      }
    }
  });
}

// Check if a cell has any conflicts (duplicates in row/col/box)
//TODO would prefer to only show error when cell/row/column is filled
function hasCellConflict(row, col) {
  const value = grid[row][col];
  if (value === 0) return false;
  
  // Check row for duplicates
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row][c] === value) {
      return true;
    }
  }
  
  // Check column for duplicates
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r][col] === value) {
      return true;
    }
  }
  
  // Check 3x3 box for duplicates
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const r = startRow + i;
      const c = startCol + j;
      if ((r !== row || c !== col) && grid[r][c] === value) {
        return true;
      }
    }
  }
  
  return false;
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

  // Only allow input in non-given cells
  if (givenCells[selectedRow][selectedCol]) {
    return;
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
  //start by generating a completely solved, valid grid
  grid = Array(9).fill(null).map(() => Array(9).fill(0));
  generateSolvedGrid(grid);

  //remove most digits to create the actual puzzle
  const digitsToKeep = 20 + Math.floor(Math.random() * 6); // 20-25 cells
  createPuzzle(grid, digitsToKeep);

  renderGrid();
  saveGame();
}

function generateSolvedGrid(grid) {
  generateSolvedRecursive(grid, 0, 0);
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
  if(grid[selectedRow][selectedCol] !== 0) {
      return generateSolvedRecursive(grid, selectedRow, selectedCol + 1)
  }

  const validDigits = [1,2,3,4,5,6,7,8,9];
  shuffleArray(validDigits);

  //insert digits
  for (let digit of validDigits) {
    if (isDigitSafe(grid, selectedRow, selectedCol, digit)) {
      grid[selectedRow][selectedCol] = digit;
      
      if (generateSolvedRecursive(grid, selectedRow, selectedCol + 1)) {
        return true;
      }
      
      grid[selectedRow][selectedCol] = 0;
    }
  }
  
  return false;
}

function isDigitSafe(grid, selectedRow, selectedCol, digit){
  const subGridSafe = validateSubGrid(grid, selectedRow, selectedCol, digit);
  const rowSafe = validateRows(grid, selectedRow, digit);
  const colSafe = validateCols(grid, selectedCol, digit);
  
  return subGridSafe && rowSafe && colSafe;
}

function validateSubGrid(grid, selectedRow, selectedCol, digit){
  const startingRow = selectedRow - (selectedRow % 3);
  const startingCol = selectedCol - (selectedCol % 3);
  let isValid = true;

  for(let i = 0; i < 3; i++){
    for(let j = 0; j < 3; j++){
      if(grid[startingRow + i][startingCol + j] === digit){
        isValid = false;
      }
    }
  }
  return isValid;
}

function validateRows(grid, selectedRow, digit){
  let isValid = true;
  for(let y = 0; y < 9; y++){
    if(grid[selectedRow][y] === digit){
      isValid = false;
    }
  }
  return isValid;
}

function validateCols(grid, selectedCol, digit){
  let isValid = true;
  for(let x = 0; x < 9; x++){
    if(grid[x][selectedCol] === digit){
      isValid = false;
    }
  }
  return isValid;
}

// PUZZLE LOGIC

function createPuzzle(grid, digitsToKeep) {
  //reset given/preset cells
  givenCells = Array(9).fill(null).map(() => Array(9).fill(false));
  
  //push all positions to array
  const positions = [];
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      positions.push([i, j]);
    }
  }
  
  //shuffle and keep only positions of preset digits
  shuffleArray(positions);
  
  for (let i = 0; i < digitsToKeep; i++) {
    const [pRow, pCol] = positions[i];
    givenCells[pRow][pCol] = true;
  }
  
  //remove numbers that arent given
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (!givenCells[row][col]) {
        grid[row][col] = 0;
      }
    }
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// SAVE STATE HANDLING

// Save game state to browser storage
function saveGame() {
  browser.storage.local.set({
    grid: grid,
    givenCells: givenCells,
    selectedRow: selectedRow,
    selectedCol: selectedCol
  });
}

// Load game state from browser storage
function loadGame() {
  browser.storage.local.get(['grid', 'givenCells', 'selectedRow', 'selectedCol']).then(result => {
    if (result.grid) {
      grid = result.grid;
      givenCells = result.givenCells || Array(9).fill(null).map(() => Array(9).fill(false));
      selectedRow = result.selectedRow || 0;
      selectedCol = result.selectedCol || 0;
      renderGrid();
      updateSelection();
    } else {
      // No saved game, generate a new one
      newGame();
    }
  });
}