function generateMaze(rows, cols) {
  const maze = Array.from({ length: rows }, () =>
    Array(cols).fill(1)
  );

  const directions = [
    [0, -2], [0, 2],
    [-2, 0], [2, 0]
  ];

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function isValid(nx, ny) {
    return ny >= 1 && ny < rows - 1 && nx >= 1 && nx < cols - 1;
  }

  function carve(x, y) {
    maze[y][x] = 0;

    shuffle(directions);
    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;

      if (isValid(nx, ny) && maze[ny][nx] === 1) {
        maze[y + dy / 2][x + dx / 2] = 0;
        carve(nx, ny);
      }
    }
  }

  // Start from a random odd cell
  const startX = Math.floor(Math.random() * (cols / 2)) * 2 + 1;
  const startY = Math.floor(Math.random() * (rows / 2)) * 2 + 1;
  carve(startX, startY);

  // Open a few outer borders to ensure no complete enclosure
  for (let i = 0; i < cols; i++) {
    if (maze[1][i] === 0) maze[0][i] = 0;
    if (maze[rows - 2][i] === 0) maze[rows - 1][i] = 0;
  }
  for (let i = 0; i < rows; i++) {
    if (maze[i][1] === 0) maze[i][0] = 0;
    if (maze[i][cols - 2] === 0) maze[i][cols - 1] = 0;
  }

  return maze;
}

export default generateMaze;
