import { type NextRequest, NextResponse } from "next/server"

// In a real application, this would connect to a database
const scores: any[] = []

export async function GET() {
  return NextResponse.json({ scores })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, game, score, moves, time } = body

    const newScore = {
      id: Date.now().toString(),
      username,
      game,
      score,
      moves,
      time,
      timestamp: new Date().toISOString(),
    }

    scores.push(newScore)

    return NextResponse.json({ success: true, score: newScore })
  } catch (error) {
    return NextResponse.json({ error: "Failed to save score" }, { status: 500 })
  }
}
