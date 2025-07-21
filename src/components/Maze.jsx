import React from 'react';
import './Maze.css';

const Maze = ({ maze, playerPosition, exitPosition }) => {
  return (
    <div className="maze-container">
      {maze.map((row, y) =>
        row.map((cell, x) => {
          let className = cell === 1 ? 'cell wall' : 'cell path';
          if (x === playerPosition.x && y === playerPosition.y) {
            className = 'cell player';
          } else if (x === exitPosition.x && y === exitPosition.y) {
            className = 'cell exit';
          }
          return <div key={`${x}-${y}`} className={className} />;
        })
      )}
    </div>
  );
};

export default Maze;
