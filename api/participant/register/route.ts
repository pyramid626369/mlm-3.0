import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

function generateReferralCode(username: string): string {
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()
  const userPrefix = username.substring(0, 3).toUpperCase()
  return `${userPrefix}${randomStr}`
}

export async function POST(request: Request) {
  try {
    console.log("[v0] Registration API called")

    const body = await request.json()
    const { username, email, mobileNumber, password, country, state, pinCode, countryCode, referralCode } = body

    console.log("[v0] Registration data received:", { username, email, mobileNumber, referralCode })

    if (!username || !email || !mobileNumber || !password) {
      return NextResponse.json({ success: false, error: "All required fields must be filled" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: existingEmail } = await supabase.from("participants").select("email").eq("email", email).maybeSingle()

    if (existingEmail) {
      return NextResponse.json({ success: false, error: "Email already registered" }, { status: 400 })
    }

    const { data: existingPhone } = await supabase
      .from("participants")
      .select("phone")
      .eq("phone", mobileNumber)
      .maybeSingle()

    if (existingPhone) {
      return NextResponse.json({ success: false, error: "Mobile number already registered" }, { status: 400 })
    }

    const { data: existingUsername } = await supabase
      .from("participants")
      .select("username")
      .eq("username", username.toLowerCase())
      .maybeSingle()

    if (existingUsername) {
      return NextResponse.json({ success: false, error: "Username already taken" }, { status: 400 })
    }

    let referrerData = null
    if (referralCode) {
      const { data: referrer } = await supabase
        .from("participants")
        .select("referral_code, email, username, referral_count, referral_earnings, wallet_balance")
        .eq("referral_code", referralCode.toUpperCase())
        .maybeSingle()

      if (!referrer) {
        return NextResponse.json({ success: false, error: "Invalid referral code" }, { status: 400 })
      }
      referrerData = referrer
    }

    const { data: maxParticipantData } = await supabase
      .from("participants")
      .select("participant_number")
      .order("participant_number", { ascending: false })
      .limit(1)
      .maybeSingle()

    let participantNumber = 500
    if (maxParticipantData && maxParticipantData.participant_number) {
      // If there are existing participants, increment from the highest number
      participantNumber = Math.max(maxParticipantData.participant_number + 1, 500)
    }

    const walletAddress = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`

    const token = "participant_token_" + Math.random().toString(36).substring(7)

    const activationDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    const newReferralCode = generateReferralCode(username)

    const { data: newParticipant, error: insertError } = await supabase
      .from("participants")
      .insert({
        participant_number: participantNumber,
        username: username.toLowerCase(),
        email,
        name: username,
        phone: mobileNumber,
        password, // In production, hash this!
        wallet_address: walletAddress,
        country: country || "",
        country_code: countryCode || "",
        state: state || "",
        postal_code: pinCode || "",
        role: "participant",
        status: "active",
        rank: "bronze",
        activation_fee_paid: false,
        account_frozen: false,
        activation_deadline: activationDeadline,
        referral_code: newReferralCode,
        referred_by: referralCode ? referralCode.toUpperCase() : null,
        referral_count: 0,
        referral_earnings: 0,
        wallet_balance: 0,
        contributed_amount: 0,
      })
      .select()
      .single()

    if (insertError) {
      console.error("[v0] Insert error:", insertError)
      return NextResponse.json({ success: false, error: "Failed to create account" }, { status: 500 })
    }

    if (referrerData) {
      const newReferralCount = (referrerData.referral_count || 0) + 1
      const newReferralEarnings = (referrerData.referral_earnings || 0) + 5
      const newWalletBalance = (referrerData.wallet_balance || 0) + 5

      await supabase
        .from("participants")
        .update({
          referral_count: newReferralCount,
          referral_earnings: newReferralEarnings,
          wallet_balance: newWalletBalance,
        })
        .eq("referral_code", referralCode.toUpperCase())

      await supabase.from("activity_logs").insert({
        action: "referral_bonus",
        actor_id: referrerData.email,
        actor_email: referrerData.email,
        target_type: "participant",
        details: `Earned $5 referral bonus for referring ${username}`,
      })
    }

    await supabase.from("activity_logs").insert({
      action: "user_registration",
      actor_id: newParticipant.id,
      actor_email: email,
      target_type: "participant",
      details: `New user registered: ${username} (${email}). ${referralCode ? `Referred by: ${referralCode}` : "No referral"}. Activation deadline: 24 hours.`,
    })

    console.log("[v0] Registration successful for:", username, email)

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      token,
      participantId: newParticipant.id,
      participantNumber,
      walletAddress,
      username,
      email,
      activationDeadline,
      referralCode: newReferralCode,
      wallet_balance: 0,
      contributed_amount: 0,
      participation_count: 0,
      referral_count: 0,
      referral_earnings: 0,
      activation_fee_paid: false,
      is_frozen: false,
      created_at: newParticipant.created_at,
    })
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ success: false, error: "Registration failed" }, { status: 500 })
  }
}
