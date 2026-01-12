import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export type PaymentSubmission = {
  id: string
  participantEmail: string
  participantWallet: string
  participantName?: string
  amount: number
  paymentMethod: "crypto" | "bank"
  screenshotData: string
  transactionHash?: string
  status: "pending" | "confirmed" | "rejected"
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  rejectionReason?: string
}

export async function POST(request: Request) {
  try {
    const formData = await request.json()
    const { email, wallet, paymentMethod, screenshot, transactionHash } = formData

    if (!email || !wallet || !paymentMethod || !screenshot || !transactionHash) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get participant name
    const { data: participant } = await supabase.from("participants").select("username").eq("email", email).single()

    // Handle screenshot data - check if it's already a string (base64) or a File object
    let screenshotData: string
    if (typeof screenshot === "string") {
      // Already base64 string
      screenshotData = screenshot
    } else {
      // It's a File object, convert to text
      screenshotData = await screenshot.text()
    }

    const { data: submission, error } = await supabase
      .from("payment_submissions")
      .insert({
        participant_email: email,
        participant_name: participant?.username || "Unknown",
        participant_wallet: wallet,
        amount: 100,
        payment_method: paymentMethod,
        screenshot_data: screenshotData,
        transaction_hash: transactionHash,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Failed to save payment submission:", error)
      return NextResponse.json({ error: "Failed to submit payment" }, { status: 500 })
    }

    await supabase.from("activity_logs").insert({
      action: "payment_submitted",
      actor_id: wallet,
      actor_email: email,
      target_type: "payment",
      details: `Payment submission $${submission.amount} via ${paymentMethod} - TxHash: ${transactionHash} - ID: ${submission.id}`,
    })

    console.log("[v0] Payment submission saved:", submission.id)

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      message: "Payment proof submitted successfully",
    })
  } catch (error) {
    console.error("[v0] Payment submission error:", error)
    return NextResponse.json({ error: "Failed to submit payment" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()

    const { data: submissions, error } = await supabase
      .from("payment_submissions")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Failed to fetch submissions:", error)
      return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 })
    }

    const formattedSubmissions = (submissions || []).map((s) => ({
      id: s.id,
      participantEmail: s.participant_email,
      participantWallet: s.participant_wallet,
      participantName: s.participant_name,
      amount: s.amount,
      paymentMethod: s.payment_method,
      screenshotData: s.screenshot_data,
      transactionHash: s.transaction_hash,
      status: s.status,
      submittedAt: s.created_at,
      reviewedAt: s.reviewed_at,
      reviewedBy: s.reviewed_by,
      rejectionReason: s.rejection_reason,
    }))

    console.log("[v0] Fetched payment submissions:", formattedSubmissions.length)

    return NextResponse.json({
      submissions: formattedSubmissions,
      total: formattedSubmissions.length,
      pending: formattedSubmissions.filter((s) => s.status === "pending").length,
      confirmed: formattedSubmissions.filter((s) => s.status === "confirmed").length,
      rejected: formattedSubmissions.filter((s) => s.status === "rejected").length,
    })
  } catch (error) {
    console.error("[v0] Error fetching submissions:", error)
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { submissionId, status, reviewedBy, rejectionReason } = await request.json()
    const supabase = await createClient()

    const { data: submission, error: updateError } = await supabase
      .from("payment_submissions")
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewedBy,
        rejection_reason: rejectionReason || null,
      })
      .eq("id", submissionId)
      .select()
      .single()

    if (updateError) {
      console.error("[v0] Failed to update submission:", updateError)
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    if (status === "confirmed") {
      // First, get the current participant data
      const { data: participant } = await supabase
        .from("participants")
        .select("contributed_amount, wallet_balance, participation_count")
        .eq("email", submission.participant_email)
        .single()

      const newContributedAmount = (participant?.contributed_amount || 0) + 100
      const newWalletBalance = (participant?.wallet_balance || 0) + 200
      const newParticipationCount = (participant?.participation_count || 0) + 1

      const { error: participantError } = await supabase
        .from("participants")
        .update({
          activation_fee_paid: true,
          contribution_approved: true,
          status: "active",
          account_frozen: false,
          contributed_amount: newContributedAmount,
          wallet_balance: newWalletBalance,
          participation_count: newParticipationCount,
        })
        .eq("email", submission.participant_email)

      if (participantError) {
        console.error("[v0] Failed to update participant status:", participantError)
      } else {
        console.log(
          `[v0] Participant activated with rewards: ${submission.participant_email}, +$100 contributed, +$200 wallet, +1 participation`,
        )
      }
    }

    await supabase.from("activity_logs").insert({
      action: status === "confirmed" ? "approve_payment" : "reject_payment",
      actor_id: "admin",
      actor_email: reviewedBy || "admin@system.com",
      target_type: "payment",
      details: `Payment ${status} for ${submission.participant_email} - $${submission.amount} (Submission ID: ${submissionId})${
        rejectionReason ? ` (Reason: ${rejectionReason})` : ""
      }`,
    })

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        participantEmail: submission.participant_email,
        participantWallet: submission.participant_wallet,
        amount: submission.amount,
        status: submission.status,
        submittedAt: submission.created_at,
        reviewedAt: submission.reviewed_at,
      },
    })
  } catch (error) {
    console.error("[v0] Error updating submission:", error)
    return NextResponse.json({ error: "Failed to update submission" }, { status: 500 })
  }
}
