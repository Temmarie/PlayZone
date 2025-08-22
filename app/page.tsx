"use client";

import Link from "next/link";
import {
  Grid3X3,
  Scissors,
  Target,
  Trophy,
  User,
  TrendingUp,
  Gamepad2,
  Type,
} from "lucide-react";
import { useEffect, useState } from "react";

const games = [
  {
    id: "tic-tac-toe",
    name: "Tic Tac Toe",
    description: "Classic 3x3 grid game. Get three in a row to win!",
    icon: Grid3X3,
    href: "/games/tic-tac-toe",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "rock-paper-scissors",
    name: "Rock Paper Scissors",
    description:
      "Beat the computer in this timeless game of chance and strategy.",
    icon: Scissors,
    href: "/games/rock-paper-scissors",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "picture-matching",
    name: "Picture Matching",
    description: "Test your memory by matching pairs of hidden pictures.",
    icon: Target,
    href: "/games/picture-matching",
    color: "from-violet-500 to-pink-500",
  },
  {
    id: "snake",
    name: "Snake",
    description:
      "Guide the snake to eat food and grow longer without hitting walls.",
    icon: Gamepad2,
    href: "/games/snake",
    color: "from-red-500 to-orange-500",
  },
  {
    id: "tetris",
    name: "Tetris",
    description:
      "Arrange falling blocks to clear lines and achieve high scores.",
    icon: Grid3X3,
    href: "/games/tetris",
    color: "from-indigo-500 to-violet-500",
  },
  {
    id: "word-puzzle",
    name: "Word Puzzle",
    description:
      "Find hidden words in a grid of letters to test your vocabulary.",
    icon: Type,
    href: "/games/word-puzzle",
    color: "from-teal-500 to-cyan-500",
  },
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    totalScore: 0,
    bestStreak: 0,
  });

  useEffect(() => {
    // Load user stats from localStorage
    const savedStats = localStorage.getItem("gameStats");
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome to PlayZone
        </h1>
        <p className="text-gray-400">
          Choose a game to start playing and compete for the top spot!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-xl p-6 border border-violet-400">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-400">Games Played</p>
              <p className="text-2xl font-bold text-white">
                {stats.gamesPlayed}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-violet-400">
          <div className="flex items-center">
            <div className="p-3 bg-violet-500/20 rounded-lg">
              <Trophy className="w-6 h-6 text-violet-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-400">Total Score</p>
              <p className="text-2xl font-bold text-white">
                {stats.totalScore}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-violet-400">
          <div className="flex items-center">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <User className="w-6 h-6 text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-400">Best Streak</p>
              <p className="text-2xl font-bold text-white">
                {stats.bestStreak}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Available Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Link key={game.id} href={game.href}>
              <div className="game-card group cursor-pointer">
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-r ${game.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}
                >
                  <game.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {game.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4">{game.description}</p>
                <div className="flex items-center text-violet-400 text-sm font-medium">
                  Play Now
                  <svg
                    className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/profile">
          <div className="bg-gray-800 rounded-xl p-6 border border-violet-400 hover:border-violet-500 transition-colors cursor-pointer">
            <div className="flex items-center">
              <User className="w-8 h-8 text-violet-400" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-white">
                  View Profile
                </h3>
                <p className="text-gray-400 text-sm">
                  Manage your account and game preferences
                </p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/leaderboard">
          <div className="bg-gray-800 rounded-xl p-6 border border-violet-400 hover:border-violet-500 transition-colors cursor-pointer">
            <div className="flex items-center">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-white">
                  Leaderboard
                </h3>
                <p className="text-gray-400 text-sm">
                  See how you rank against other players
                </p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
