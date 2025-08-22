"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { RotateCcw, Home, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useSound } from "../../hooks/useSound";
import { uploadScoreToSupabase } from "@/lib/syncScore";

type GridCell = {
  letter: string;
  isFound: boolean;
  isHighlighted: boolean;
};

const WORDS = [
  "REACT",
  "JAVASCRIPT",
  "CODING",
  "PUZZLE",
  "GAME",
  "WORD",
  "SEARCH",
  "FIND",
  "LETTERS",
  "GRID",
  "CHALLENGE",
  "BRAIN",
  "LOGIC",
  "PATTERN",
  "SOLVE",
  "THINK",
];

const GRID_SIZE = 15;

export default function WordPuzzle() {
  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [wordsToFind, setWordsToFind] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<
    { row: number; col: number }[]
  >([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const { playClick, playSuccess, playWordFound, playError } = useSound();

  useEffect(() => {
    const savedHighScore = localStorage.getItem("wordPuzzleHighScore");
    if (savedHighScore) {
      setHighScore(Number.parseInt(savedHighScore));
    }
    generateNewPuzzle();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameCompleted]);

  useEffect(() => {
    if (foundWords.length === wordsToFind.length && wordsToFind.length > 0) {
      setGameCompleted(true);
      playSuccess();

      const finalScore = wordsToFind.length * 100 - timeElapsed;
      setScore(finalScore);

      if (finalScore > highScore) {
        setHighScore(finalScore);
        localStorage.setItem("wordPuzzleHighScore", finalScore.toString());
      }

      // Update global stats
      const stats = JSON.parse(
        localStorage.getItem("gameStats") ||
          '{"gamesPlayed": 0, "totalScore": 0, "bestStreak": 0}'
      );
      stats.gamesPlayed += 1;
      stats.totalScore += Math.max(finalScore, 0);
      localStorage.setItem("gameStats", JSON.stringify(stats));
      uploadScoreToSupabase();
    }
  }, [foundWords, wordsToFind, timeElapsed, highScore, playSuccess]);

  const generateNewPuzzle = () => {
    playClick();
    // Select random words
    const selectedWords = WORDS.sort(() => Math.random() - 0.5).slice(0, 8);
    setWordsToFind(selectedWords);
    setFoundWords([]);
    setScore(0);
    setTimeElapsed(0);
    setGameStarted(false);
    setGameCompleted(false);

    // Create empty grid
    const newGrid: GridCell[][] = Array(GRID_SIZE)
      .fill(null)
      .map(() =>
        Array(GRID_SIZE)
          .fill(null)
          .map(() => ({
            letter: "",
            isFound: false,
            isHighlighted: false,
          }))
      );

    // Place words in grid
    const placedWords: {
      word: string;
      positions: { row: number; col: number }[];
    }[] = [];

    selectedWords.forEach((word) => {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 100) {
        const direction = Math.floor(Math.random() * 8); // 8 directions
        const startRow = Math.floor(Math.random() * GRID_SIZE);
        const startCol = Math.floor(Math.random() * GRID_SIZE);

        const directions = [
          [-1, -1],
          [-1, 0],
          [-1, 1],
          [0, -1],
          [0, 1],
          [1, -1],
          [1, 0],
          [1, 1],
        ];

        const [dRow, dCol] = directions[direction];
        const positions: { row: number; col: number }[] = [];
        let canPlace = true;

        // Check if word can be placed
        for (let i = 0; i < word.length; i++) {
          const row = startRow + i * dRow;
          const col = startCol + i * dCol;

          if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
            canPlace = false;
            break;
          }

          if (
            newGrid[row][col].letter !== "" &&
            newGrid[row][col].letter !== word[i]
          ) {
            canPlace = false;
            break;
          }

          positions.push({ row, col });
        }

        if (canPlace) {
          // Place the word
          positions.forEach((pos, i) => {
            newGrid[pos.row][pos.col].letter = word[i];
          });
          placedWords.push({ word, positions });
          placed = true;
        }

        attempts++;
      }
    });

    // Fill empty cells with random letters
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (newGrid[row][col].letter === "") {
          newGrid[row][col].letter = String.fromCharCode(
            65 + Math.floor(Math.random() * 26)
          );
        }
      }
    }

    setGrid(newGrid);
  };

  const handleCellMouseDown = (row: number, col: number) => {
    if (gameCompleted) return;

    if (!gameStarted) {
      setGameStarted(true);
    }

    setIsSelecting(true);
    setSelectedCells([{ row, col }]);

    // Highlight cell
    setGrid((prev) =>
      prev.map((gridRow, r) =>
        gridRow.map((cell, c) => ({
          ...cell,
          isHighlighted: r === row && c === col,
        }))
      )
    );
  };

  const handleCellMouseEnter = (row: number, col: number) => {
    if (!isSelecting || selectedCells.length === 0) return;

    const start = selectedCells[0];
    const cells = getLineCells(start.row, start.col, row, col);

    setGrid((prev) =>
      prev.map((gridRow, r) =>
        gridRow.map((cell, c) => ({
          ...cell,
          isHighlighted: cells.some((cell) => cell.row === r && cell.col === c),
        }))
      )
    );
  };

  const handleCellMouseUp = () => {
    if (!isSelecting) return;

    setIsSelecting(false);

    // Check if selected cells form a word
    const selectedLetters = grid
      .flat()
      .filter((cell) => cell.isHighlighted)
      .map((cell) => cell.letter)
      .join("");

    const reversedLetters = selectedLetters.split("").reverse().join("");

    const foundWord = wordsToFind.find(
      (word) => word === selectedLetters || word === reversedLetters
    );

    if (foundWord && !foundWords.includes(foundWord)) {
      setFoundWords((prev) => [...prev, foundWord]);
      playWordFound();

      // Mark cells as found
      setGrid((prev) =>
        prev.map((row) =>
          row.map((cell) => ({
            ...cell,
            isFound: cell.isHighlighted ? true : cell.isFound,
            isHighlighted: false,
          }))
        )
      );
    } else {
      if (selectedLetters.length > 2) {
        playError();
      }
      // Clear highlights
      setGrid((prev) =>
        prev.map((row) =>
          row.map((cell) => ({
            ...cell,
            isHighlighted: false,
          }))
        )
      );
    }
  };

  const getLineCells = (
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number
  ) => {
    const cells: { row: number; col: number }[] = [];

    const deltaRow = endRow - startRow;
    const deltaCol = endCol - startCol;

    // Only allow straight lines (horizontal, vertical, diagonal)
    if (
      deltaRow !== 0 &&
      deltaCol !== 0 &&
      Math.abs(deltaRow) !== Math.abs(deltaCol)
    ) {
      return [{ row: startRow, col: startCol }];
    }

    const steps = Math.max(Math.abs(deltaRow), Math.abs(deltaCol));
    const stepRow = steps === 0 ? 0 : deltaRow / steps;
    const stepCol = steps === 0 ? 0 : deltaCol / steps;

    for (let i = 0; i <= steps; i++) {
      cells.push({
        row: startRow + Math.round(i * stepRow),
        col: startCol + Math.round(i * stepCol),
      });
    }

    return cells;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Word Puzzle</h1>
          <p className="text-gray-400">
            Find all the hidden words in the grid!
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
                  <span className="text-gray-400">Time:</span>
                  <span className="font-bold ml-2 font-mono">
                    {formatTime(timeElapsed)}
                  </span>
                </div>
                <div className="text-white">
                  <span className="text-gray-400">Found:</span>
                  <span className="font-bold ml-2 text-green-400">
                    {foundWords.length}/{wordsToFind.length}
                  </span>
                </div>
                <div className="text-white">
                  <span className="text-gray-400">Score:</span>
                  <span className="font-bold ml-2 text-violet-400">
                    {score}
                  </span>
                </div>
              </div>

              {gameCompleted && (
                <div className="text-green-400 font-bold text-lg">
                  🎉 Completed!
                </div>
              )}
            </div>

            {/* Word Grid */}
            <div className="bg-gray-900 rounded-lg p-4 mb-6 flex justify-center">
              <div
                className="grid gap-1 select-none"
                style={{
                  gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                  width: "450px",
                  height: "450px",
                }}
                onMouseLeave={() => setIsSelecting(false)}
              >
                {grid.flat().map((cell, index) => {
                  const row = Math.floor(index / GRID_SIZE);
                  const col = index % GRID_SIZE;

                  return (
                    <div
                      key={index}
                      className={`w-full h-full flex items-center justify-center text-sm font-bold cursor-pointer transition-colors ${
                        cell.isFound
                          ? "bg-green-600 text-white"
                          : cell.isHighlighted
                          ? "bg-violet-800 text-white"
                          : "bg-violet-400 text-white hover:bg-violet-800"
                      }`}
                      onMouseDown={() => handleCellMouseDown(row, col)}
                      onMouseEnter={() => handleCellMouseEnter(row, col)}
                      onMouseUp={handleCellMouseUp}
                    >
                      {cell.letter}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={generateNewPuzzle}
                className="btn-primary flex items-center"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                New Puzzle
              </button>
              <button
                onClick={() => {
                  playClick();
                  setShowHints(!showHints);
                }}
                className="btn-secondary flex items-center"
              >
                {showHints ? (
                  <EyeOff className="w-4 h-4 mr-2" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                {showHints ? "Hide" : "Show"} Words
              </button>
            </div>
          </div>
        </div>

        {/* Words Sidebar */}
        <div className="space-y-6">
          {/* Words to Find */}
          <div className="bg-gray-800 rounded-xl p-6 border border-violet-400">
            <h3 className="text-lg font-bold text-white mb-4">Words to Find</h3>
            <div className="space-y-2">
              {wordsToFind.map((word) => (
                <div
                  key={word}
                  className={`p-2 rounded text-sm font-medium transition-colors ${
                    foundWords.includes(word)
                      ? "bg-green-600 text-white line-through"
                      : showHints
                      ? "bg-violet-400 text-white"
                      : "bg-violet-400 text-violet-400"
                  }`}
                >
                  {showHints || foundWords.includes(word) ? word : "???"}
                </div>
              ))}
            </div>
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

          {/* Instructions */}
          <div className="bg-gray-800 rounded-xl p-6 border border-violet-400">
            <h3 className="text-lg font-bold text-white mb-3">How to Play</h3>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Click and drag to select letters</li>
              <li>• Words can be horizontal, vertical, or diagonal</li>
              <li>• Words can be forwards or backwards</li>
              <li>• Find all words to complete the puzzle</li>
              <li>• Faster completion = higher score</li>
            </ul>
          </div>

          {/* Scoring */}
          <div className="bg-gray-800 rounded-xl p-6 border border-violet-400">
            <h3 className="text-lg font-bold text-white mb-3">Scoring</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Base: 100 points per word</li>
              <li>• Time penalty: -1 per second</li>
              <li>• Bonus for completing puzzle</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
