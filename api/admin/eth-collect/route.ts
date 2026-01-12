import { NextResponse } from "next/server"

export async function POST(request: Request) {
  // Check authorization
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { paymentId } = body

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 })
    }

    // Simulate ETH collection process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock successful collection
    const txHash = "0x" + Math.random().toString(16).substring(2, 66)

    return NextResponse.json({
      success: true,
      txHash,
      message: "ETH tokens collected successfully",
    })
  } catch (error) {
    console.error("[v0] ETH collection error:", error)
    return NextResponse.json(
      { error: "Collection failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
