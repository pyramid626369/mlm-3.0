import { NextResponse } from "next/server"
import { mockPayments } from "@/lib/mock-data"

export async function GET(request: Request) {
  // Check authorization
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // In production, this would fetch from your database
  // For now, return mock data
  return NextResponse.json({
    payments: mockPayments,
    success: true,
  })
}
