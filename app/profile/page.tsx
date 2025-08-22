"use client";

import { useState, useEffect } from "react";
import { Edit3, Save, X, Home } from "lucide-react";
import Link from "next/link";
import supabase from "@/lib/supabase";
import { ensureUserId } from "@/lib/userId";

type UserProfile = {
  username: string;
  email: string;
  favoriteGame: string;
  joinDate: string;
  avatar: string;
};

export default function Profile() {
  const defaultProfile: UserProfile = {
    username: "GamePlayer",
    email: "player@playzone.com",
    favoriteGame: "Tic Tac Toe",
    joinDate: new Date().toLocaleDateString("en-GB"),
    avatar: "🎮",
  };

  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] =
    useState<UserProfile>(defaultProfile);
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

  // Load profile & stats once
  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setProfile(parsedProfile);
      setEditedProfile(parsedProfile);
    } else {
      // Save default profile if none exists
      localStorage.setItem("userProfile", JSON.stringify(defaultProfile));
    }

    const savedStats = localStorage.getItem("gameStats");
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  const handleSave = async () => {
    if (JSON.stringify(profile) === JSON.stringify(editedProfile)) {
      setIsEditing(false);
      return;
    }

    setProfile(editedProfile);
    localStorage.setItem("userProfile", JSON.stringify(editedProfile));
    setIsEditing(false);

    const userId = ensureUserId(); // ✅ unified
    const gameStats = JSON.parse(localStorage.getItem("gameStats") || "{}");

    const { error } = await supabase.from("leaderboard").upsert(
      {
        id: userId,
        username: editedProfile.username,
        avatar: editedProfile.avatar,
        favoriteGame: editedProfile.favoriteGame,
        totalScore: gameStats.totalScore || 0,
        gamesPlayed: gameStats.gamesPlayed || 0,
        bestStreak: gameStats.bestStreak || 0,
      },
      { onConflict: "id" }
    );

    if (error) {
      if (error.code === "23505") {
        setMessage({ type: "error", text: "❌ Username already taken!" });
      } else {
        console.error("❌ Error updating Supabase:", error.message);
      }
    } else {
      setMessage({ type: "success", text: "✅ Profile saved!" });
    }
  };

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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
        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-white text-sm ${
              message.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {message.text}
          </div>
        )}

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
              {/* Username */}
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

              {/* Email */}
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

              {/* Favorite Game */}
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

              {/* Join Date */}
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
              <Achievement
                unlocked={stats.gamesPlayed >= 1}
                icon="🎮"
                title="First Game"
                description="Play your first game"
              />
              <Achievement
                unlocked={stats.gamesPlayed >= 10}
                icon="🏆"
                title="Game Enthusiast"
                description="Play 10 games"
              />
              <Achievement
                unlocked={stats.bestStreak >= 5}
                icon="🔥"
                title="Hot Streak"
                description="Win 5 games in a row"
              />
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

function Achievement({
  unlocked,
  icon,
  title,
  description,
}: {
  unlocked: boolean;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div
      className={`flex items-center p-3 rounded-lg ${
        unlocked
          ? "bg-green-900/30 border border-green-500/30"
          : "bg-violet-400/30 border border-gray-600"
      }`}
    >
      <span className="text-2xl mr-3">{icon}</span>
      <div>
        <div className="text-sm font-medium text-white">{title}</div>
        <div className="text-xs text-gray-400">{description}</div>
      </div>
    </div>
  );
}
