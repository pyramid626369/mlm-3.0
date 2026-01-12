import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email, amount, bep20_address } = await request.json()

    console.log("[v0] Payout request received:", { email, amount, bep20_address })

    if (!email || !amount || !bep20_address) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get participant's current wallet balance
    const { data: participant, error: fetchError } = await supabase
      .from("participants")
      .select("wallet_balance, username, email")
      .eq("email", email)
      .single()

    if (fetchError || !participant) {
      console.error("[v0] Error fetching participant:", fetchError)
      return NextResponse.json({ success: false, error: "Participant not found" }, { status: 404 })
    }

    console.log("[v0] Current wallet balance:", participant.wallet_balance)

    // Check if wallet balance is sufficient
    if (participant.wallet_balance < amount) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient balance. Available: $${participant.wallet_balance}, Requested: $${amount}`,
        },
        { status: 400 },
      )
    }

    // Calculate new balance
    const newBalance = participant.wallet_balance - amount

    // Deduct amount from wallet balance
    const { error: updateError } = await supabase
      .from("participants")
      .update({ wallet_balance: newBalance })
      .eq("email", email)

    if (updateError) {
      console.error("[v0] Error updating wallet balance:", updateError)
      return NextResponse.json({ success: false, error: "Failed to update wallet balance" }, { status: 500 })
    }

    // Create payout request record
    const { data: payoutRequest, error: insertError } = await supabase
      .from("payout_requests")
      .insert({
        participant_email: email,
        participant_name: participant.username,
        bep20_address: bep20_address,
        amount: amount,
        wallet_balance_before: participant.wallet_balance,
        wallet_balance_after: newBalance,
        status: "pending",
      })
      .select()
      .single()

    if (insertError) {
      console.error("[v0] Error creating payout request:", insertError)
      // Rollback wallet balance update
      await supabase.from("participants").update({ wallet_balance: participant.wallet_balance }).eq("email", email)
      return NextResponse.json({ success: false, error: "Failed to create payout request" }, { status: 500 })
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_email: email,
      action: "payout_requested",
      details: `Requested payout of $${amount} to ${bep20_address}`,
    })

    console.log("[v0] Payout request created successfully:", payoutRequest)

    return NextResponse.json({
      success: true,
      message: "Payout request submitted successfully",
      newBalance: newBalance,
      requestId: payoutRequest.id,
    })
  } catch (error) {
    console.error("[v0] Payout request error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
