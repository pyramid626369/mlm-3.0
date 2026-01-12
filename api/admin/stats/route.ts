import { NextResponse } from "next/server"
import { getAllParticipants } from "@/lib/data-store"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const participants = getAllParticipants()

    // Calculate real stats from actual participant data
    const stats = {
      totalParticipants: participants.length,
      activeParticipants: participants.filter((p: any) => p.status === "active").length,
      totalContributed: participants.reduce((sum: number, p: any) => sum + (p.totalGiven || 0), 0),
      totalRewards: participants.reduce((sum: number, p: any) => sum + (p.totalReceived || 0), 0),
      newThisWeek: participants.filter((p: any) => {
        const created = new Date(p.created_at)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return created > weekAgo
      }).length,
      activatedUsers: participants.filter((p: any) => p.activation_fee_paid === true).length,
      flaggedUsers: participants.filter((p: any) => (p.risk_score || 0) >= 50).length,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("[API] Error fetching stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
