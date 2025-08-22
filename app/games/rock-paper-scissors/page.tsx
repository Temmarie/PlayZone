"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { RotateCcw, Home } from "lucide-react";
import Link from "next/link";
import { useSound } from "../../hooks/useSound";
import { uploadScoreToSupabase } from "@/lib/syncScore";

type Choice = "rock" | "paper" | "scissors";
type Result = "win" | "lose" | "draw";

const choices: { name: Choice; emoji: string; beats: Choice }[] = [
  { name: "rock", emoji: "🪨", beats: "scissors" },
  { name: "paper", emoji: "📄", beats: "rock" },
  { name: "scissors", emoji: "✂️", beats: "paper" },
];

export default function RockPaperScissors() {
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [scores, setScores] = useState({ player: 0, computer: 0, draws: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const { playClick, playSuccess, playError, playMove } = useSound();

  useEffect(() => {
    const savedScores = localStorage.getItem("rpsScores");
    const savedStreak = localStorage.getItem("rpsBestStreak");
    if (savedScores) {
      setScores(JSON.parse(savedScores));
    }
    if (savedStreak) {
      setBestStreak(Number.parseInt(savedStreak));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("rpsScores", JSON.stringify(scores));
  }, [scores]);

  useEffect(() => {
    localStorage.setItem("rpsBestStreak", bestStreak.toString());
  }, [bestStreak]);

  const getRandomChoice = (): Choice => {
    const randomIndex = Math.floor(Math.random() * choices.length);
    return choices[randomIndex].name;
  };

  const determineWinner = (player: Choice, computer: Choice): Result => {
    if (player === computer) return "draw";
    const playerChoice = choices.find((c) => c.name === player);
    return playerChoice?.beats === computer ? "win" : "lose";
  };

  const playGame = (choice: Choice) => {
    if (isPlaying) return;

    playMove();
    setIsPlaying(true);
    setPlayerChoice(choice);

    // Add suspense with delayed computer choice
    setTimeout(() => {
      const compChoice = getRandomChoice();
      setComputerChoice(compChoice);

      const gameResult = determineWinner(choice, compChoice);
      setResult(gameResult);

      // Play appropriate sound based on result
      if (gameResult === "win") {
        playSuccess();
      } else if (gameResult === "lose") {
        playError();
      } else {
        playClick();
      }

      // Update scores and streaks
      if (gameResult === "win") {
        setScores((prev) => ({ ...prev, player: prev.player + 1 }));
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak > bestStreak) {
          setBestStreak(newStreak);
        }
      } else if (gameResult === "lose") {
        setScores((prev) => ({ ...prev, computer: prev.computer + 1 }));
        setStreak(0);
      } else {
        setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
        setStreak(0);
      }

      // Update global stats
      const stats = JSON.parse(
        localStorage.getItem("gameStats") ||
          '{"gamesPlayed": 0, "totalScore": 0, "bestStreak": 0}'
      );
      stats.gamesPlayed += 1;
      if (gameResult === "win") {
        stats.totalScore += 5;
      }
      if (streak + 1 > stats.bestStreak) {
        stats.bestStreak = streak + 1;
      }
      localStorage.setItem("gameStats", JSON.stringify(stats));
      uploadScoreToSupabase();

      setIsPlaying(false);
    }, 1000);
  };

  const resetGame = () => {
    playClick();
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setIsPlaying(false);
  };

  const resetScores = () => {
    playClick();
    setScores({ player: 0, computer: 0, draws: 0 });
    setStreak(0);
  };

  const getResultMessage = () => {
    if (!result) return "";
    switch (result) {
      case "win":
        return "You Win! 🎉";
      case "lose":
        return "Computer Wins! 🤖";
      case "draw":
        return "It's a Draw! 🤝";
    }
  };

  const getResultColor = () => {
    if (!result) return "";
    switch (result) {
      case "win":
        return "text-green-400";
      case "lose":
        return "text-red-400";
      case "draw":
        return "text-yellow-400";
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Rock Paper Scissors
          </h1>
          <p className="text-gray-400">
            Beat the computer in this classic game!
          </p>
        </div>
        <Link href="/" className="btn-secondary flex items-center">
          <Home className="w-4 h-4 mr-2" />
          Home
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Game Area */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-xl p-6 border border-violet-400">
            {/* Game Result */}
            <div className="text-center mb-8">
              {result && (
                <p className={`text-2xl font-bold ${getResultColor()}`}>
                  {getResultMessage()}
                </p>
              )}
              {streak > 0 && (
                <p className="text-purple-400 mt-2">Win Streak: {streak} 🔥</p>
              )}
            </div>

            {/* Choices Display */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              {/* Player Choice */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-4">You</h3>
                <div className="w-24 h-24 mx-auto bg-violet-400 rounded-full flex items-center justify-center text-4xl border-2 border-blue-500">
                  {playerChoice
                    ? choices.find((c) => c.name === playerChoice)?.emoji
                    : "❓"}
                </div>
              </div>

              {/* Computer Choice */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Computer
                </h3>
                <div className="w-24 h-24 mx-auto bg-violet-400 rounded-full flex items-center justify-center text-4xl border-2 border-red-500">
                  {isPlaying
                    ? "🤔"
                    : computerChoice
                    ? choices.find((c) => c.name === computerChoice)?.emoji
                    : "❓"}
                </div>
              </div>
            </div>

            {/* Choice Buttons */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {choices.map((choice) => (
                <button
                  key={choice.name}
                  onClick={() => playGame(choice.name)}
                  disabled={isPlaying}
                  className="p-4 bg-violet-400 hover:bg-violet-600 rounded-xl border border-gray-600 hover:border-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-4xl mb-2">{choice.emoji}</div>
                  <div className="text-white font-semibold capitalize">
                    {choice.name}
                  </div>
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
                New Round
              </button>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Scoreboard */}
          <div className="bg-gray-800 rounded-xl p-6 border border-violet-400">
            <h3 className="text-xl font-bold text-white mb-4">Scoreboard</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-400 font-semibold">You</span>
                <span className="text-white font-bold">{scores.player}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-400 font-semibold">Computer</span>
                <span className="text-white font-bold">{scores.computer}</span>
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

          {/* Streak Info */}
          <div className="bg-gray-800 rounded-xl p-6 border border-violet-400">
            <h3 className="text-lg font-bold text-white mb-3">Streaks</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-purple-400">Current</span>
                <span className="text-white font-bold">{streak}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-orange-400">Best</span>
                <span className="text-white font-bold">{bestStreak}</span>
              </div>
            </div>
          </div>

          {/* Game Rules */}
          <div className="bg-gray-800 rounded-xl p-6 border border-violet-400">
            <h3 className="text-lg font-bold text-white mb-3">Rules</h3>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Rock beats Scissors</li>
              <li>• Paper beats Rock</li>
              <li>• Scissors beats Paper</li>
              <li>• Same choice = Draw</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
