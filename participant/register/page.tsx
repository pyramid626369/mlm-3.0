"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FlowChainLogo } from "@/components/flowchain-logo"
import { Eye, EyeOff, AtSign, Mail, Phone, MapPin, Globe, RefreshCcw, Gift } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const COUNTRY_CODES = [
  { code: "+1", country: "US/CA", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+60", country: "Malaysia", flag: "🇲🇾" },
  { code: "+62", country: "Indonesia", flag: "🇮🇩" },
  { code: "+63", country: "Philippines", flag: "🇵🇭" },
  { code: "+82", country: "South Korea", flag: "🇰🇷" },
  { code: "+66", country: "Thailand", flag: "🇹🇭" },
]

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "India",
  "China",
  "Japan",
  "Germany",
  "France",
  "Australia",
  "Canada",
  "UAE",
  "Singapore",
  "Malaysia",
  "Indonesia",
  "Philippines",
  "South Korea",
  "Thailand",
  "Vietnam",
  "Pakistan",
  "Bangladesh",
  "Nigeria",
]

export default function ParticipantRegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: 0 })
  const [captchaInput, setCaptchaInput] = useState("")

  const [referralApplied, setReferralApplied] = useState(false)

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    countryCode: "+1",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    country: "",
    state: "",
    pinCode: "",
    referralCode: "",
  })

  useEffect(() => {
    generateCaptcha()
  }, [])

  useEffect(() => {
    const refCode = searchParams.get("ref")
    if (refCode && !referralApplied) {
      setFormData((prev) => ({ ...prev, referralCode: refCode.toUpperCase() }))
      setReferralApplied(true)
      toast({
        title: "Referral Code Applied!",
        description: `You'll earn rewards when you sign up with code: ${refCode}`,
      })
    }
  }, [searchParams, referralApplied, toast])

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1
    const num2 = Math.floor(Math.random() * 10) + 1
    setCaptcha({ num1, num2, answer: num1 + num2 })
    setCaptchaInput("")
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.mobileNumber || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return false
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
      toast({
        title: "Error",
        description: "Username must be 3-20 characters, only letters, numbers, and underscores",
        variant: "destructive",
      })
      return false
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return false
    }

    if (!/^\d{7,15}$/.test(formData.mobileNumber)) {
      toast({
        title: "Error",
        description: "Please enter a valid mobile number (7-15 digits)",
        variant: "destructive",
      })
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return false
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      })
      return false
    }

    if (Number.parseInt(captchaInput) !== captcha.answer) {
      toast({
        title: "Error",
        description: "Incorrect captcha answer. Please try again.",
        variant: "destructive",
      })
      generateCaptcha()
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      console.log("[v0] Submitting registration...")
      const response = await fetch("/api/participant/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          mobileNumber: `${formData.countryCode}${formData.mobileNumber}`,
          referralCode: formData.referralCode || undefined, // Include referral code in registration
        }),
      })

      const data = await response.json()
      console.log("[v0] Registration response:", data)

      if (data.success) {
        // Store all participant data in localStorage with proper structure
        const participantData = {
          id: data.participantId,
          email: formData.email,
          username: data.username || formData.username,
          wallet_address: data.walletAddress,
          activation_fee_paid: false,
          created_at: new Date().toISOString(),
          is_frozen: false,
          referral_code: data.referralCode || "",
          wallet_balance: data.wallet_balance || 0,
          contributed_amount: data.contributed_amount || 0,
          participation_count: 0,
          referral_count: 0,
          referral_earnings: 0,
          activation_deadline: data.activation_deadline,
          bep20_address: "",
        }

        localStorage.setItem("participantData", JSON.stringify(participantData))
        localStorage.setItem("participant_token", data.token)

        console.log("[v0] Auth data stored in localStorage")

        toast({
          title: "Account Created!",
          description: `Welcome @${formData.username}! Redirecting to dashboard...`,
        })

        window.location.href = "/participant/dashboard"
      } else {
        throw new Error(data.error || "Registration failed")
      }
    } catch (error) {
      console.error("[v0] Registration error:", error)
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-white">
      <div className="absolute inset-0 mesh-gradient-light" />
      <div className="absolute inset-0 grid-pattern-light" />
      <div className="absolute inset-0 texture-overlay" />

      <div className="w-full max-w-2xl space-y-6 relative z-10 my-8">
        <div className="text-center space-y-2 animate-fade-in-up">
          <FlowChainLogo size="lg" showTagline={true} className="justify-center mb-4" />
          <h1 className="text-3xl font-bold text-slate-900">Create your account</h1>
          <p className="text-sm text-slate-500">Join FlowChain in less than a minute</p>
        </div>

        <Card className="card-elevated animate-fade-in-up-delay-1">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-700 text-sm font-medium flex items-center gap-2">
                  <AtSign className="h-4 w-4 text-[#7c3aed]" />
                  Username *
                </Label>
                <Input
                  id="username"
                  placeholder="your_username"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  className="h-11 input-field-light"
                  maxLength={20}
                  required
                />
                <p className="text-xs text-slate-400">3-20 characters, letters, numbers, and underscores only</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#7c3aed]" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="h-11 input-field-light"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobileNumber" className="text-slate-700 text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#7c3aed]" />
                  Mobile Number *
                </Label>
                <div className="flex gap-2">
                  <Select value={formData.countryCode} onValueChange={(value) => handleChange("countryCode", value)}>
                    <SelectTrigger className="w-[140px] h-11 input-field-light">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {COUNTRY_CODES.map((item) => (
                        <SelectItem key={item.code} value={item.code} className="cursor-pointer hover:bg-slate-50">
                          <span className="flex items-center gap-2">
                            <span>{item.flag}</span>
                            <span>{item.code}</span>
                            <span className="text-xs text-slate-400">({item.country})</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="mobileNumber"
                    type="tel"
                    placeholder="1234567890"
                    value={formData.mobileNumber}
                    onChange={(e) => handleChange("mobileNumber", e.target.value.replace(/\D/g, ""))}
                    className="flex-1 h-11 input-field-light"
                    maxLength={15}
                    required
                  />
                </div>
                <p className="text-xs text-slate-400">Enter number without country code</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-slate-700 text-sm font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4 text-[#7c3aed]" />
                    Country (Optional)
                  </Label>
                  <Select value={formData.country} onValueChange={(value) => handleChange("country", value)}>
                    <SelectTrigger className="h-11 input-field-light">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="bg-white max-h-[200px]">
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country} className="cursor-pointer hover:bg-slate-50">
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="text-slate-700 text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#7c3aed]" />
                    State (Optional)
                  </Label>
                  <Input
                    id="state"
                    placeholder="e.g., California"
                    value={formData.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    className="h-11 input-field-light"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pinCode" className="text-slate-700 text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#7c3aed]" />
                  Pin Code / Postal Code (Optional)
                </Label>
                <Input
                  id="pinCode"
                  placeholder="e.g., 110001"
                  value={formData.pinCode}
                  onChange={(e) => handleChange("pinCode", e.target.value)}
                  className="h-11 input-field-light"
                  maxLength={10}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referralCode" className="text-slate-700 text-sm font-medium flex items-center gap-2">
                  <Gift className="h-4 w-4 text-emerald-500" />
                  Referral Code (Optional)
                </Label>
                <Input
                  id="referralCode"
                  placeholder="Enter referral code (e.g., ABC123XYZ)"
                  value={formData.referralCode}
                  onChange={(e) => handleChange("referralCode", e.target.value.toUpperCase())}
                  className="h-11 input-field-light font-mono"
                  maxLength={20}
                />
                <p className="text-xs text-slate-400">Have a referral code? Enter it here to get special rewards!</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 text-sm font-medium">
                  Password *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className="h-11 pr-10 input-field-light"
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
                <p className="text-xs text-slate-400">At least 6 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700 text-sm font-medium">
                  Confirm Password *
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  className="h-11 input-field-light"
                  required
                />
              </div>

              <div className="space-y-2 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200">
                <Label className="text-slate-700 text-sm font-medium flex items-center gap-2">
                  <span className="text-[#7c3aed]">🔒</span>
                  Security Check *
                </Label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-lg border-2 border-violet-300 font-mono text-lg font-bold text-slate-700">
                    <span>{captcha.num1}</span>
                    <span className="text-[#7c3aed]">+</span>
                    <span>{captcha.num2}</span>
                    <span className="text-[#7c3aed]">=</span>
                    <span className="text-slate-400">?</span>
                  </div>
                  <Input
                    type="number"
                    placeholder="Answer"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    className="w-24 h-11 input-field-light text-center font-bold"
                    required
                  />
                  <Button
                    type="button"
                    onClick={generateCaptcha}
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 border-violet-300 hover:bg-violet-50 bg-transparent"
                  >
                    <RefreshCcw className="h-4 w-4 text-[#7c3aed]" />
                  </Button>
                </div>
                <p className="text-xs text-slate-500">Solve the math problem to verify you're human</p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-[#E85D3B] to-orange-500 hover:from-[#d14d2c] hover:to-orange-600 text-white rounded-xl shadow-lg shadow-[#E85D3B]/30 font-semibold text-base transition-all hover:scale-[1.02]"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500 animate-fade-in-up-delay-2">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/participant/login")}
            className="text-[#e85d3b] hover:underline font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}
