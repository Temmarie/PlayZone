"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Award, Home, Crown } from "lucide-react";
import Link from "next/link";

type LeaderboardEntry = {
  id: string;
  username: string;
  avatar: string;
  totalScore: number;
  gamesPlayed: number;
  bestStreak: number;
  favoriteGame: string;
};

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaderboardEntry | null>(null);
  const [sortBy, setSortBy] = useState<
    "totalScore" | "gamesPlayed" | "bestStreak"
  >("totalScore");

  useEffect(() => {
    // Generate mock leaderboard data
    const mockData: LeaderboardEntry[] = [
      {
        id: "1",
        username: "GameMaster",
        avatar: "👑",
        totalScore: 2450,
        gamesPlayed: 89,
        bestStreak: 12,
        favoriteGame: "Tic Tac Toe",
      },
      {
        id: "2",
        username: "PuzzleQueen",
        avatar: "🧩",
        totalScore: 2180,
        gamesPlayed: 76,
        bestStreak: 8,
        favoriteGame: "Picture Matching",
      },
      {
        id: "3",
        username: "RockPaperPro",
        avatar: "✂️",
        totalScore: 1950,
        gamesPlayed: 65,
        bestStreak: 15,
        favoriteGame: "Rock Paper Scissors",
      },
      {
        id: "4",
        username: "StrategyKing",
        avatar: "♟️",
        totalScore: 1820,
        gamesPlayed: 58,
        bestStreak: 7,
        favoriteGame: "Tic Tac Toe",
      },
      {
        id: "5",
        username: "QuickThink",
        avatar: "⚡",
        totalScore: 1650,
        gamesPlayed: 52,
        bestStreak: 9,
        favoriteGame: "Picture Matching",
      },
    ];

    // Add current user to leaderboard
    const userProfile = JSON.parse(
      localStorage.getItem("userProfile") ||
        '{"username": "GamePlayer", "avatar": "🎮"}'
    );
    const userStats = JSON.parse(
      localStorage.getItem("gameStats") ||
        '{"gamesPlayed": 0, "totalScore": 0, "bestStreak": 0}'
    );

    const currentUserEntry: LeaderboardEntry = {
      id: "current",
      username: userProfile.username,
      avatar: userProfile.avatar,
      totalScore: userStats.totalScore,
      gamesPlayed: userStats.gamesPlayed,
      bestStreak: userStats.bestStreak,
      favoriteGame: userProfile.favoriteGame || "Tic Tac Toe",
    };

    setCurrentUser(currentUserEntry);

    // Combine and sort leaderboard
    const combinedData = [...mockData, currentUserEntry];
    const sortedData = combinedData.sort((a, b) => b[sortBy] - a[sortBy]);
    setLeaderboard(sortedData);
  }, [sortBy]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <span className="w-6 h-6 flex items-center justify-center text-gray-400 font-bold">
            #{rank}
          </span>
        );
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "border-yellow-500 bg-yellow-500/10";
      case 2:
        return "border-gray-300 bg-gray-300/10";
      case 3:
        return "border-amber-600 bg-amber-600/10";
      default:
        return "border-violet-400";
    }
  };

  const isCurrentUser = (entry: LeaderboardEntry) => entry.id === "current";

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Leaderboard</h1>
          <p className="text-gray-400">
            See how you rank against other players
          </p>
        </div>
        <Link href="/" className="btn-secondary flex items-center">
          <Home className="w-4 h-4 mr-2" />
          Home
        </Link>
      </div>

      {/* Sort Controls */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSortBy("totalScore")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              sortBy === "totalScore"
                ? "bg-violet-600 text-white"
                : "bg-violet-400 text-gray-300 hover:bg-violet-600"
            }`}
          >
            Total Score
          </button>
          <button
            onClick={() => setSortBy("gamesPlayed")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              sortBy === "gamesPlayed"
                ? "bg-violet-600 text-white"
                : "bg-violet-400 text-gray-300 hover:bg-violet-600"
            }`}
          >
            Games Played
          </button>
          <button
            onClick={() => setSortBy("bestStreak")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              sortBy === "bestStreak"
                ? "bg-violet-600 text-white"
                : "bg-violet-400 text-gray-300 hover:bg-violet-600"
            }`}
          >
            Best Streak
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-gray-800 rounded-xl border border-violet-400 overflow-hidden">
        <div className="p-6 border-b border-violet-400">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Trophy className="w-6 h-6 mr-2 text-yellow-400" />
            Top Players
          </h2>
        </div>

        <div className="divide-y divide-violet-400">
          {leaderboard.map((entry, index) => {
            const rank = index + 1;
            const isUser = isCurrentUser(entry);

            return (
              <div
                key={entry.id}
                className={`p-6 flex items-center justify-between transition-colors ${
                  isUser
                    ? "bg-purple-900/30 border-l-4 border-l-purple-500"
                    : "hover:bg-violet-400/50"
                } ${getRankColor(rank)}`}
              >
                <div className="flex items-center space-x-4">
                  {/* Rank */}
                  <div className="flex items-center justify-center w-12">
                    {getRankIcon(rank)}
                  </div>

                  {/* Avatar */}
                  <div className="w-12 h-12 bg-violet-400 rounded-full flex items-center justify-center text-2xl">
                    {entry.avatar}
                  </div>

                  {/* User Info */}
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-semibold text-white">
                        {entry.username}
                        {isUser && (
                          <span className="ml-2 px-2 py-1 bg-violet-600 text-xs rounded-full">
                            You
                          </span>
                        )}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-400">
                      Favorite: {entry.favoriteGame}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-8 text-right">
                  <div>
                    <div className="text-lg font-bold text-white">
                      {entry.totalScore.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">Score</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">
                      {entry.gamesPlayed}
                    </div>
                    <div className="text-xs text-gray-400">Games</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">
                      {entry.bestStreak}
                    </div>
                    <div className="text-xs text-gray-400">Streak</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current User Summary */}
      {currentUser && (
        <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-violet-400">
          <h3 className="text-lg font-bold text-white mb-4">
            Your Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                #{leaderboard.findIndex((entry) => entry.id === "current") + 1}
              </div>
              <div className="text-sm text-gray-400">Current Rank</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {currentUser.totalScore}
              </div>
              <div className="text-sm text-gray-400">Total Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {currentUser.bestStreak}
              </div>
              <div className="text-sm text-gray-400">Best Streak</div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="btn-primary">
              Play More Games to Improve Your Rank!
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
