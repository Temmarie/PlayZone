// lib/syncScore.ts
import supabase from "@/lib/supabase";
import { ensureUserId } from "@/lib/userId";

export async function uploadScoreToSupabase() {
  const userId = ensureUserId(); // ✅ unified

  const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
  const gameStats = JSON.parse(localStorage.getItem("gameStats") || "{}");

  if (!userProfile?.username) return;

  const { data, error } = await supabase
    .from("leaderboard")
    .upsert(
      [
        {
          id: userId,
          username: userProfile.username,
          avatar: userProfile.avatar,
          favoriteGame: userProfile.favoriteGame || "Picture Matching",
          totalScore: gameStats.totalScore || 0,
          gamesPlayed: gameStats.gamesPlayed || 0,
          bestStreak: gameStats.bestStreak || 0,
        },
      ],
      { onConflict: "id" }
    )
    .select();

  if (error) {
    console.error("❌ Supabase upload failed:", error.message);
  } else {
    console.log("✅ Synced to Supabase:", data);
  }
}
