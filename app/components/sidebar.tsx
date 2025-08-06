"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  User,
  Trophy,
  Menu,
  X,
  Gamepad2,
  Target,
  Scissors,
  Grid3X3,
  Type,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
];

const games = [
  { name: "Tic Tac Toe", href: "/games/tic-tac-toe", icon: Grid3X3 },
  {
    name: "Rock Paper Scissors",
    href: "/games/rock-paper-scissors",
    icon: Scissors,
  },
  { name: "Picture Matching", href: "/games/picture-matching", icon: Target },
  { name: "Snake", href: "/games/snake", icon: Gamepad2 },
  { name: "Tetris", href: "/games/tetris", icon: Grid3X3 },
  { name: "Word Puzzle", href: "/games/word-puzzle", icon: Type },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-blgray-900 border-r border-violet-400 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-violet-400">
            <Gamepad2 className="w-8 h-8 text-violet-600" />
            <span className="ml-2 text-xl font-bold text-white">PlayZone</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-violet-600 text-white"
                        : "text-gray-300 hover:bg-violet-400 hover:text-white"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="pt-6">
              <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Games
              </h3>
              <div className="mt-2 space-y-1">
                {games.map((game) => {
                  const isActive = pathname === game.href;
                  return (
                    <Link
                      key={game.name}
                      href={game.href}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-violet-600 text-white"
                          : "text-gray-300 hover:bg-violet-400 hover:text-white"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <game.icon className="w-5 h-5 mr-3" />
                      {game.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
