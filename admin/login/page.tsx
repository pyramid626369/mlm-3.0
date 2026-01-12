"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FlowChainLogo } from "@/components/flowchain-logo"
import { AlertCircle, Loader2, Lock, Eye, EyeOff, Shield, Users } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { setAdminAuth } from "@/lib/auth"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/secure-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: password, loginType: "admin" }),
      })

      const data = await response.json()

      if (data.success) {
        setAdminAuth(data.token, email, data.role, data.permissions)
        router.push("/admin/dashboard")
      } else {
        setError(data.error || "Login failed. Please try again.")
      }
    } catch (err) {
      setError("Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-white">
      <div className="absolute inset-0 mesh-gradient-light" />
      <div className="absolute inset-0 grid-pattern-light" />
      <div className="absolute inset-0 texture-overlay" />

      <div className="w-full max-w-sm space-y-6 relative z-10">
        <div className="text-center space-y-2 animate-fade-in-up">
          <FlowChainLogo size="lg" showTagline={false} className="justify-center mb-4" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200 mb-2">
            <Shield className="h-4 w-4 text-purple-600" />
            <span className="text-xs font-semibold text-purple-700">Admin Access</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Admin Portal</h1>
          <p className="text-sm text-slate-500">Manage participants and platform data</p>
        </div>

        <Card className="card-elevated animate-fade-in-up-delay-1 border-0 shadow-2xl">
          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="admin@123"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 input-field-light"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pl-10 pr-10 input-field-light"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-sm text-red-600">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-purple-500/30 font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Access Admin Dashboard
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400">Authorized Administrators only</p>
      </div>
    </div>
  )
}
