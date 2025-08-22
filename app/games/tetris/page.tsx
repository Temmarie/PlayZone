"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, Home } from "lucide-react";
import Link from "next/link";
import { useSound } from "../../hooks/useSound";
import { uploadScoreToSupabase } from "@/lib/syncScore";

type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";
type Cell = { filled: boolean; color: string };
type Position = { x: number; y: number };

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const TETROMINOS = {
  I: { shape: [[1, 1, 1, 1]], color: "bg-cyan-500" },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "bg-yellow-500",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: "bg-purple-500",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "bg-green-500",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "bg-red-500",
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: "bg-blue-500",
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: "bg-orange-500",
  },
};

export default function Tetris() {
  const [board, setBoard] = useState<Cell[][]>(() =>
    Array(BOARD_HEIGHT)
      .fill(null)
      .map(() =>
        Array(BOARD_WIDTH)
          .fill(null)
          .map(() => ({ filled: false, color: "" }))
      )
  );
  const [currentPiece, setCurrentPiece] = useState<{
    type: TetrominoType;
    position: Position;
    rotation: number;
  } | null>(null);
  const [nextPiece, setNextPiece] = useState<TetrominoType | null>(null);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [dropTime, setDropTime] = useState(1000);

  const { playClick, playMove, playLineClear, playGameOver } = useSound();

  useEffect(() => {
    const savedHighScore = localStorage.getItem("tetrisHighScore");
    if (savedHighScore) {
      setHighScore(Number.parseInt(savedHighScore));
    }
  }, []);

  const getRandomTetromino = (): TetrominoType => {
    const types: TetrominoType[] = ["I", "O", "T", "S", "Z", "J", "L"];
    return types[Math.floor(Math.random() * types.length)];
  };

  const rotatePiece = (shape: number[][]): number[][] => {
    const rows = shape.length;
    const cols = shape[0].length;
    const rotated = Array(cols)
      .fill(null)
      .map(() => Array(rows).fill(0));

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        rotated[j][rows - 1 - i] = shape[i][j];
      }
    }
    return rotated;
  };

  const isValidPosition = useCallback(
    (piece: any, position: Position, boardState: Cell[][]) => {
      const shape = piece.shape;
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            const newX = position.x + x;
            const newY = position.y + y;

            if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
              return false;
            }
            if (newY >= 0 && boardState[newY][newX].filled) {
              return false;
            }
          }
        }
      }
      return true;
    },
    []
  );

  const placePiece = useCallback(
    (piece: any, position: Position, boardState: Cell[][]) => {
      const newBoard = boardState.map((row) => [...row]);
      const shape = piece.shape;

      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            const boardY = position.y + y;
            const boardX = position.x + x;
            if (boardY >= 0) {
              newBoard[boardY][boardX] = { filled: true, color: piece.color };
            }
          }
        }
      }
      return newBoard;
    },
    []
  );

  const clearLines = useCallback((boardState: Cell[][]) => {
    const newBoard = boardState.filter(
      (row) => !row.every((cell) => cell.filled)
    );
    const linesCleared = BOARD_HEIGHT - newBoard.length;

    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(
        Array(BOARD_WIDTH)
          .fill(null)
          .map(() => ({ filled: false, color: "" }))
      );
    }

    return { newBoard, linesCleared };
  }, []);

  const spawnNewPiece = useCallback(() => {
    const type = nextPiece || getRandomTetromino();
    const newNextPiece = getRandomTetromino();

    const piece = {
      type,
      position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
      rotation: 0,
    };

    setCurrentPiece(piece);
    setNextPiece(newNextPiece);

    // Check game over
    const tetromino = TETROMINOS[type];
    if (!isValidPosition(tetromino, piece.position, board)) {
      setGameOver(true);
      setGameRunning(false);
      playGameOver();
    }
  }, [nextPiece, board, isValidPosition, playGameOver]);

  const dropPiece = useCallback(() => {
    if (!currentPiece || !gameRunning || gameOver) return;

    const newPosition = {
      ...currentPiece.position,
      y: currentPiece.position.y + 1,
    };
    const tetromino = TETROMINOS[currentPiece.type];

    if (isValidPosition(tetromino, newPosition, board)) {
      setCurrentPiece((prev) =>
        prev ? { ...prev, position: newPosition } : null
      );
    } else {
      // Place piece and spawn new one
      const newBoard = placePiece(tetromino, currentPiece.position, board);
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);

      if (linesCleared > 0) {
        playLineClear();
      } else {
        playMove();
      }

      setBoard(clearedBoard);
      setLines((prev) => prev + linesCleared);
      setScore((prev) => prev + linesCleared * 100 * level + 10);
      setLevel((prev) => Math.floor((lines + linesCleared) / 10) + 1);

      spawnNewPiece();
    }
  }, [
    currentPiece,
    gameRunning,
    gameOver,
    board,
    isValidPosition,
    placePiece,
    clearLines,
    lines,
    level,
    spawnNewPiece,
    playLineClear,
    playMove,
  ]);

  useEffect(() => {
    if (!gameRunning || gameOver) return;

    const interval = setInterval(dropPiece, dropTime);
    return () => clearInterval(interval);
  }, [dropPiece, dropTime, gameRunning, gameOver]);

  useEffect(() => {
    setDropTime(Math.max(100, 1000 - (level - 1) * 50));
  }, [level]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!currentPiece || !gameRunning) return;

      const tetromino = TETROMINOS[currentPiece.type];
      let newPosition = currentPiece.position;
      let newRotation = currentPiece.rotation;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          newPosition = {
            ...currentPiece.position,
            x: currentPiece.position.x - 1,
          };
          break;
        case "ArrowRight":
          e.preventDefault();
          newPosition = {
            ...currentPiece.position,
            x: currentPiece.position.x + 1,
          };
          break;
        case "ArrowDown":
          e.preventDefault();
          dropPiece();
          return;
        case "ArrowUp":
        case " ":
          e.preventDefault();
          newRotation = (currentPiece.rotation + 1) % 4;
          break;
        default:
          return;
      }

      let shape = tetromino.shape;
      for (let i = 0; i < newRotation; i++) {
        shape = rotatePiece(shape);
      }

      if (isValidPosition({ shape }, newPosition, board)) {
        playMove();
        setCurrentPiece((prev) =>
          prev
            ? { ...prev, position: newPosition, rotation: newRotation }
            : null
        );
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentPiece, gameRunning, board, isValidPosition, dropPiece, playMove]);

  useEffect(() => {
    if (gameOver && score > highScore) {
      setHighScore(score);
      localStorage.setItem("tetrisHighScore", score.toString());

      // Update global stats
      const stats = JSON.parse(
        localStorage.getItem("gameStats") ||
          '{"gamesPlayed": 0, "totalScore": 0, "bestStreak": 0}'
      );
      stats.gamesPlayed += 1;
      stats.totalScore += score;
      localStorage.setItem("gameStats", JSON.stringify(stats));
      uploadScoreToSupabase();
    }
  }, [gameOver, score, highScore]);

  const startGame = () => {
    playClick();
    setGameRunning(true);
    setGameOver(false);
    if (!currentPiece) {
      spawnNewPiece();
    }
  };

  const pauseGame = () => {
    playClick();
    setGameRunning(false);
  };

  const resetGame = () => {
    playClick();
    setBoard(
      Array(BOARD_HEIGHT)
        .fill(null)
        .map(() =>
          Array(BOARD_WIDTH)
            .fill(null)
            .map(() => ({ filled: false, color: "" }))
        )
    );
    setCurrentPiece(null);
    setNextPiece(null);
    setGameRunning(false);
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setLines(0);
    setDropTime(1000);
  };

  const renderBoard = () => {
    const displayBoard = board.map((row) => [...row]);

    // Add current piece to display
    if (currentPiece) {
      const tetromino = TETROMINOS[currentPiece.type];
      let shape = tetromino.shape;

      for (let i = 0; i < currentPiece.rotation; i++) {
        shape = rotatePiece(shape);
      }

      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            const boardY = currentPiece.position.y + y;
            const boardX = currentPiece.position.x + x;
            if (
              boardY >= 0 &&
              boardY < BOARD_HEIGHT &&
              boardX >= 0 &&
              boardX < BOARD_WIDTH
            ) {
              displayBoard[boardY][boardX] = {
                filled: true,
                color: tetromino.color,
              };
            }
          }
        }
      }
    }

    return displayBoard;
  };

  const renderNextPiece = () => {
    if (!nextPiece) return null;

    const tetromino = TETROMINOS[nextPiece];
    return (
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(4, 1fr)` }}
      >
        {Array.from({ length: 16 }).map((_, index) => {
          const x = index % 4;
          const y = Math.floor(index / 4);
          const shape = tetromino.shape;
          const isActive =
            y < shape.length && x < shape[y].length && shape[y][x];

          return (
            <div
              key={index}
              className={`w-6 h-6 rounded-sm ${
                isActive ? tetromino.color : "bg-slate-700"
              }`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tetris</h1>
          <p className="text-gray-400">
            Arrange falling blocks to clear lines!
          </p>
        </div>
        <Link href="/" className="btn-secondary flex items-center">
          <Home className="w-4 h-4 mr-2" />
          Home
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Game Board */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800 rounded-xl p-6 border border-violet-400">
            {/* Game Status */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-6">
                <div className="text-white">
                  <span className="text-gray-400">Score:</span>
                  <span className="font-bold ml-2 text-2xl text-violet-400">
                    {score}
                  </span>
                </div>
                <div className="text-white">
                  <span className="text-gray-400">Level:</span>
                  <span className="font-bold ml-2 text-blue-400">{level}</span>
                </div>
                <div className="text-white">
                  <span className="text-gray-400">Lines:</span>
                  <span className="font-bold ml-2 text-green-400">{lines}</span>
                </div>
              </div>

              {gameOver && (
                <div className="text-red-400 font-bold text-lg">Game Over!</div>
              )}
            </div>

            {/* Tetris Board */}
            <div className="bg-gray-900 rounded-lg p-4 mb-6 flex justify-center">
              <div
                className="grid gap-1"
                style={{
                  gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
                  width: "300px",
                  height: "600px",
                }}
              >
                {renderBoard()
                  .flat()
                  .map((cell, index) => (
                    <div
                      key={index}
                      className={`w-full h-full rounded-sm border border-gray-800 ${
                        cell.filled ? cell.color : "bg-slate-800"
                      }`}
                    />
                  ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center space-x-4">
              {!gameRunning && !gameOver && (
                <button
                  onClick={startGame}
                  className="btn-primary flex items-center"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </button>
              )}
              {gameRunning && (
                <button
                  onClick={pauseGame}
                  className="btn-secondary flex items-center"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </button>
              )}
              <button
                onClick={resetGame}
                className="btn-secondary flex items-center"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Next Piece */}
          <div className="bg-gray-800 rounded-xl p-6 border border-violet-400">
            <h3 className="text-lg font-bold text-white mb-4">Next Piece</h3>
            <div className="flex justify-center">{renderNextPiece()}</div>
          </div>

          {/* High Score */}
          <div className="bg-gray-800 rounded-xl p-6 border border-violet-400">
            <h3 className="text-lg font-bold text-white mb-3">High Score</h3>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {highScore}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-800 rounded-xl p-6 border border-violet-400">
            <h3 className="text-lg font-bold text-white mb-3">Controls</h3>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• ← → Move left/right</li>
              <li>• ↓ Soft drop</li>
              <li>• ↑ or SPACE Rotate</li>
              <li>• Game speeds up each level</li>
            </ul>
          </div>

          {/* Scoring */}
          <div className="bg-gray-800 rounded-xl p-6 border border-violet-400">
            <h3 className="text-lg font-bold text-white mb-3">Scoring</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• 1 Line: 100 × Level</li>
              <li>• 2 Lines: 200 × Level</li>
              <li>• 3 Lines: 300 × Level</li>
              <li>• 4 Lines: 400 × Level</li>
              <li>• Piece placed: +10</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
