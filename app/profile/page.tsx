"use client";

import { useState, useEffect } from "react";
import { Edit3, Save, X, Home } from "lucide-react";
import Link from "next/link";

type UserProfile = {
  username: string;
  email: string;
  favoriteGame: string;
  joinDate: string;
  avatar: string;
};

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile>({
    username: "GamePlayer",
    email: "player@playzone.com",
    favoriteGame: "Tic Tac Toe",
    joinDate: new Date().toLocaleDateString(),
    avatar: "🎮",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    totalScore: 0,
    bestStreak: 0,
  });

  const avatarOptions = [
    "🎮",
    "🎯",
    "🎲",
    "🎪",
    "🎨",
    "🎭",
    "🎸",
    "🎺",
    "🚀",
    "⭐",
    "🔥",
    "💎",
  ];
  const gameOptions = [
    "Tic Tac Toe",
    "Rock Paper Scissors",
    "Picture Matching",
    "Snake",
    "Tetris",
    "Word Puzzle",
  ];

  useEffect(() => {
    // Load profile from localStorage
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setProfile(parsedProfile);
      setEditedProfile(parsedProfile);
    }

    // Load stats from localStorage
    const savedStats = localStorage.getItem("gameStats");
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  const handleSave = () => {
    setProfile(editedProfile);
    localStorage.setItem("userProfile", JSON.stringify(editedProfile));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setEditedProfile((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
          <p className="text-gray-400">
            Manage your account and view your gaming stats
          </p>
        </div>
        <Link href="/" className="btn-secondary flex items-center">
          <Home className="w-4 h-4 mr-2" />
          Home
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-xl p-6 border border-violet-400">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Profile Information
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary flex items-center text-sm"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="btn-primary flex items-center text-sm"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="btn-secondary flex items-center text-sm"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Avatar Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Avatar
              </label>
              {isEditing ? (
                <div className="grid grid-cols-6 gap-2">
                  {avatarOptions.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => handleInputChange("avatar", avatar)}
                      className={`w-12 h-12 rounded-lg text-2xl flex items-center justify-center transition-colors ${
                        editedProfile.avatar === avatar
                          ? "bg-violet-600 border-2 border-purple-400"
                          : "bg-violet-400 hover:bg-violet-600 border-2 border-transparent"
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="w-16 h-16 bg-violet-400 rounded-lg flex items-center justify-center text-3xl">
                  {profile.avatar}
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-violet-400 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                ) : (
                  <p className="text-white">{profile.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-3 py-2 bg-violet-400 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                ) : (
                  <p className="text-white">{profile.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Favorite Game
                </label>
                {isEditing ? (
                  <select
                    value={editedProfile.favoriteGame}
                    onChange={(e) =>
                      handleInputChange("favoriteGame", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-violet-400 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    {gameOptions.map((game) => (
                      <option key={game} value={game}>
                        {game}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-white">{profile.favoriteGame}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Member Since
                </label>
                <p className="text-white">{profile.joinDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Gaming Stats */}
          <div className="bg-gray-800 rounded-xl p-6 border border-violet-400">
            <h3 className="text-xl font-bold text-white mb-4">Gaming Stats</h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-violet-400">
                  {stats.gamesPlayed}
                </div>
                <div className="text-sm text-gray-400">Games Played</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">
                  {stats.totalScore}
                </div>
                <div className="text-sm text-gray-400">Total Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">
                  {stats.bestStreak}
                </div>
                <div className="text-sm text-gray-400">Best Streak</div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-gray-800 rounded-xl p-6 border border-violet-400">
            <h3 className="text-lg font-bold text-white mb-4">Achievements</h3>
            <div className="space-y-3">
              <div
                className={`flex items-center p-3 rounded-lg ${
                  stats.gamesPlayed >= 1
                    ? "bg-green-900/30 border border-green-500/30"
                    : "bg-violet-400/30 border border-gray-600"
                }`}
              >
                <span className="text-2xl mr-3">🎮</span>
                <div>
                  <div className="text-sm font-medium text-white">
                    First Game
                  </div>
                  <div className="text-xs text-gray-400">
                    Play your first game
                  </div>
                </div>
              </div>

              <div
                className={`flex items-center p-3 rounded-lg ${
                  stats.gamesPlayed >= 10
                    ? "bg-green-900/30 border border-green-500/30"
                    : "bg-violet-400/30 border border-gray-600"
                }`}
              >
                <span className="text-2xl mr-3">🏆</span>
                <div>
                  <div className="text-sm font-medium text-white">
                    Game Enthusiast
                  </div>
                  <div className="text-xs text-gray-400">Play 10 games</div>
                </div>
              </div>

              <div
                className={`flex items-center p-3 rounded-lg ${
                  stats.bestStreak >= 5
                    ? "bg-green-900/30 border border-green-500/30"
                    : "bg-violet-400/30 border border-gray-600"
                }`}
              >
                <span className="text-2xl mr-3">🔥</span>
                <div>
                  <div className="text-sm font-medium text-white">
                    Hot Streak
                  </div>
                  <div className="text-xs text-gray-400">
                    Win 5 games in a row
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800 rounded-xl p-6 border border-violet-400">
            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/leaderboard"
                className="block w-full btn-secondary text-center"
              >
                View Leaderboard
              </Link>
              <Link href="/" className="block w-full btn-primary text-center">
                Play Games
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
