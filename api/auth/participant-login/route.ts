import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log("[v0] Login attempt for email:", email)

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: participant, error } = await supabase
      .from("participants")
      .select("*")
      .eq("email", email)
      .maybeSingle()

    if (error) {
      console.error("[v0] Database error:", error)
      return NextResponse.json({ success: false, error: "Database error" }, { status: 500 })
    }

    if (!participant) {
      console.log("[v0] Participant not found in database")

      await supabase.from("activity_logs").insert({
        action: "login_failed",
        actor_id: "unknown",
        actor_email: email,
        target_type: "authentication",
        details: `Failed login attempt for ${email}`,
      })

      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    // Check password (in production, use bcrypt to compare hashed passwords)
    if (participant.password !== password) {
      console.log("[v0] Password mismatch")

      await supabase.from("activity_logs").insert({
        action: "login_failed",
        actor_id: participant.id,
        actor_email: email,
        target_type: "authentication",
        details: `Failed login attempt for ${email} - incorrect password`,
      })

      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    // Update last active timestamp
    await supabase.from("participants").update({ last_active: new Date().toISOString() }).eq("id", participant.id)

    // Generate token
    const token = "participant_token_" + Math.random().toString(36).substring(7)

    console.log("[v0] Participant login successful:", { email, walletAddress: participant.wallet_address })

    await supabase.from("activity_logs").insert({
      action: "login",
      actor_id: participant.id,
      actor_email: participant.email,
      target_type: "authentication",
      details: `${participant.username || participant.name} logged in`,
    })

    return NextResponse.json({
      success: true,
      token,
      walletAddress: participant.wallet_address,
      email: participant.email,
      username: participant.username || participant.email.split("@")[0],
      name: participant.name || participant.username || participant.email.split("@")[0],
      activation_fee_paid: participant.activation_fee_paid || false,
      contribution_approved: participant.contribution_approved || false,
      bep20_address: participant.bep20_address || "",
      contributed_amount: participant.contributed_amount || 0,
      wallet_balance: participant.wallet_balance || 0,
      participation_count: participant.participation_count || 0,
      referral_count: participant.referral_count || 0,
      referral_earnings: participant.referral_earnings || 0,
      referral_code: participant.referral_code || "",
      activation_deadline: participant.activation_deadline,
      created_at: participant.created_at || new Date().toISOString(),
      is_frozen: participant.account_frozen || false,
    })
  } catch (error) {
    console.error("[v0] Participant login error:", error)
    return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 })
  }
}
