import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      console.log("[v0] Warning: No auth token provided")
    }

    const supabase = await createClient()

    const { data: participants, error } = await supabase
      .from("participants")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching participants from Supabase:", error)
      return NextResponse.json({ error: "Failed to fetch participants" }, { status: 500 })
    }

    console.log("[v0] Fetched participants from Supabase. Count:", participants?.length || 0)

    const formattedParticipants = (participants || []).map((p) => ({
      id: p.id,
      participantNumber: p.participant_number,
      wallet_address: p.wallet_address || "",
      email: p.email,
      name: p.name || p.username || "Unknown",
      username: p.username,
      phone: p.phone || "",
      address: p.address || "",
      city: p.city || "",
      state: p.state || "",
      country: p.country || "",
      countryCode: p.country_code || "",
      pinCode: p.postal_code || "",
      role: p.role || "participant",
      created_at: p.created_at,
      last_active: p.last_active || p.created_at,
      status: p.status || "active",
      activation_fee_paid: p.activation_fee_paid || false,
      account_frozen: p.account_frozen || false,
      wallet_balance: p.wallet_balance || 0,
      contributed_amount: p.contributed_amount || 0,
      totalGiven: p.total_given || 0,
      totalReceived: p.total_received || 0,
      pendingRequests: p.pending_requests || 0,
      completedTransactions: p.completed_transactions || 0,
      participation_count: p.participation_count || 0,
      risk_score: p.risk_score || 10,
    }))

    return NextResponse.json({
      participants: formattedParticipants,
      total: formattedParticipants.length,
    })
  } catch (error) {
    console.error("[v0] Error in participants API:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch participants",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
