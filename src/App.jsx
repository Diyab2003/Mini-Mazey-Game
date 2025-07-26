import React, { useState, useEffect, useRef } from 'react'; 
import * as Tone from 'tone'; // Import Tone.js for sound effects
import "./components/maze.css"; 


// --- Maze Dimensions ---

const MAZE_GRID_HEIGHT = 21; // Must be odd (e.g., 21 rows for a good size)
const MAZE_GRID_WIDTH = 21;  

// --- Helper function for generating the maze using Recursive Backtracking (DFS) ---
const generateMaze = (rows, cols, startRow, startCol, endRow, endCol) => {
    // Initialize grid with all walls (1)
    const maze = Array(rows).fill(null).map(() => Array(cols).fill(1));

    // Directions for carving paths (row, col) - moves 2 steps at a time
    const directions = [
        [-2, 0], // Up
        [2, 0],  // Down
        [0, -2], // Left
        [0, 2]   // Right
    ];

    // Stack for DFS (Depth-First Search)
    const stack = [];

    
    const initialRow = startRow % 2 === 0 ? startRow + 1 : startRow;
    const initialCol = startCol % 2 === 0 ? startCol + 1 : startCol; 

    stack.push([initialRow, initialCol]);
    maze[initialRow][initialCol] = 0; 

    while (stack.length > 0) {
        const [currentRow, currentCol] = stack[stack.length - 1]; 

        const unvisitedNeighbors = [];

        // Find unvisited neighbors (2 steps away, i.e., across a wall)
        for (const [dr, dc] of directions) {
            const neighborRow = currentRow + dr;
            const neighborCol = currentCol + dc;

            // Check boundaries and if the neighbor cell is currently a wall
            if (neighborRow > 0 && neighborRow < rows - 1 &&
                neighborCol > 0 && neighborCol < cols - 1 &&
                maze[neighborRow][neighborCol] === 1
            ) {
                unvisitedNeighbors.push([neighborRow, neighborCol]);
            }
        }

        if (unvisitedNeighbors.length > 0) {
            // Pick a random unvisited neighbor
            const randomIndex = Math.floor(Math.random() * unvisitedNeighbors.length);
            const [nextRow, nextCol] = unvisitedNeighbors[randomIndex];

            // Carve path (current cell to neighbor)
            // This means turning the wall cell between them into a path (0)
            maze[nextRow][nextCol] = 0; // Mark the neighbor as path
            // Mark the cell in between as path (the "carved" wall)
            maze[currentRow + (nextRow - currentRow) / 2][currentCol + (nextCol - currentCol) / 2] = 0;

            stack.push([nextRow, nextCol]); // Move to the next cell
        } else {
            stack.pop(); // Backtrack if no unvisited neighbors
        }
    }

    // Ensure the actual player start and exit points are marked correctly as 'P' and 'E'
    // These cells should already be paths due to the generation algorithm
    maze[startRow][startCol] = 'P'; // Player start
    maze[endRow][endCol] = 'E';     // Exit

    return maze;
};


