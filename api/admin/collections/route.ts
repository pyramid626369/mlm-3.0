import { NextResponse } from "next/server"

export async function GET(request: Request) {
  // Check authorization
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Mock collection history
  const collections = [
    {
      id: "1",
      user_address: "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5",
      amount: 3000,
      tx_hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      created_at: "2024-01-14T17:00:00Z",
      chain: "ETH",
    },
  ]

  return NextResponse.json({
    collections,
    success: true,
  })
}
