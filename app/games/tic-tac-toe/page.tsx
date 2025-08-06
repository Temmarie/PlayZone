"use client";

import { useState, useEffect } from "react";
import { RotateCcw, Home, Users, User, Wifi, WifiOff } from "lucide-react";
import Link from "next/link";
import { useSound } from "../../hooks/useSound";

type Player = "X" | "O" | null;
type Board = Player[];
type GameMode = "single" | "local" | "online";

export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<Player>(null);
  const [gameOver, setGameOver] = useState(false);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [gameMode, setGameMode] = useState<GameMode>("single");
  const [roomCode, setRoomCode] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [connected, setConnected] = useState(false);
  const [playerSymbol, setPlayerSymbol] = useState<"X" | "O">("X");
  const [opponentName, setOpponentName] = useState("");
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);

  const { playClick, playSuccess, playError, playMove } = useSound();

  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // columns
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];

  useEffect(() => {
    const savedScores = localStorage.getItem("ticTacToeScores");
    if (savedScores) {
      setScores(JSON.parse(savedScores));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ticTacToeScores", JSON.stringify(scores));
  }, [scores]);

  const checkWinner = (board: Board): Player => {
    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const handleClick = (index: number) => {
    if (board[index] || gameOver) return;

    // Online mode validation
    if (gameMode === "online") {
      if (!connected || currentPlayer !== playerSymbol) {
        playError();
        return;
      }
    }

    playMove();

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setGameOver(true);
      setScores((prev) => ({ ...prev, [gameWinner]: prev[gameWinner] + 1 }));
      playSuccess();

      // Update global stats
      const stats = JSON.parse(
        localStorage.getItem("gameStats") ||
          '{"gamesPlayed": 0, "totalScore": 0, "bestStreak": 0}'
      );
      stats.gamesPlayed += 1;
      stats.totalScore += gameWinner === "X" ? 10 : 0;
      localStorage.setItem("gameStats", JSON.stringify(stats));
    } else if (newBoard.every((cell) => cell !== null)) {
      setGameOver(true);
      setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
      playError();

      // Update global stats
      const stats = JSON.parse(
        localStorage.getItem("gameStats") ||
          '{"gamesPlayed": 0, "totalScore": 0, "bestStreak": 0}'
      );
      stats.gamesPlayed += 1;
      localStorage.setItem("gameStats", JSON.stringify(stats));
    } else {
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    }

    // Send move to opponent in online mode
    if (gameMode === "online" && connected) {
      // Simulate sending move to opponent
      setTimeout(() => {
        if (!gameWinner && !newBoard.every((cell) => cell !== null)) {
          // Simulate opponent move (random for demo)
          const availableMoves = newBoard
            .map((cell, i) => (cell === null ? i : null))
            .filter((i) => i !== null);
          if (availableMoves.length > 0) {
            const randomMove =
              availableMoves[Math.floor(Math.random() * availableMoves.length)];
            if (randomMove !== null) {
              const opponentBoard = [...newBoard];
              opponentBoard[randomMove] = playerSymbol === "X" ? "O" : "X";
              setBoard(opponentBoard);
              setCurrentPlayer(playerSymbol);
              playMove();

              const opponentWinner = checkWinner(opponentBoard);
              if (opponentWinner) {
                setWinner(opponentWinner);
                setGameOver(true);
                setScores((prev) => ({
                  ...prev,
                  [opponentWinner]: prev[opponentWinner] + 1,
                }));
                playError();
              } else if (opponentBoard.every((cell) => cell !== null)) {
                setGameOver(true);
                setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
                playError();
              }
            }
          }
        }
      }, 1000 + Math.random() * 2000); // Random delay for opponent move
    }
  };

  const resetGame = () => {
    playClick();
    setBoard(Array(9).fill(null));
    setCurrentPlayer("X");
    setWinner(null);
    setGameOver(false);
  };

  const resetScores = () => {
    playClick();
    setScores({ X: 0, O: 0, draws: 0 });
  };

  const createRoom = () => {
    playClick();
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);
    setIsHost(true);
    setPlayerSymbol("X");
    setWaitingForOpponent(true);
    setGameMode("online");

    // Simulate opponent joining after a delay
    setTimeout(() => {
      setConnected(true);
      setWaitingForOpponent(false);
      setOpponentName("Player2");
      playSuccess();
    }, 3000 + Math.random() * 5000);
  };

  const joinRoom = () => {
    if (!roomCode.trim()) {
      playError();
      return;
    }

    playClick();
    setIsHost(false);
    setPlayerSymbol("O");
    setConnected(true);
    setGameMode("online");
    setOpponentName("Host");
    playSuccess();
  };

  const leaveRoom = () => {
    playClick();
    setConnected(false);
    setRoomCode("");
    setIsHost(false);
    setWaitingForOpponent(false);
    setOpponentName("");
    setGameMode("single");
    resetGame();
  };

  const getGameModeDisplay = () => {
    switch (gameMode) {
      case "single":
        return "Single Player";
      case "local":
        return "Local Multiplayer";
      case "online":
        return connected
          ? `Online - ${isHost ? "Host" : "Guest"}`
          : "Connecting...";
      default:
        return "Single Player";
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tic Tac Toe</h1>
          <p className="text-gray-400">Get three in a row to win!</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Game Board */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-xl p-6 border border-violet-400">
            {/* Game Mode Selector */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3">Game Mode</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    playClick();
                    setGameMode("single");
                    resetGame();
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    gameMode === "single"
                      ? "bg-violet-600 text-white"
                      : "bg-violet-400 text-gray-300 hover:bg-violet-600"
                  }`}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Single Player
                </button>
                <button
                  onClick={() => {
                    playClick();
                    setGameMode("local");
                    resetGame();
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    gameMode === "local"
                      ? "bg-violet-600 text-white"
                      : "bg-violet-400 text-gray-300 hover:bg-violet-600"
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-2" />
                  Local 2P
                </button>
                <button
                  onClick={() => {
                    playClick();
                    if (gameMode !== "online") {
                      setGameMode("online");
                      resetGame();
                    }
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    gameMode === "online"
                      ? "bg-violet-600 text-white"
                      : "bg-violet-400 text-gray-300 hover:bg-violet-600"
                  }`}
                >
                  {connected ? (
                    <Wifi className="w-4 h-4 inline mr-2" />
                  ) : (
                    <WifiOff className="w-4 h-4 inline mr-2" />
                  )}
                  Online
                </button>
              </div>
            </div>

            {/* Online Mode Controls */}
            {gameMode === "online" && !connected && (
              <div className="mb-6 p-4 bg-violet-400 rounded-lg">
                <h4 className="text-white font-semibold mb-3">
                  Online Multiplayer
                </h4>
                <div className="space-y-3">
                  <button onClick={createRoom} className="w-full btn-primary">
                    Create Room
                  </button>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter room code"
                      value={roomCode}
                      onChange={(e) =>
                        setRoomCode(e.target.value.toUpperCase())
                      }
                      className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400"
                      maxLength={6}
                    />
                    <button onClick={joinRoom} className="btn-secondary">
                      Join
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Waiting for opponent */}
            {waitingForOpponent && (
              <div className="mb-6 p-4 bg-blue-900/30 border border-blue-500/30 rounded-lg text-center">
                <p className="text-blue-400 font-semibold">
                  Room Code: {roomCode}
                </p>
                <p className="text-gray-300 text-sm mt-1">
                  Waiting for opponent to join...
                </p>
                <div className="mt-2">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full mx-auto"></div>
                </div>
              </div>
            )}

            {/* Connected status */}
            {gameMode === "online" && connected && (
              <div className="mb-6 p-3 bg-green-900/30 border border-green-500/30 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-green-400 font-semibold">
                    Connected to {opponentName}
                  </p>
                  {roomCode && (
                    <p className="text-gray-300 text-sm">Room: {roomCode}</p>
                  )}
                </div>
                <button onClick={leaveRoom} className="btn-secondary text-sm">
                  Leave
                </button>
              </div>
            )}

            {/* Game Status */}
            <div className="text-center mb-6">
              {gameOver ? (
                <div>
                  {winner ? (
                    <p className="text-2xl font-bold text-green-400">
                      {gameMode === "online" && winner === playerSymbol
                        ? "You Win! 🎉"
                        : gameMode === "online" && winner !== playerSymbol
                        ? "You Lose! 😢"
                        : `Player ${winner} Wins! 🎉`}
                    </p>
                  ) : (
                    <p className="text-2xl font-bold text-yellow-400">
                      It's a Draw! 🤝
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-xl text-white">
                    Current Player:{" "}
                    <span className="font-bold text-violet-400">
                      {currentPlayer}
                    </span>
                  </p>
                  {gameMode === "online" && (
                    <p className="text-sm text-gray-400 mt-1">
                      {currentPlayer === playerSymbol
                        ? "Your turn"
                        : `${opponentName}'s turn`}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Board */}
            <div className="grid grid-cols-3 gap-2 max-w-md mx-auto mb-6">
              {board.map((cell, index) => (
                <button
                  key={index}
                  onClick={() => handleClick(index)}
                  className="aspect-square bg-violet-400 hover:bg-violet-600 border border-gray-600 rounded-lg text-4xl font-bold text-white transition-colors duration-200 disabled:cursor-not-allowed"
                  disabled={
                    cell !== null ||
                    gameOver ||
                    (gameMode === "online" &&
                      (!connected || currentPlayer !== playerSymbol))
                  }
                >
                  {cell && (
                    <span
                      className={
                        cell === "X" ? "text-blue-800" : "text-red-800"
                      }
                    >
                      {cell}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Controls */}
            <div className="flex justify-center">
              <button
                onClick={resetGame}
                className="btn-primary flex items-center"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                New Game
              </button>
            </div>
          </div>
        </div>

        {/* Scoreboard */}
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-violet-400">
            <h3 className="text-xl font-bold text-white mb-4">Game Info</h3>
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-sm text-gray-400">Mode</p>
                <p className="font-semibold text-violet-400">
                  {getGameModeDisplay()}
                </p>
              </div>
              {gameMode === "online" && playerSymbol && (
                <div className="text-center">
                  <p className="text-sm text-gray-400">You are</p>
                  <p
                    className={`font-bold text-2xl ${
                      playerSymbol === "X" ? "text-blue-800" : "text-red-800"
                    }`}
                  >
                    {playerSymbol}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-violet-400">
            <h3 className="text-xl font-bold text-white mb-4">Scoreboard</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-800 font-semibold">Player X</span>
                <span className="text-white font-bold">{scores.X}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-800 font-semibold">Player O</span>
                <span className="text-white font-bold">{scores.O}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-yellow-400 font-semibold">Draws</span>
                <span className="text-white font-bold">{scores.draws}</span>
              </div>
            </div>
            <button
              onClick={resetScores}
              className="w-full mt-4 btn-secondary text-sm"
            >
              Reset Scores
            </button>
          </div>

          {/* Game Rules */}
          <div className="bg-gray-800 rounded-xl p-6 border border-violet-400">
            <h3 className="text-lg font-bold text-white mb-3">How to Play</h3>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Players take turns placing X and O</li>
              <li>• Get 3 in a row to win</li>
              <li>• Rows, columns, or diagonals count</li>
              <li>• If the board fills up, it's a draw</li>
              {gameMode === "online" && (
                <li>• Wait for your turn in online mode</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
