import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { email, bep20_address } = await request.json()

    if (!email || !bep20_address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate BEP20 address format (starts with 0x and is 42 characters)
    if (!/^0x[a-fA-F0-9]{40}$/.test(bep20_address)) {
      return NextResponse.json({ error: "Invalid BEP20 address format" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("participants")
      .update({ bep20_address })
      .eq("email", email)
      .select()
      .single()

    if (error) {
      console.error("Failed to update BEP20 address:", error)
      return NextResponse.json({ error: "Failed to update BEP20 address" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "BEP20 address updated successfully",
      data,
    })
  } catch (error) {
    console.error("Update BEP20 error:", error)
    return NextResponse.json({ error: "Failed to update BEP20 address" }, { status: 500 })
  }
}
