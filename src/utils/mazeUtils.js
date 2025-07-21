export function generateMaze(rows = 10, cols = 10) {
  const maze = [];
  for (let y = 0; y < rows; y++) {
    const row = [];
    for (let x = 0; x < cols; x++) {
      row.push(Math.random() > 0.2 ? 0 : 1); // 0 = path, 1 = wall
    }
    maze.push(row);
  }

  // Ensure the start and end positions are walkable
  maze[0][0] = 0;
  maze[rows - 1][cols - 1] = 0;

  return maze;
}
