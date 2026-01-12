"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FlowChainLogo } from "@/components/flowchain-logo"
import { ArrowLeft, Eye, EyeOff, Sparkles, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ParticipantLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter your email and password",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/auth/participant-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        const participantData = {
          email: data.email,
          username: data.username,
          name: data.name,
          walletAddress: data.walletAddress,
          activation_fee_paid: data.activation_fee_paid,
          contribution_approved: data.contribution_approved,
          bep20_address: data.bep20_address,
          contributed_amount: data.contributed_amount || 0,
          wallet_balance: data.wallet_balance || 0,
          participation_count: data.participation_count || 0,
          referral_count: data.referral_count || 0,
          referral_earnings: data.referral_earnings || 0,
          referral_code: data.referral_code || "",
          activation_deadline: data.activation_deadline,
          created_at: data.created_at,
          is_frozen: data.is_frozen,
        }

        sessionStorage.setItem("participant_token", data.token)
        sessionStorage.setItem("participant_wallet", data.walletAddress)

        // Store complete participant data in localStorage for dashboard
        localStorage.setItem("participantData", JSON.stringify(participantData))

        console.log("[v0] Login successful, stored data:", participantData)

        toast({
          title: "Welcome back!",
          description: "Successfully signed in",
        })

        window.location.href = "/participant/dashboard"
      } else {
        throw new Error(data.error || "Login failed")
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid email or password",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-white">
      {/* Background effects */}
      <div className="fixed inset-0 mesh-gradient-light" />
      <div className="fixed inset-0 grid-pattern-light" />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="blob absolute w-[400px] h-[400px] -top-32 -right-32 bg-gradient-to-br from-purple-200/30 to-cyan-200/30 animate-float-slow" />
        <div
          className="blob absolute w-[300px] h-[300px] bottom-1/4 -left-20 bg-gradient-to-br from-pink-200/20 to-orange-200/20 animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="w-full max-w-sm space-y-6 relative z-10">
        <div className="text-center space-y-2 animate-fade-in-up">
          <FlowChainLogo size="lg" showTagline={true} className="justify-center mb-4" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-cyan-100 border border-purple-200 mb-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-xs font-semibold text-purple-700">Welcome Back</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Sign in to your account</h1>
          <p className="text-sm text-slate-500">Enter your credentials to continue</p>
        </div>

        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm animate-fade-in-up-delay-1">
          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 input-field-light text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-700 text-sm font-medium">
                    Password
                  </Label>
                  <button type="button" className="text-xs text-[#7c3aed] hover:underline font-medium">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pr-10 input-field-light text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-[#E85D3B] to-orange-500 hover:from-[#d14d2c] hover:to-orange-600 text-white rounded-xl shadow-lg shadow-[#E85D3B]/30 font-semibold text-base transition-all hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center space-y-4 animate-fade-in-up-delay-2">
          <p className="text-sm text-slate-500">
            Don't have an account?{" "}
            <button
              onClick={() => router.push("/participant/register")}
              className="text-[#7c3aed] hover:underline font-semibold"
            >
              Create account
            </button>
          </p>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Button>
        </div>
      </div>
    </div>
  )
}
