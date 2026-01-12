import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, otp, loginType } = body

    console.log("[v0] Secure login attempt:", { email, loginType })

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const ADMIN_EMAIL = "admin@123"
    const ADMIN_PASSWORD = "parth890"

    const SUPER_ADMIN_EMAIL = "bitcoin890@gmail.com"
    const SUPER_ADMIN_PASSWORD = "bitcoin890"

    // Check if logging in as Super Admin
    if (loginType === "superadmin") {
      console.log("[v0] Super admin login check")
      if (email !== SUPER_ADMIN_EMAIL) {
        console.log("[v0] Super admin email mismatch")
        return NextResponse.json({ error: "Unauthorized access" }, { status: 403 })
      }
      if (otp !== SUPER_ADMIN_PASSWORD) {
        console.log("[v0] Super admin password mismatch")
        return NextResponse.json({ error: "Invalid password" }, { status: 401 })
      }

      const token = "superadmin_" + Buffer.from(`${SUPER_ADMIN_EMAIL}:${Date.now()}`).toString("base64")
      console.log("[v0] Super admin login successful")

      return NextResponse.json({
        success: true,
        token,
        email,
        role: "super_admin",
        name: "Super Admin",
        permissions: {
          canApproveWallets: true,
          canCollectTokens: true,
        },
      })
    }

    console.log("[v0] Admin login check - email:", email, "expected:", ADMIN_EMAIL)
    console.log("[v0] Admin password check - matches:", otp === ADMIN_PASSWORD)

    if (email !== ADMIN_EMAIL) {
      console.log("[v0] Admin email mismatch")
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 })
    }

    if (otp !== ADMIN_PASSWORD) {
      console.log("[v0] Admin password mismatch")
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    const token = "admin_" + Buffer.from(`${ADMIN_EMAIL}:${Date.now()}`).toString("base64")
    console.log("[v0] Admin login successful")

    return NextResponse.json({
      success: true,
      token,
      email,
      role: "admin",
      name: "Admin",
      permissions: {
        canViewParticipants: true,
        canViewPayments: true,
        canManageAccounts: true,
      },
    })
  } catch (error) {
    console.error("[v0] Secure login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