function App() {
    const [maze, setMaze] = useState([]);
    const [score, setScore] = useState(0);
    const [playerPos, setPlayerPos] = useState({ row: 0, col: 0 });
    const [exitPosition, setExitPosition] = useState({ row: 0, col: 0 });
    const [level, setLevel] = useState(1); // State for current level
    const [isTransitioning, setIsTransitioning] = useState(false); // NEW: State for level transition animation
    const [transitionMessage, setTransitionMessage] = useState(''); // NEW: Message for transition screen


    const [gems, setGems] = useState([]); // State to store gem positions

    // NEW: Tone.js Players for sound effects
    const gemCollectSound = useRef(null);
    const winSound = useRef(null);
    const backgroundMusic = useRef(null); 

    useEffect(() => {
        // Initialize Tone.js Players once with direct public paths
        // IMPORTANT: These paths assume files are in your project's public folder
        gemCollectSound.current = new Tone.Player("/game_award_bonus_.mp3").toDestination();
        winSound.current = new Tone.Player("/game_orchestral_win_.mp3").toDestination();
        // Example of looping background music (uncomment if you want to add it)
        // backgroundMusic.current = new Tone.Player({
        //     url: "/crowd-cheer.wav", // Use direct public path
        //     loop: true,
        //     autostart: false
        // }).toDestination();

        return () => {
            // Dispose of players on unmount
            if (gemCollectSound.current) gemCollectSound.current.dispose();
            if (winSound.current) winSound.current.dispose();
            if (backgroundMusic.current) backgroundMusic.current.dispose();
          };
        }, []);


    // Function to get a random odd coordinate within bounds
    const getRandomOddCoordinate = (max) => {
        let coord = Math.floor(Math.random() * (max - 2)) + 1;
        return coord % 2 === 0 ? coord + 1 : coord;
    };

    // Function to find valid adjacent moves from a given position (no longer needed for scanning)
    // const getValidAdjacentMoves = (currentMaze, currentRow, currentCol) => { ... };


    // Function to initialize/reset the game for a new level or new game
    const initializeGame = (newLevel = 1) => { // Added newLevel parameter

        let startRow, startCol, endRow, endCol;
        const MIN_DISTANCE = Math.floor(MAZE_GRID_HEIGHT / 3); // Define minimum distance (e.g., 1/3 of maze height)

        do {
            startRow = getRandomOddCoordinate(MAZE_GRID_HEIGHT);
            startCol = getRandomOddCoordinate(MAZE_GRID_WIDTH);
            
            // NEW: Generate exit position on an outer edge
            const side = Math.floor(Math.random() * 4); // 0:top, 1:bottom, 2:left, 3:right
            if (side === 0) { // Top edge
                endRow = 1;
                endCol = getRandomOddCoordinate(MAZE_GRID_WIDTH);
            } else if (side === 1) { // Bottom edge
                endRow = MAZE_GRID_HEIGHT - 2;
                endCol = getRandomOddCoordinate(MAZE_GRID_WIDTH);
            } else if (side === 2) { // Left edge
                endRow = getRandomOddCoordinate(MAZE_GRID_HEIGHT);
                endCol = 1;
            } else { // Right edge
                endRow = getRandomOddCoordinate(MAZE_GRID_HEIGHT);
                endCol = MAZE_GRID_WIDTH - 2;
            }

            // Calculate Manhattan distance
            const distance = Math.abs(startRow - endRow) + Math.abs(startCol - endCol);

            // Ensure start and end are not the same AND are sufficiently far apart
            if (startRow === endRow && startCol === endCol) {
                continue; // Regenerate if same point
            }
            if (distance < MIN_DISTANCE) {
                continue; // Regenerate if too close
            }
            break; // Exit loop if conditions met
        } while (true); // Loop indefinitely until valid points are found


        const generatedMaze = generateMaze(
            MAZE_GRID_HEIGHT,
            MAZE_GRID_WIDTH,
            startRow,
            startCol,
            endRow,
            endCol
        );
        setMaze(generatedMaze);
        setPlayerPos({ row: startRow, col: startCol });
        setExitPosition({ row: endRow, col: endCol });
        
        if (newLevel === 1) { // Only reset score to 0 if starting a brand new game
            setScore(0);
        }
        setLevel(newLevel); // Update level state

        // Place gems randomly
        const newGems = [];
        const numGems = 5 + (newLevel - 1) * 2; // More gems for higher levels
        let placedGems = 0;
        while (placedGems < numGems) {
            const gemRow = getRandomOddCoordinate(MAZE_GRID_HEIGHT);
            const gemCol = getRandomOddCoordinate(MAZE_GRID_WIDTH);

            // Ensure gem is on a path and not on start/end/another gem
            const isPath = generatedMaze[gemRow][gemCol] !== 1;
            const isNotStart = !(gemRow === startRow && gemCol === startCol);
            const isNotEnd = !(gemRow === endRow && gemCol === endCol);
            const isNotAlreadyGem = newGems.some(g => g.row === gemRow && g.col === gemCol);

            if (isPath && isNotStart && isNotEnd && !isNotAlreadyGem) {
                newGems.push({ row: gemRow, col: gemCol });
                placedGems++;
            }
        }
        setGems(newGems);

    };

    useEffect(() => {
        initializeGame(); // Initialize game on component mount
        // Cleanup interval on component unmount (REMOVED)
        // return () => { if (scanIntervalRef.current) { clearInterval(scanIntervalRef.current); } };
    }, []);

    // --- Game Logic for Player Movement (Arrow Keys) ---
    const handleKeyDown = (e) => {
        // Only allow movement if the maze has been generated
        if (!maze.length) return;

        let newRow = playerPos.row;
        let newCol = playerPos.col;

        // Determine new position based on arrow key pressed
        switch (e.key) {
            case 'ArrowUp': newRow--; break;
            case 'ArrowDown': newRow++; break;
            case 'ArrowLeft': newCol--; break;
            case 'ArrowRight': newCol++; break;
            default: return; // Ignore other key presses
        }

        // --- Collision Detection and Boundary Check ---
        // Check if the new position is within the maze boundaries
        // And if the new position is not a wall (cell type 1)
        if (newRow >= 0 && newRow < maze.length &&
            newCol >= 0 && newCol < maze[0].length &&
            maze[newRow][newCol] !== 1
        ) {
            setPlayerPos({ row: newRow, col: newCol }); // Update player's position

            // Check for gem collection
            const collectedGemIndex = gems.findIndex(gem => gem.row === newRow && gem.col === newCol); // Check new position
            if (collectedGemIndex !== -1) {
                setScore(prevScore => prevScore + 5); // Gems add 5 
                setGems(prevGems => prevGems.filter((_, index) => index !== collectedGemIndex)); // Remove collected gem
                if (gemCollectSound.current && gemCollectSound.current.loaded) { // Play gem sound if loaded
                    gemCollectSound.current.start();
                }
            }

            // --- Win Condition Check ---
            // NEW: Win condition requires collecting all gems AND reaching the exit
            if (newRow === exitPosition.row && newCol === exitPosition.col) {
                if (gems.length === 0) { // Check if all gems are collected
                    // Trigger confetti
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    });

                    // Start transition animation
                    setTransitionMessage(`Level ${level} Complete! Preparing Level ${level + 1}...`);
                    setIsTransitioning(true);
                    
                    setScore(prevScore => prevScore + 10); // Win adds 10 points
                    if (winSound.current && winSound.current.loaded) { // Play win sound if loaded
                        winSound.current.start();
                    }
                    
                    // Delay initialization of next level until transition animation is almost complete
                    setTimeout(() => {
                        initializeGame(level + 1);
                        // After initializing, start fade-out of transition screen
                        setTimeout(() => {
                            setIsTransitioning(false);
                        }, 1000); // Duration of fade-out for transition screen
                    }, 1500); // Total duration of transition (fade-in + slight pause)
                } else {
                    // Player reached exit but hasn't collected all gems
                    // FIX: Use console.log instead of alert for non-blocking message
                    console.log(`Collect all ${gems.length} gems before reaching the exit!`);
                }
            }
        }
    };

    // --- Event Listener for Key Presses ---
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [playerPos, maze, exitPosition, gems, level, isTransitioning]); // Added gems to dependencies

    // --- Dynamic Grid Row Styling ---
    const mazeContainerStyle = {
        gridTemplateRows: `repeat(${maze.length}, 1fr)`
    };

    return (
        <div className="overall-game-wrapper"> {/* New wrapper for entire game content */}
            <h1 className="game-title">One Tap Trails</h1> {/* Updated title */}
            
            {/* Score display moved to score-display-right */}
            <div className="score-display-right">Score: {score}</div>

            <div className="main-layout-wrapper"> {/* Wrapper for game-container and instructions */}
                <div className="game-container"> {/* Main game box */}
                    <div className="maze-container" style={mazeContainerStyle}>
                        {/* Render each cell of the maze */}
                        {maze.map((row, rowIndex) =>
                            row.map((cellType, colIndex) => {
                                let cellClass = 'cell';
                                const isGem = gems.some(gem => gem.row === rowIndex && gem.col === colIndex); // Check if current cell has a gem

                                // Determine base class (wall or path)
                                if (cellType === 1) { // Wall cell
                                    cellClass += ' wall';
                                } else { // Path cell
                                    cellClass += ' path';
                                }

                                // Apply player, exit, or highlight classes
                                if (rowIndex === playerPos.row && colIndex === playerPos.col) { // Player's current position
                                    cellClass += ' player';
                                } else if (rowIndex === exitPosition.row && colIndex === exitPosition.col) { // Exit position
                                    cellClass += ' exit'; // No extra space needed if it's the last class
                                } else if (isGem) { // Render gem if present
                                    // If it's a gem, ensure its class is added
                                    cellClass += ' gem';
                                }
                                
                                // Return a div for each cell with its calculated class
                                return (
                                    <div key={`${rowIndex}-${colIndex}`} className={cellClass}>
                                        {isGem && ( // Only render SVG if it's a gem
                                            <svg className="gem-svg" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 2L6 8L12 14L18 8L12 2Z" fill="#FFD700"/>
                                                <path d="M12 14L6 18L12 22L18 18L12 14Z" fill="#FFA500"/>
                                            </svg>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="instructions-area-right"> {/* Instructions area on the right */}
                    <p>Use Arrow Keys to Move!</p> {/* Reverted instruction */}
                    <button className="reset-button" onClick={() => initializeGame(1)}>Play Again</button> {/* Reset to level 1 */}
                </div>
            </div>

            {/* NEW: Level Transition Overlay */}
            {isTransitioning && (
                <div className="level-transition-overlay">
                    <p>{transitionMessage}</p>
                </div>
            )}
        </div>
    );
}

export default App;
