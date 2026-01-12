import { type NextRequest, NextResponse } from "next/server"

// Mock pending activation payments for demo
const mockActivationPayments = [
  {
    id: "act_001",
    email: "user1@example.com",
    username: "crypto_king",
    wallet: "0x1234...5678",
    amount: 100,
    paymentMethod: "crypto",
    screenshotUrl: "/placeholder.svg?height=200&width=300",
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: "pending",
  },
  {
    id: "act_002",
    email: "user2@example.com",
    username: "flow_master",
    wallet: "0xabcd...efgh",
    amount: 100,
    paymentMethod: "bank",
    screenshotUrl: "/placeholder.svg?height=200&width=300",
    submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    status: "pending",
  },
]

export async function GET() {
  return NextResponse.json({
    success: true,
    payments: mockActivationPayments,
    stats: {
      pending: mockActivationPayments.length,
      approved_today: 12,
      rejected_today: 2,
      total_collected: 1400,
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const { paymentId, action, reason } = await request.json()

    if (!paymentId || !action) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }

    console.log("[v0] Activation payment action:", { paymentId, action, reason })

    // In production, this would:
    // 1. Update user record
    // 2. If approved: set activation_fee_paid = true, status = "active"
    // 3. If rejected: keep status = "frozen", set rejection reason
    // 4. Create audit log entry
    // 5. Send notification to user

    return NextResponse.json({
      success: true,
      message: action === "approve" ? "Payment approved, account activated" : "Payment rejected",
    })
  } catch (error) {
    console.error("[v0] Activation action error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
