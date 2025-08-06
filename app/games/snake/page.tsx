"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, Home, Users, User } from "lucide-react";
import Link from "next/link";
import { useSound } from "../../hooks/useSound";

type Position = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type GameMode = "single" | "multiplayer";

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_FOOD = { x: 15, y: 15 };
const INITIAL_DIRECTION = "RIGHT";

export default function Snake() {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [snake2, setSnake2] = useState<Position[]>([{ x: 5, y: 5 }]);
  const [food, setFood] = useState<Position>(INITIAL_FOOD);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [direction2, setDirection2] = useState<Direction>("LEFT");
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [score2, setScore2] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(150);
  const [gameMode, setGameMode] = useState<GameMode>("single");
  const [winner, setWinner] = useState<string | null>(null);

  const { playMove, playEat, playGameOver, playSuccess, playClick } =
    useSound();

  useEffect(() => {
    const savedHighScore = localStorage.getItem("snakeHighScore");
    if (savedHighScore) {
      setHighScore(Number.parseInt(savedHighScore));
    }
  }, []);

  const generateFood = useCallback((): Position => {
    let newFood: Position;
    const allSnakePositions =
      gameMode === "multiplayer" ? [...snake, ...snake2] : snake;

    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (
      allSnakePositions.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      )
    );
    return newFood;
  }, [snake, snake2, gameMode]);

  const moveSnake = useCallback(() => {
    if (!gameRunning || gameOver) return;

    setSnake((currentSnake) => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };

      switch (direction) {
        case "UP":
          head.y -= 1;
          break;
        case "DOWN":
          head.y += 1;
          break;
        case "LEFT":
          head.x -= 1;
          break;
        case "RIGHT":
          head.x += 1;
          break;
      }

      // Check wall collision
      if (
        head.x < 0 ||
        head.x >= GRID_SIZE ||
        head.y < 0 ||
        head.y >= GRID_SIZE
      ) {
        setGameOver(true);
        setGameRunning(false);
        if (gameMode === "multiplayer") {
          setWinner("Player 2");
        }
        playGameOver();
        return currentSnake;
      }

      // Check self collision
      if (
        newSnake.some((segment) => segment.x === head.x && segment.y === head.y)
      ) {
        setGameOver(true);
        setGameRunning(false);
        if (gameMode === "multiplayer") {
          setWinner("Player 2");
        }
        playGameOver();
        return currentSnake;
      }

      // Check collision with other snake in multiplayer
      if (
        gameMode === "multiplayer" &&
        snake2.some((segment) => segment.x === head.x && segment.y === head.y)
      ) {
        setGameOver(true);
        setGameRunning(false);
        setWinner("Player 2");
        playGameOver();
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore((prev) => prev + 10);
        setFood(generateFood());
        setSpeed((prev) => Math.max(prev - 2, 80));
        playEat();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });

    // Move second snake in multiplayer mode
    if (gameMode === "multiplayer") {
      setSnake2((currentSnake2) => {
        const newSnake2 = [...currentSnake2];
        const head2 = { ...newSnake2[0] };

        switch (direction2) {
          case "UP":
            head2.y -= 1;
            break;
          case "DOWN":
            head2.y += 1;
            break;
          case "LEFT":
            head2.x -= 1;
            break;
          case "RIGHT":
            head2.x += 1;
            break;
        }

        // Check wall collision for snake 2
        if (
          head2.x < 0 ||
          head2.x >= GRID_SIZE ||
          head2.y < 0 ||
          head2.y >= GRID_SIZE
        ) {
          setGameOver(true);
          setGameRunning(false);
          setWinner("Player 1");
          playGameOver();
          return currentSnake2;
        }

        // Check self collision for snake 2
        if (
          newSnake2.some(
            (segment) => segment.x === head2.x && segment.y === head2.y
          )
        ) {
          setGameOver(true);
          setGameRunning(false);
          setWinner("Player 1");
          playGameOver();
          return currentSnake2;
        }

        // Check collision with other snake
        if (
          snake.some(
            (segment) => segment.x === head2.x && segment.y === head2.y
          )
        ) {
          setGameOver(true);
          setGameRunning(false);
          setWinner("Player 1");
          playGameOver();
          return currentSnake2;
        }

        newSnake2.unshift(head2);

        // Check food collision for snake 2
        if (head2.x === food.x && head2.y === food.y) {
          setScore2((prev) => prev + 10);
          setFood(generateFood());
          setSpeed((prev) => Math.max(prev - 2, 80));
          playEat();
        } else {
          newSnake2.pop();
        }

        return newSnake2;
      });
    }
  }, [
    direction,
    direction2,
    food,
    gameRunning,
    gameOver,
    generateFood,
    gameMode,
    snake,
    snake2,
    playEat,
    playGameOver,
  ]);

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, speed);
    return () => clearInterval(gameInterval);
  }, [moveSnake, speed]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameRunning) return;

      // Player 1 controls (Arrow keys)
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          setDirection((prev) => (prev !== "DOWN" ? "UP" : prev));
          playMove();
          break;
        case "ArrowDown":
          e.preventDefault();
          setDirection((prev) => (prev !== "UP" ? "DOWN" : prev));
          playMove();
          break;
        case "ArrowLeft":
          e.preventDefault();
          setDirection((prev) => (prev !== "RIGHT" ? "LEFT" : prev));
          playMove();
          break;
        case "ArrowRight":
          e.preventDefault();
          setDirection((prev) => (prev !== "LEFT" ? "RIGHT" : prev));
          playMove();
          break;
        case " ":
          e.preventDefault();
          setGameRunning((prev) => !prev);
          playClick();
          break;
      }

      // Player 2 controls (WASD) - only in multiplayer mode
      if (gameMode === "multiplayer") {
        switch (e.key.toLowerCase()) {
          case "w":
            e.preventDefault();
            setDirection2((prev) => (prev !== "DOWN" ? "UP" : prev));
            playMove();
            break;
          case "s":
            e.preventDefault();
            setDirection2((prev) => (prev !== "UP" ? "DOWN" : prev));
            playMove();
            break;
          case "a":
            e.preventDefault();
            setDirection2((prev) => (prev !== "RIGHT" ? "LEFT" : prev));
            playMove();
            break;
          case "d":
            e.preventDefault();
            setDirection2((prev) => (prev !== "LEFT" ? "RIGHT" : prev));
            playMove();
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameRunning, gameMode, playMove, playClick]);

  useEffect(() => {
    if (gameOver) {
      const finalScore =
        gameMode === "multiplayer" ? Math.max(score, score2) : score;
      if (finalScore > highScore) {
        setHighScore(finalScore);
        localStorage.setItem("snakeHighScore", finalScore.toString());
      }

      // Update global stats
      const stats = JSON.parse(
        localStorage.getItem("gameStats") ||
          '{"gamesPlayed": 0, "totalScore": 0, "bestStreak": 0}'
      );
      stats.gamesPlayed += 1;
      stats.totalScore += finalScore;
      localStorage.setItem("gameStats", JSON.stringify(stats));
    }
  }, [gameOver, score, score2, highScore, gameMode]);

  const startGame = () => {
    playClick();
    setGameRunning(true);
    setGameOver(false);
  };

  const pauseGame = () => {
    playClick();
    setGameRunning(false);
  };

  const resetGame = () => {
    playClick();
    setSnake(INITIAL_SNAKE);
    setSnake2([{ x: 5, y: 5 }]);
    setFood(INITIAL_FOOD);
    setDirection(INITIAL_DIRECTION);
    setDirection2("LEFT");
    setGameRunning(false);
    setGameOver(false);
    setScore(0);
    setScore2(0);
    setSpeed(150);
    setWinner(null);
  };

  const switchGameMode = (mode: GameMode) => {
    playClick();
    setGameMode(mode);
    resetGame();
  };

  const handleDirectionClick = (newDirection: Direction, player = 1) => {
    if (!gameRunning) return;

    playMove();

    if (player === 1) {
      const opposites = {
        UP: "DOWN",
        DOWN: "UP",
        LEFT: "RIGHT",
        RIGHT: "LEFT",
      };

      if (direction !== opposites[newDirection]) {
        setDirection(newDirection);
      }
    } else if (gameMode === "multiplayer") {
      const opposites = {
        UP: "DOWN",
        DOWN: "UP",
        LEFT: "RIGHT",
        RIGHT: "LEFT",
      };

      if (direction2 !== opposites[newDirection]) {
        setDirection2(newDirection);
      }
    }
  };

  const getCellContent = (x: number, y: number) => {
    // Check if it's food
    if (food.x === x && food.y === y) {
      return "bg-red-500";
    }

    // Check if it's snake 1 head
    if (snake[0]?.x === x && snake[0]?.y === y) {
      return "bg-green-400";
    }

    // Check if it's snake 1 body
    if (snake.some((segment) => segment.x === x && segment.y === y)) {
      return "bg-green-600";
    }

    // Check if it's snake 2 head (multiplayer)
    if (
      gameMode === "multiplayer" &&
      snake2[0]?.x === x &&
      snake2[0]?.y === y
    ) {
      return "bg-blue-400";
    }

    // Check if it's snake 2 body (multiplayer)
    if (
      gameMode === "multiplayer" &&
      snake2.some((segment) => segment.x === x && segment.y === y)
    ) {
      return "bg-violet-600";
    }

    return "bg-violet-900";
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Snake</h1>
          <p className="text-gray-400">
            Guide the snake to eat food and grow longer!
          </p>
        </div>
        <Link
          href="/"
          className="btn-secondary flex items-center"
          onClick={playClick}
        >
          <Home className="w-4 h-4 mr-2" />
          Home
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Game Board */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800 rounded-xl p-6 border border-violet-400">
            {/* Game Mode Selector */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3">Game Mode</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => switchGameMode("single")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                    gameMode === "single"
                      ? "bg-violet-600 text-white"
                      : "bg-violet-400 text-gray-300 hover:bg-violet-600"
                  }`}
                >
                  <User className="w-4 h-4 mr-2" />
                  Single Player
                </button>
                <button
                  onClick={() => switchGameMode("multiplayer")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                    gameMode === "multiplayer"
                      ? "bg-violet-600 text-white"
                      : "bg-violet-400 text-gray-300 hover:bg-violet-600"
                  }`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Local 2P
                </button>
              </div>
            </div>

            {/* Game Status */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-6">
                <div className="text-white">
                  <span className="text-gray-400">P1 Score:</span>
                  <span className="font-bold ml-2 text-2xl text-green-400">
                    {score}
                  </span>
                </div>
                {gameMode === "multiplayer" && (
                  <div className="text-white">
                    <span className="text-gray-400">P2 Score:</span>
                    <span className="font-bold ml-2 text-2xl text-blue-400">
                      {score2}
                    </span>
                  </div>
                )}
                <div className="text-white">
                  <span className="text-gray-400">High Score:</span>
                  <span className="font-bold ml-2 text-yellow-400">
                    {highScore}
                  </span>
                </div>
              </div>

              {gameOver && (
                <div className="text-red-400 font-bold text-lg">
                  {winner ? `${winner} Wins!` : "Game Over!"}
                </div>
              )}
            </div>

            {/* Game Grid */}
            <div className="bg-gray-900 rounded-lg p-4 mb-6">
              <div
                className="grid gap-1 mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                  width: "400px",
                  height: "400px",
                }}
              >
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map(
                  (_, index) => {
                    const x = index % GRID_SIZE;
                    const y = Math.floor(index / GRID_SIZE);

                    return (
                      <div
                        key={index}
                        className={`aspect-square rounded-sm ${getCellContent(
                          x,
                          y
                        )}`}
                      />
                    );
                  }
                )}
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

        {/* Controls Sidebar */}
        <div className="space-y-6">
          {/* Player 1 Controls */}
          <div className="bg-gray-800 rounded-xl p-6 border border-violet-400">
            <h3 className="text-lg font-bold text-green-400 mb-4">
              Player 1 Controls
            </h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div></div>
              <button
                onClick={() => handleDirectionClick("UP", 1)}
                className="btn-secondary p-2 text-center"
                disabled={!gameRunning}
              >
                ↑
              </button>
              <div></div>
              <button
                onClick={() => handleDirectionClick("LEFT", 1)}
                className="btn-secondary p-2 text-center"
                disabled={!gameRunning}
              >
                ←
              </button>
              <div></div>
              <button
                onClick={() => handleDirectionClick("RIGHT", 1)}
                className="btn-secondary p-2 text-center"
                disabled={!gameRunning}
              >
                →
              </button>
              <div></div>
              <button
                onClick={() => handleDirectionClick("DOWN", 1)}
                className="btn-secondary p-2 text-center"
                disabled={!gameRunning}
              >
                ↓
              </button>
              <div></div>
            </div>
            <p className="text-sm text-gray-400 text-center">Arrow Keys</p>
          </div>

          {/* Player 2 Controls (Multiplayer only) */}
          {gameMode === "multiplayer" && (
            <div className="bg-gray-800 rounded-xl p-6 border border-violet-400">
              <h3 className="text-lg font-bold text-blue-400 mb-4">
                Player 2 Controls
              </h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div></div>
                <button
                  onClick={() => handleDirectionClick("UP", 2)}
                  className="btn-secondary p-2 text-center"
                  disabled={!gameRunning}
                >
                  W
                </button>
                <div></div>
                <button
                  onClick={() => handleDirectionClick("LEFT", 2)}
                  className="btn-secondary p-2 text-center"
                  disabled={!gameRunning}
                >
                  A
                </button>
                <div></div>
                <button
                  onClick={() => handleDirectionClick("RIGHT", 2)}
                  className="btn-secondary p-2 text-center"
                  disabled={!gameRunning}
                >
                  D
                </button>
                <div></div>
                <button
                  onClick={() => handleDirectionClick("DOWN", 2)}
                  className="btn-secondary p-2 text-center"
                  disabled={!gameRunning}
                >
                  S
                </button>
                <div></div>
              </div>
              <p className="text-sm text-gray-400 text-center">WASD Keys</p>
            </div>
          )}

          {/* Game Stats */}
          <div className="bg-gray-800 rounded-xl p-6 border border-violet-400">
            <h3 className="text-lg font-bold text-white mb-3">Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">P1 Length</span>
                <span className="text-white font-bold">{snake.length}</span>
              </div>
              {gameMode === "multiplayer" && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">P2 Length</span>
                  <span className="text-white font-bold">{snake2.length}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Speed</span>
                <span className="text-white font-bold">
                  {Math.round((200 - speed) / 10)}
                </span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gray-800 rounded-xl p-6 border border-violet-400">
            <h3 className="text-lg font-bold text-white mb-3">How to Play</h3>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Player 1: Use arrow keys</li>
              {gameMode === "multiplayer" && <li>• Player 2: Use WASD keys</li>}
              <li>• Eat red food to grow and score</li>
              <li>• Avoid hitting walls or snakes</li>
              {gameMode === "multiplayer" && <li>• First to crash loses!</li>}
              <li>• Press SPACE to pause/unpause</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
