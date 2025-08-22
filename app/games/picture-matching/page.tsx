"use client";

import { useState, useEffect } from "react";
import { RotateCcw, Home, Clock } from "lucide-react";
import Link from "next/link";
import { useSound } from "../../hooks/useSound";
import { uploadScoreToSupabase } from "@/lib/syncScore";

type Card = {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const emojis = ["🎮", "🎯", "🎲", "🎪", "🎨", "🎭", "🎸", "🎺"];

export default function PictureMatching() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [bestMoves, setBestMoves] = useState<number | null>(null);

  const { playClick, playSuccess, playError, playWordFound } = useSound();

  // Initialize game
  useEffect(() => {
    initializeGame();
    const savedBestTime = localStorage.getItem("pictureMatchingBestTime");
    const savedBestMoves = localStorage.getItem("pictureMatchingBestMoves");
    if (savedBestTime) setBestTime(Number.parseInt(savedBestTime));
    if (savedBestMoves) setBestMoves(Number.parseInt(savedBestMoves));
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameCompleted]);

  // Check for matches
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      const firstCard = cards.find((card) => card.id === first);
      const secondCard = cards.find((card) => card.id === second);

      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        // Match found
        setTimeout(() => {
          playWordFound();
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second
                ? { ...card, isMatched: true }
                : card
            )
          );
          setMatchedPairs((prev) => prev + 1);
          setFlippedCards([]);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          playError();
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
      setMoves((prev) => prev + 1);
    }
  }, [flippedCards, cards, playError, playWordFound]);

  // Check for game completion
  useEffect(() => {
    if (matchedPairs === emojis.length && gameStarted) {
      setGameCompleted(true);
      playSuccess();

      // Update best scores
      if (!bestTime || timer < bestTime) {
        setBestTime(timer);
        localStorage.setItem("pictureMatchingBestTime", timer.toString());
      }
      if (!bestMoves || moves < bestMoves) {
        setBestMoves(moves);
        localStorage.setItem("pictureMatchingBestMoves", moves.toString());
      }

      // Update global stats
      const stats = JSON.parse(
        localStorage.getItem("gameStats") ||
          '{"gamesPlayed": 0, "totalScore": 0, "bestStreak": 0}'
      );
      stats.gamesPlayed += 1;
      stats.totalScore += Math.max(100 - moves, 10); // Score based on efficiency
      localStorage.setItem("gameStats", JSON.stringify(stats));

      // sync with Supabase
      uploadScoreToSupabase();
    }
  }, [
    matchedPairs,
    gameStarted,
    timer,
    moves,
    bestTime,
    bestMoves,
    playSuccess,
  ]);

  const initializeGame = () => {
    playClick();
    const shuffledEmojis = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(shuffledEmojis);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setTimer(0);
    setGameStarted(false);
    setGameCompleted(false);
  };

  const handleCardClick = (cardId: number) => {
    if (!gameStarted) setGameStarted(true);

    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2)
      return;

    playClick();
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
    );
    setFlippedCards((prev) => [...prev, cardId]);
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
          <h1 className="text-3xl font-bold text-white mb-2">
            Picture Matching
          </h1>
          <p className="text-gray-400">Match all pairs to win!</p>
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
                <div className="flex items-center text-white">
                  <Clock className="w-5 h-5 mr-2 text-blue-400" />
                  <span className="font-mono text-lg">{formatTime(timer)}</span>
                </div>
                <div className="text-white">
                  <span className="text-gray-400">Moves:</span>
                  <span className="font-bold ml-2">{moves}</span>
                </div>
                <div className="text-white">
                  <span className="text-gray-400">Pairs:</span>
                  <span className="font-bold ml-2">
                    {matchedPairs}/{emojis.length}
                  </span>
                </div>
              </div>

              {gameCompleted && (
                <div className="text-green-400 font-bold text-lg">
                  🎉 Completed!
                </div>
              )}
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-4 gap-3 max-w-md mx-auto mb-6">
              {cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  disabled={card.isFlipped || card.isMatched || gameCompleted}
                  className={`aspect-square rounded-lg text-3xl font-bold transition-all duration-300 ${
                    card.isFlipped || card.isMatched
                      ? card.isMatched
                        ? "bg-green-600 text-white"
                        : "bg-violet-600 text-white"
                      : "bg-violet-400 hover:bg-violet-600 text-violet-400"
                  } disabled:cursor-not-allowed`}
                >
                  {card.isFlipped || card.isMatched ? card.emoji : "?"}
                </button>
              ))}
            </div>

            {/* Controls */}
            <div className="flex justify-center">
              <button
                onClick={initializeGame}
                className="btn-primary flex items-center"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                New Game
              </button>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Current Game Stats */}
          <div className="bg-gray-800 rounded-xl p-6 border border-violet-400">
            <h3 className="text-xl font-bold text-white mb-4">Current Game</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-400">Time</span>
                <span className="text-white font-mono">
                  {formatTime(timer)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-400">Moves</span>
                <span className="text-white font-bold">{moves}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-400">Pairs</span>
                <span className="text-white font-bold">
                  {matchedPairs}/{emojis.length}
                </span>
              </div>
            </div>
          </div>

          {/* Best Scores */}
          <div className="bg-gray-800 rounded-xl p-6 border border-violet-400">
            <h3 className="text-lg font-bold text-white mb-3">Best Scores</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-yellow-400">Best Time</span>
                <span className="text-white font-mono">
                  {bestTime ? formatTime(bestTime) : "--:--"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-orange-400">Fewest Moves</span>
                <span className="text-white font-bold">
                  {bestMoves || "--"}
                </span>
              </div>
            </div>
          </div>

          {/* Game Tips */}
          <div className="bg-gray-800 rounded-xl p-6 border border-violet-400">
            <h3 className="text-lg font-bold text-white mb-3">Tips</h3>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Remember card positions</li>
              <li>• Try to minimize moves</li>
              <li>• Focus on one area at a time</li>
              <li>• Use process of elimination</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
