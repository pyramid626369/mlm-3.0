"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FlowChainLogo } from "@/components/flowchain-logo"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Wallet,
  LogOut,
  Copy,
  Check,
  Upload,
  CheckCircle2,
  X,
  Bell,
  AlertTriangle,
  ArrowUpRight,
  History,
  Send,
  User,
  Headphones,
  Loader2,
  PiggyBank,
  Sparkles,
  TrendingUp,
  Trophy,
  Bot,
  Clock,
  QrCode,
  Zap,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { isParticipantAuthenticated, clearParticipantAuth } from "@/lib/auth"

import { ParticipantProfileDialog } from "@/components/participant-profile-dialog"
import { SupportDialog } from "@/components/support-dialog"
import { WalletConnectDialog } from "@/components/wallet-connect-dialog"
import { GasFeeApprovalDialog } from "@/components/gas-fee-approval-dialog"
import { AIChatbotDialog } from "@/components/ai-chatbot-dialog"
import { UserRankBadge } from "@/components/user-rank-badge"
import type { UserRank } from "@/lib/types"

const ADMIN_WALLET_ADDRESS = "0xFlowChain1234567890abcdef1234567890abcdef"
const FIXED_AMOUNT = 100

const SAMPLE_USERNAMES = [
  "amit.k",
  "rohit92",
  "ankit.patel",
  "deepak.s",
  "john.miller",
  "neha",
  "ghostx",
  "sanjay.mehta",
  "ravi23",
  "manish.j",
  "alex.brown",
  "vikas",
  "pradeep.agarwal",
  "rakesh7",
  "sandeep.m",
  "nina",
  "darkwolf",
  "amit.verma",
  "rohit.m",
  "karan88",
  "peter.wilson",
  "alok",
  "deepak.singh",
  "sunil.k",
  "yash21",
  "lucas.martin",
  "rahul.k",
  "ankit.gupla",
  "sachin",
  "playerone",
  "mahesh.jain",
  "harish.s",
  "rohan45",
  "emma.clark",
  "mohit",
  "dinesh.yadav",
  "vikram.p",
  "ajay",
  "stealthguy",
  "sanjay.r",
  "naveen.kumar",
  "tushar99",
  "oliver.jones",
  "ramesh",
  "pradeep.v",
  "gaurav.singh",
  "manoj.k",
  "aarav",
  "sneha",
  "mukesh.t",
  "daniel.moore",
  "ankit77",
  "suresh",
  "rahul.patel",
  "ankur.m",
  "yogesh",
  "maria.garcia",
  "rohit.k",
  "harendra.s",
  "pankaj55",
  "james.anderson",
  "amit.m",
  "sumit",
  "akash",
  "shadowfox",
  "devendra.t",
  "priyanka",
  "nilesh.p",
  "frank.thomas",
  "shubham",
  "rakesh.y",
  "nishant",
  "kuldeep23",
  "aditya.singh",
  "kevin.white",
  "varun",
  "sanjay.k",
  "pooja",
  "tarun.m",
  "liam.harris",
  "lokesh",
  "ankit.s",
  "soham",
  "arjun.patel",
  "lucas89",
  "michael.scott",
  "vinod.k",
  "saurabh",
  "nitin.j",
]

interface LeaderboardEntry {
  position: number
  username: string
  participantNumber: number
  rank: UserRank
  participation_count: number
  country: string
  contributedAmount: number
}

const Dashboard = () => {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [participantData, setParticipantData] = useState<{
    wallet: string
    email?: string
    name?: string
    username?: string
    activation_fee_paid?: boolean
    contribution_approved?: boolean // Added for rewards enablement
    bep20_address?: string // Added for BEP20 address
    created_at?: string
    is_frozen?: boolean
    activation_deadline?: string
    wallet_balance?: number // Added for wallet balance
    contributed_amount?: number // Added for total contributed
    participation_count?: number // Added for total contributions count
    referral_code?: string // Added for referral code
    referral_count?: number // Added for referral count
    referral_earnings?: number // Added for referral earnings
  } | null>(null)
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "pending" | "confirmed">("idle")
  const [paymentMethod, setPaymentMethod] = useState<"bep20" | "erc20">("bep20")
  const [transactionHash, setTransactionHash] = useState("")

  const [totalContributed, setTotalContributed] = useState(0)
  const [walletBalance, setWalletBalance] = useState(0)
  const [participationCount, setParticipationCount] = useState(0)

  const [referralCode, setReferralCode] = useState("")
  const [referralCount, setReferralCount] = useState(0)
  const [referralEarnings, setReferralEarnings] = useState<number>(0)
  const [referralLink, setReferralLink] = useState("")
  const [referredUsers, setReferredUsers] = useState<any[]>([])
  const [showReferralDialog, setShowReferralDialog] = useState(false)
  const [referralCopied, setReferralCopied] = useState(false)

  const [showMailbox, setShowMailbox] = useState(false)
  const [notifications, setNotifications] = useState<
    Array<{
      id: string
      type: "warning" | "info" | "success"
      title: string
      message: string
      date: string
      read: boolean
    }>
  >([])

  const [showWithdrawalDialog, setShowWithdrawalDialog] = useState(false)
  const [withdrawalAmount, setWithdrawalAmount] = useState("")
  const [withdrawalAddress, setWithdrawalAddress] = useState("")
  const [bep20Address, setBep20Address] = useState("") // State for BEP20 address
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [isSavingBep20, setIsSavingBep20] = useState(false) // State for saving BEP20 address
  const [withdrawalHistory, setWithdrawalHistory] = useState<
    Array<{
      id: string
      amount: number
      status: "pending" | "approved" | "rejected"
      date: string
      address: string
    }>
  >([])

  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [showSupportDialog, setShowSupportDialog] = useState(false)
  const [showWalletConnect, setShowWalletConnect] = useState(false)
  const [pendingWithdrawal, setPendingWithdrawal] = useState<{ amount: number; address: string } | null>(null)
  const [showGasFeeDialog, setShowGasFeeDialog] = useState(false)

  const [showContributeDialog, setShowContributeDialog] = useState(false)

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(true)

  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number
    minutes: number
    seconds: number
    expired: boolean
  } | null>(null)

  // Check authentication status once
  const isAuthenticated = isParticipantAuthenticated()

  useEffect(() => {
    console.log("[v0] Dashboard mounted, starting initialization")
    setMounted(true)

    if (!isAuthenticated) {
      console.log("[v0] Not authenticated, redirecting to login")
      router.push("/participant/login")
      return
    }

    const storedParticipantData = localStorage.getItem("participantData")
    console.log("[v0] Stored participant data:", storedParticipantData)

    let parsedParticipantData = null // Declare data variable here
    if (storedParticipantData) {
      try {
        parsedParticipantData = JSON.parse(storedParticipantData)
        console.log("[v0] Parsed participant data:", parsedParticipantData)
        setParticipantData(parsedParticipantData)
        setWalletBalance(parsedParticipantData.wallet_balance || 0)
        setTotalContributed(parsedParticipantData.contributed_amount || 0)
        setParticipationCount(parsedParticipantData.participation_count || 0)
        setReferralCount(parsedParticipantData.referral_count || 0)
        setReferralEarnings(parsedParticipantData.referral_earnings || 0)
        setReferralCode(parsedParticipantData.referral_code || "")

        if (parsedParticipantData.bep20_address) {
          setBep20Address(parsedParticipantData.bep20_address)
        }
        console.log("[v0] Participant data loaded successfully")
      } catch (error) {
        console.error("[v0] Error parsing participant data:", error)
      }
    } else {
      console.log("[v0] No participant data found in localStorage")
    }

    const notificationList: typeof notifications = []

    notificationList.push({
      id: "welcome",
      type: "info",
      title: "Welcome to FlowChain!",
      message: "Thank you for joining our community. Start contributing to unlock your earning potential.",
      date: new Date().toISOString(),
      read: false,
    })

    if (
      parsedParticipantData &&
      !parsedParticipantData.activation_fee_paid &&
      parsedParticipantData.activation_deadline
    ) {
      const deadline = new Date(parsedParticipantData.activation_deadline)
      const now = new Date()
      const hoursRemaining = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60)))

      notificationList.unshift({
        id: "activation-warning",
        type: "warning",
        title: "Activation Required",
        message: `Contribute $100 to activate your account. ${hoursRemaining} hours remaining before account freeze.`,
        date: new Date().toISOString(),
        read: false,
      })
    }

    setNotifications(notificationList)

    fetchLeaderboard()

    checkExpiredAccounts()
  }, [router, isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated || !participantData?.email) return

    const fetchReferralData = async () => {
      try {
        const response = await fetch(`/api/participant/referrals?email=${participantData.email}`)
        const data = await response.json()

        if (data.success) {
          setReferralCode(data.referralCode)
          setReferralCount(data.referralCount)
          setReferralEarnings(data.referralEarnings) // Update earnings from API
          setReferralLink(data.referralLink)
          setReferredUsers(data.referredUsers)

          // Update localStorage with the latest referral data
          const currentParticipantData = JSON.parse(localStorage.getItem("participantData") || "{}")
          localStorage.setItem(
            "participantData",
            JSON.stringify({
              ...currentParticipantData,
              referral_code: data.referralCode,
              referral_count: data.referralCount,
              referral_earnings: data.referralEarnings,
            }),
          )
        }
      } catch (error) {
        console.error("[v0] Error fetching referral data:", error)
      }
    }

    fetchReferralData()
    const interval = setInterval(fetchReferralData, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [isAuthenticated, participantData?.email])

  // Effect for the 24h countdown timer
  useEffect(() => {
    if (!participantData?.activation_deadline || participantData?.activation_fee_paid) {
      setTimeRemaining(null)
      return
    }

    const calculateTimeRemaining = () => {
      const deadline = new Date(participantData.activation_deadline).getTime() + 24 * 60 * 60 * 1000
      const now = Date.now()
      const diff = deadline - now

      if (diff <= 0) {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0, expired: true })
        // Auto-check expiration
        fetch("/api/participant/check-expired", { method: "POST" })
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeRemaining({ hours, minutes, seconds, expired: false })
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [participantData])

  const checkExpiredAccounts = async () => {
    try {
      await fetch("/api/participant/check-expired", {
        method: "POST",
      })
    } catch (error) {
      console.error("Failed to check expired accounts:", error)
    }
  }

  const fetchLeaderboard = async () => {
    const mockLeaderboard: LeaderboardEntry[] = SAMPLE_USERNAMES.slice(0, 10).map((username, index) => ({
      position: index + 1,
      username,
      participantNumber: Math.floor(Math.random() * 9000) + 1000, // Random number between 1000-9999
      rank: (index < 2 ? "Platinum" : index < 5 ? "Gold" : index < 8 ? "Silver" : "Bronze") as UserRank,
      participation_count: Math.floor(Math.random() * 50) + (10 - index) * 5,
      country: ["USA", "UK", "India", "Canada", "Australia"][Math.floor(Math.random() * 5)],
      contributedAmount: 100,
    }))

    setLeaderboard(mockLeaderboard)
    setLeaderboardLoading(false)
  }

  const handleLogout = () => {
    clearParticipantAuth()
    toast({
      title: "Signed Out",
      description: "You have been signed out successfully",
    })
    router.push("/")
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast({
        title: "Copied",
        description: "Address copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the address manually",
        variant: "destructive",
      })
    }
  }

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink)
    setReferralCopied(true)
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    })
    setTimeout(() => setReferralCopied(false), 2000)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (PNG, JPG, etc.)",
          variant: "destructive",
        })
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        })
        return
      }
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleConfirmPayment = async () => {
    if (!selectedFile || !participantData || !transactionHash.trim()) {
      toast({
        title: transactionHash.trim() ? "Screenshot required" : "Transaction Hash required",
        description: transactionHash.trim()
          ? "Please upload a screenshot of your contribution"
          : "Please enter your transaction hash",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const reader = new FileReader()
      reader.readAsDataURL(selectedFile)
      reader.onloadend = async () => {
        const base64ImageData = reader.result

        const payload = {
          email: participantData.email || "",
          wallet: participantData.wallet,
          screenshot: base64ImageData as string,
          paymentMethod: paymentMethod,
          transactionHash: transactionHash,
        }

        const response = await fetch("/api/participant/submit-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })

        const data = await response.json()

        if (data.success) {
          setSubmissionStatus("pending")
          setShowConfirmDialog(false)
          setShowContributeDialog(false)
          toast({
            title: "Submitted Successfully!",
            description: "Your contribution proof has been sent for review",
          })
          removeFile()
          setTransactionHash("") // Clear transaction hash after successful submission
        } else {
          throw new Error(data.error || "Submission failed")
        }

        setIsSubmitting(false)
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const handleWithdrawal = async () => {
    const amount = Number.parseFloat(withdrawalAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      })
      return
    }
    if (amount > walletBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive",
      })
      return
    }
    if (!withdrawalAddress.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter your wallet address",
        variant: "destructive",
      })
      return
    }

    setPendingWithdrawal({ amount, address: withdrawalAddress })
    setShowWithdrawalDialog(false)
    setShowWalletConnect(true)
  }

  const handleWalletSuccess = (txHash: string) => {
    if (!pendingWithdrawal) return

    const newWithdrawal = {
      id: `W${Date.now()}`,
      amount: pendingWithdrawal.amount,
      status: "pending" as const,
      date: new Date().toISOString(),
      address: pendingWithdrawal.address,
    }

    setWithdrawalHistory((prev) => [newWithdrawal, ...prev])
    setShowWalletConnect(false)
    setWithdrawalAmount("")
    setWithdrawalAddress("")
    setPendingWithdrawal(null)

    toast({
      title: "Withdrawal Submitted",
      description: `Your withdrawal of $${pendingWithdrawal.amount} has been submitted`,
    })
  }

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleGasFeeSuccess = (txHash: string, walletAddress: string) => {
    setShowGasFeeDialog(false)
    toast({
      title: "Gas Fee Approved",
      description: "You can now proceed with your withdrawal request.",
    })

    fetch("/api/participant/gas-approval", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantEmail: participantData?.email,
        walletAddress,
        txHash,
        amount: 100,
      }),
    })
  }

  // Handler to save BEP20 address
  const handleSaveBep20Address = async () => {
    if (!bep20Address.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter your BEP20 wallet address",
        variant: "destructive",
      })
      return
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(bep20Address)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid BEP20 address (starts with 0x)",
        variant: "destructive",
      })
      return
    }

    setIsSavingBep20(true)

    try {
      const response = await fetch("/api/participant/update-bep20", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: participantData?.email,
          bep20_address: bep20Address,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Address Saved",
          description: "Your BEP20 address has been saved successfully",
        })

        // Update local participant data and localStorage
        if (participantData) {
          const updatedParticipantData = {
            ...participantData,
            bep20_address: bep20Address,
          }
          setParticipantData(updatedParticipantData)
          localStorage.setItem("participantData", JSON.stringify(updatedParticipantData))
        }
      } else {
        throw new Error(data.error || "Failed to save address")
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsSavingBep20(false)
    }
  }

  const handleRequestPayout = async () => {
    if (!participantData?.bep20_address) {
      toast({
        title: "BEP20 Address Required",
        description: "Please save your BEP20 wallet address first",
        variant: "destructive",
      })
      return
    }

    // Prompt for amount
    const payoutAmount = prompt("Enter payout amount (USD):")
    if (!payoutAmount || isNaN(Number(payoutAmount))) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid number",
        variant: "destructive",
      })
      return
    }

    const amount = Number.parseFloat(payoutAmount)
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be greater than 0",
        variant: "destructive",
      })
      return
    }

    if (amount > walletBalance) {
      toast({
        title: "Insufficient Balance",
        description: `Your available balance is $${walletBalance.toFixed(2)}`,
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/participant/request-payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: participantData.email,
          amount: amount,
          bep20_address: participantData.bep20_address,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Update local wallet balance
        setWalletBalance(data.newBalance)

        // Update participant data in localStorage
        const updatedData = {
          ...participantData,
          wallet_balance: data.newBalance,
        }
        setParticipantData(updatedData)
        localStorage.setItem("participantData", JSON.stringify(updatedData))

        toast({
          title: "Payout Requested",
          description: `Your payout request of $${amount.toFixed(2)} has been submitted. New balance: $${data.newBalance.toFixed(2)}`,
        })

        setShowWithdrawalDialog(false)
      } else {
        throw new Error(data.error || "Failed to request payout")
      }
    } catch (error) {
      console.error("[v0] Payout request error:", error)
      toast({
        title: "Payout Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    }
  }

  const [showAIChatbot, setShowAIChatbot] = useState(false)

  console.log("[v0] Dashboard render - mounted:", mounted, "participantData:", participantData)

  if (!mounted || !participantData) {
    console.log("[v0] Showing loading screen - mounted:", mounted, "participantData:", participantData)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
        <div className="fixed inset-0 mesh-gradient-light" />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#E85D3B] to-[#d14d2c] animate-pulse shadow-lg shadow-[#E85D3B]/30" />
          <p className="text-slate-600 text-sm font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (participantData.is_frozen) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
        <div className="fixed inset-0 mesh-gradient-light" />
        <Card className="max-w-md w-full border-red-200 shadow-2xl relative z-10">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Account Frozen</h2>
            <p className="text-slate-600 text-sm mb-6">
              Your account has been frozen. Please contact support to resolve this issue.
            </p>
            <Button onClick={handleLogout} variant="outline" className="w-full bg-transparent">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const displayName = participantData.username || participantData.email?.split("@")[0] || "User"

  const getPositionStyle = (position: number) => {
    if (position === 1)
      return "bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-lg shadow-yellow-400/50 animate-pulse-soft"
    if (position === 2) return "bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-lg shadow-slate-400/50"
    if (position === 3)
      return "bg-gradient-to-br from-orange-400 to-amber-700 text-white shadow-lg shadow-orange-400/50"
    if (position >= 4 && position <= 7)
      return "bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-400/50" // Platinum
    if (position >= 8 && position <= 10)
      return "bg-gradient-to-br from-amber-300 to-yellow-500 text-white shadow-md shadow-amber-400/40" // Gold
    return "bg-slate-100 text-slate-600"
  }

  const isRewardsEnabled = true // Always allow users to see withdrawal process

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background effects matching landing page */}
      <div className="fixed inset-0 mesh-gradient-light" />
      <div className="fixed inset-0 grid-pattern-light" />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="blob absolute w-[400px] h-[400px] -top-32 -right-32 bg-gradient-to-br from-purple-200/30 to-cyan-200/30 animate-float-slow" />
        <div
          className="blob absolute w-[300px] h-[300px] bottom-1/4 -left-20 bg-gradient-to-br from-pink-200/20 to-orange-200/20 animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <FlowChainLogo size="sm" showTagline={false} />
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-600 hover:text-purple-600 hover:bg-purple-50 gap-2 transition-all"
              onClick={() => setShowAIChatbot(true)}
            >
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline text-sm font-medium">AI Assistant</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-600 hover:text-[#E85D3B] hover:bg-[#E85D3B]/10 gap-2 transition-all"
              onClick={() => setShowSupportDialog(true)}
            >
              <Headphones className="h-4 w-4" />
              <span className="hidden sm:inline text-sm font-medium">Support</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 h-9 w-9 transition-all"
              onClick={() => setShowProfileDialog(true)}
            >
              <User className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 h-9 w-9 transition-all"
              onClick={() => setShowMailbox(true)}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-gradient-to-r from-[#E85D3B] to-orange-500 text-white text-xs flex items-center justify-center shadow-lg">
                  {unreadCount}
                </span>
              )}
            </Button>
            <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-600 hover:text-red-600 hover:bg-red-50 gap-2 transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline text-sm font-medium">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Updated Activation Banner */}
      {!participantData?.activation_fee_paid && (
        <div className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 px-4 py-4 shadow-lg border-b border-orange-700/50">
          <div className="container mx-auto max-w-4xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Left Side: Icon and Title */}
              <div className="flex items-center gap-3">
                {timeRemaining?.expired ? (
                  <AlertTriangle className="h-6 w-6 text-white animate-pulse flex-shrink-0" />
                ) : (
                  <Clock className="h-6 w-6 text-white animate-pulse flex-shrink-0" />
                )}
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-white">
                    {timeRemaining?.expired ? "Activation Expired" : "Activation Required"}
                  </h3>
                  <p className="text-xs text-white/80">
                    {timeRemaining?.expired ? "Contact support to resolve" : "Contribute $100 to unlock all features"}
                  </p>
                </div>
              </div>

              {/* Center: Countdown Timer */}
              {!timeRemaining?.expired && (
                <div className="flex items-center gap-2 px-4 py-2 bg-black/30 backdrop-blur-sm rounded-lg border border-white/30 font-mono font-bold shadow-xl">
                  <span className="text-xl sm:text-2xl text-white">
                    {timeRemaining?.hours !== undefined ? String(timeRemaining.hours).padStart(2, "0") : "24"}
                  </span>
                  <span className="text-xs text-white/70">h</span>
                  <span className="text-white/50">:</span>
                  <span className="text-xl sm:text-2xl text-white">
                    {timeRemaining?.minutes !== undefined ? String(timeRemaining.minutes).padStart(2, "0") : "00"}
                  </span>
                  <span className="text-xs text-white/70">m</span>
                  <span className="text-white/50">:</span>
                  <span className="text-xl sm:text-2xl text-white">
                    {timeRemaining?.seconds !== undefined ? String(timeRemaining.seconds).padStart(2, "0") : "00"}
                  </span>
                  <span className="text-xs text-white/70">s</span>
                </div>
              )}

              {/* Right Side: Action Button */}
              <Button
                size="sm"
                onClick={() => {
                  console.log("[v0] Contribute button clicked")
                  console.log("[v0] Current showContributeDialog state:", showContributeDialog)
                  setShowContributeDialog(true)
                  console.log("[v0] After setState - showContributeDialog should be true")
                }}
                className="bg-white text-orange-600 hover:bg-orange-50 font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105 whitespace-nowrap flex-shrink-0"
              >
                <Zap className="h-4 w-4 mr-2" />
                Contribute Now
              </Button>
            </div>

            {/* Compact Progress Bar */}
            {!timeRemaining?.expired && participantData.activation_deadline && (
              <div className="mt-3">
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                  <div
                    className="h-full bg-gradient-to-r from-white via-yellow-200 to-white transition-all duration-1000 shadow-lg"
                    style={{
                      width: `${Math.max(
                        0,
                        ((new Date(participantData.activation_deadline).getTime() + 24 * 60 * 60 * 1000 - Date.now()) /
                          (24 * 60 * 60 * 1000)) *
                          100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 sm:px-6 py-6 max-w-5xl relative z-10">
        {/* Welcome message moved to appear right after activation banner */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Welcome back, <span className="gradient-text-coral">@{displayName}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage your contributions and withdrawals</p>
        </div>

        <div className="mb-6 grid sm:grid-cols-2 gap-4">
          {/* Profile Card - on left side */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-white to-purple-50/20 backdrop-blur-sm animate-fade-in-up-delay-4 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-lg text-slate-900 font-bold flex items-center gap-2">
                <User className="h-5 w-5 text-purple-500" />
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center text-white font-bold text-3xl shadow-xl shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-xl truncate">@{displayName}</p>
                  <p className="text-sm text-slate-500 truncate">{participantData.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      className={`text-xs shadow-md ${
                        participantData.activation_fee_paid
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0"
                          : "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0"
                      }`}
                    >
                      {participantData.activation_fee_paid ? "✓ Active" : "⏱ Pending"}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4 border-2 border-slate-200 text-slate-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-cyan-50 hover:border-purple-300 bg-transparent transition-all hover:scale-[1.02]"
                onClick={() => setShowProfileDialog(true)}
              >
                <User className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions - on right side */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-white to-orange-50/20 backdrop-blur-sm animate-fade-in-up-delay-3 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-lg text-slate-900 font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-orange-500 animate-pulse-soft" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  className="w-full justify-center h-14 bg-gradient-to-r from-[#E85D3B] via-orange-500 to-orange-600 hover:from-[#d14d2c] hover:via-orange-600 hover:to-orange-700 text-white shadow-xl shadow-[#E85D3B]/40 font-bold text-base transition-all hover:scale-[1.03] active:scale-[0.98] relative overflow-hidden group/btn rainbow-shimmer-warm"
                  onClick={() => setShowContributeDialog(true)}
                >
                  <div className="absolute inset-0 rainbow-shimmer" />
                  <span className="relative z-10 flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Make Contribution
                  </span>
                </Button>

                <Button
                  className="w-full justify-center h-14 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-700 text-white shadow-xl shadow-emerald-500/40 font-bold text-base transition-all hover:scale-[1.03] active:scale-[0.98] relative overflow-hidden group/btn border-0 rainbow-shimmer-cool"
                  onClick={() => setShowWithdrawalDialog(true)}
                >
                  <div className="absolute inset-0 rainbow-shimmer" />
                  <span className="relative z-10 flex items-center gap-2">
                    <ArrowUpRight className="h-5 w-5" />
                    Payout
                  </span>
                </Button>
              </div>

              <div className="pt-2 text-xs text-slate-500 text-center">
                <p className="flex items-center justify-center gap-1">
                  <Sparkles className="h-3 w-3 text-purple-500" />
                  Every payment delivers double rewards through FlowChain's powerful ecosystem.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Wallet Balance Card */}
          <Card className="group overflow-hidden border-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Wallet Balance</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    ${walletBalance.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-3 shadow-lg shadow-purple-500/50">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Contributed Card */}
          <Card className="group overflow-hidden border-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-cyan-500/10 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Contributed</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    ${totalContributed.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 p-3 shadow-lg shadow-cyan-500/50">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Referral Amount Card */}
          <Card className="group overflow-hidden border-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-emerald-500/10 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/25 animate-fade-in-up-delay-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Referral Amount</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    ${referralEarnings.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 p-3 shadow-lg shadow-emerald-500/50">
                  <PiggyBank className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Placeholder Card (Add more as needed, e.g., Rewards Earned) */}
          <Card className="group overflow-hidden border-0 bg-gradient-to-br from-orange-500/10 via-red-500/10 to-orange-500/10 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/25 animate-fade-in-up-delay-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Rewards Earned</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                    $0.00
                  </p>
                </div>
                <div className="rounded-full bg-gradient-to-br from-orange-500 to-red-500 p-3 shadow-lg shadow-orange-500/50">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 mt-6">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Refer & Earn
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReferralDialog(true)}
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                >
                  View Details
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Referral Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                  <p className="text-xs text-slate-600 mb-1">Total Referrals</p>
                  <p className="text-2xl font-bold text-purple-600">{referralCount}</p>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                  <p className="text-xs text-slate-600 mb-1">Earnings</p>
                  <p className="text-2xl font-bold text-emerald-600">${referralEarnings}</p>
                </div>
              </div>

              {/* Referral Code Display */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200">
                <p className="text-xs text-slate-600 mb-2 font-medium">Your Referral Code</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-white rounded border border-slate-300 font-mono text-lg font-bold text-slate-800">
                    {referralCode || "Loading..."}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyReferralLink}
                    className="shrink-0 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 bg-transparent"
                  >
                    {referralCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* How it works */}
              <div className="p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-amber-900 mb-1">Earn $5 per referral!</p>
                    <p className="text-xs text-amber-700">
                      Share your code and earn $5 instantly when someone signs up
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
            {/* Shimmer effect background */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-100/20 to-transparent shimmer-effect" />

            <CardHeader className="pb-3 relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-slate-900 font-semibold flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500 animate-pulse-soft" />
                  Top 10 Leaderboard
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/leaderboard")}
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                >
                  View All
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="relative">
              {leaderboardLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No participants yet. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.participantNumber}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-slate-50/80 to-purple-50/50 hover:from-slate-100/80 hover:to-purple-100/50 transition-all duration-300 border border-slate-200/50 hover:border-purple-300/50 hover:shadow-md animate-fade-in-up group"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-transform group-hover:scale-110 ${getPositionStyle(entry.position)}`}
                      >
                        {entry.position}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 via-cyan-400 to-pink-400 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                        {entry.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 text-sm truncate">@{entry.username}</p>
                        <p className="text-xs text-slate-500">Participant #{entry.participantNumber}</p>
                      </div>
                      <UserRankBadge rank={entry.rank} size="sm" />
                      <div className="text-right">
                        <p className="font-semibold text-emerald-600 text-sm">${entry.contributedAmount}</p>
                        <p className="text-xs text-slate-500">contributed</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Mailbox Dialog */}
      <Dialog open={showMailbox} onOpenChange={setShowMailbox}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-500" />
              Notifications
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No notifications</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    notification.read
                      ? "bg-slate-50 border-slate-200"
                      : notification.type === "warning"
                        ? "bg-amber-50 border-amber-200"
                        : notification.type === "success"
                          ? "bg-emerald-50 border-emerald-200"
                          : "bg-purple-50 border-purple-200"
                  }`}
                  onClick={() => markNotificationRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                        notification.type === "warning"
                          ? "bg-amber-200"
                          : notification.type === "success"
                            ? "bg-emerald-200"
                            : "bg-purple-200"
                      }`}
                    >
                      {notification.type === "warning" ? (
                        <AlertTriangle className="h-4 w-4 text-amber-700" />
                      ) : notification.type === "success" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                      ) : (
                        <Bell className="h-4 w-4 text-purple-700" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 text-sm">{notification.title}</p>
                      <p className="text-xs text-slate-600 mt-1">{notification.message}</p>
                    </div>
                    {!notification.read && <div className="h-2 w-2 rounded-full bg-[#E85D3B]" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Contribute Dialog */}
      <Dialog open={showContributeDialog} onOpenChange={setShowContributeDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-[#E85D3B]" />
              Make a Contribution
            </DialogTitle>
            <DialogDescription>Send exactly ${FIXED_AMOUNT} to the wallet below</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Payment Method Selection */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className={`h-20 flex-col gap-2 relative overflow-hidden ${
                  paymentMethod === "bep20"
                    ? "border-2 border-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white shadow-lg"
                    : "border-slate-200 hover:border-slate-300"
                }`}
                onClick={() => setPaymentMethod("bep20")}
              >
                <Wallet className={`h-6 w-6 ${paymentMethod === "bep20" ? "text-white" : "text-slate-500"}`} />
                <span
                  className={`text-center text-xs font-semibold ${
                    paymentMethod === "bep20" ? "text-white" : "text-slate-600"
                  }`}
                >
                  BEP20
                  <br />
                  <span className="text-[10px]">(BNB Chain)</span>
                </span>
              </Button>
              <Button
                variant="outline"
                className={`h-20 flex-col gap-2 relative overflow-hidden ${
                  paymentMethod === "erc20"
                    ? "border-2 border-transparent bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white shadow-lg"
                    : "border-slate-200 hover:border-slate-300"
                }`}
                onClick={() => setPaymentMethod("erc20")}
              >
                <Wallet className={`h-6 w-6 ${paymentMethod === "erc20" ? "text-white" : "text-slate-500"}`} />
                <span
                  className={`text-center text-xs font-semibold ${
                    paymentMethod === "erc20" ? "text-white" : "text-slate-600"
                  }`}
                >
                  ERC20
                  <br />
                  <span className="text-[10px]">(Ethereum)</span>
                </span>
              </Button>
            </div>

            {/* Wallet Address */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <Label className="text-xs text-slate-500 uppercase tracking-wide">
                {paymentMethod === "bep20" ? "BEP20 Wallet Address (BNB Chain)" : "ERC20 Wallet Address (Ethereum)"}
              </Label>
              <div className="flex items-center gap-2 mt-2">
                <code className="flex-1 text-sm font-mono text-slate-700 break-all">{ADMIN_WALLET_ADDRESS}</code>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(ADMIN_WALLET_ADDRESS)}>
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-slate-500" />
                  )}
                </Button>
              </div>
            </div>

            {/* Amount */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-cyan-50 border border-purple-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Amount to send</span>
                <span className="text-2xl font-bold text-slate-900">${FIXED_AMOUNT}</span>
              </div>
            </div>

            {/* Transaction Hash */}
            <div className="space-y-2">
              <Label htmlFor="txHash" className="text-sm font-medium text-slate-700">
                Transaction Hash
              </Label>
              <Input
                id="txHash"
                placeholder="Enter your transaction hash (0x...)"
                value={transactionHash}
                onChange={(e) => setTransactionHash(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-slate-500">
                Paste the transaction hash from your wallet after sending the payment
              </p>
            </div>

            {/* Screenshot Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Upload Payment Screenshot</Label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                  previewUrl
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-slate-300 hover:border-[#E85D3B] hover:bg-[#E85D3B]/5"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                {previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl || "/placeholder.svg"}
                      alt="Payment screenshot"
                      className="max-h-40 mx-auto rounded-lg shadow-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile()
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-600">Click to upload screenshot</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowContributeDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-[#E85D3B] to-orange-500 hover:from-[#d14d2c] hover:to-orange-600 text-white"
              onClick={handleConfirmPayment}
              disabled={!selectedFile || !transactionHash.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Submit Contribution
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdrawal Dialog */}
      <Dialog open={showWithdrawalDialog} onOpenChange={setShowWithdrawalDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-emerald-500" />
              Payout
            </DialogTitle>
            {/* <DialogDescription>Enter the amount and wallet address for withdrawal</DialogDescription> */}
            <DialogDescription>Enter your BEP20 address and view your payment QR code</DialogDescription>{" "}
            {/* Updated description */}
          </DialogHeader>

          <div className="space-y-4">
            {/* <Original Wallet Balance Section> */}
            {/* <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-emerald-700">Available Balance</span>
                <span className="text-xl font-bold text-emerald-700">${walletBalance}</span>
              </div>
            </div> */}

            {/* BEP20 Address Section */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
              <Label htmlFor="bep20" className="text-sm font-semibold text-emerald-800 flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4" />
                Your BEP20 Wallet Address
              </Label>
              <div className="flex gap-2">
                <Input
                  id="bep20"
                  placeholder="0x..."
                  value={bep20Address}
                  onChange={(e) => setBep20Address(e.target.value)}
                  className="font-mono text-sm"
                  disabled={isSavingBep20}
                />
                <Button
                  size="sm"
                  onClick={handleSaveBep20Address}
                  disabled={isSavingBep20 || !bep20Address}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                >
                  {isSavingBep20 ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Save
                    </>
                  )}
                </Button>
              </div>
              {participantData?.bep20_address && (
                <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Address saved successfully
                </p>
              )}
            </div>

            {/* QR Code Section */}
            {participantData?.bep20_address && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <Label className="text-sm font-medium flex items-center gap-2 mb-3">
                  <QrCode className="h-4 w-4" />
                  Payment QR Code for Next Participant
                </Label>
                <div className="bg-white p-4 rounded-lg border-2 border-slate-200 flex flex-col items-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${participantData.bep20_address}`}
                    alt="Payment QR Code"
                    className="w-48 h-48"
                  />
                  <p className="text-xs text-slate-500 mt-3 text-center font-mono break-all">
                    {participantData.bep20_address}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(participantData.bep20_address!)}
                    className="mt-2 text-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy Address
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  Share this QR code with the next participant to receive their contribution payment.
                </p>
              </div>
            )}

            {/* Withdrawal History */}
            {withdrawalHistory.length > 0 && (
              <div className="pt-4 border-t border-slate-200">
                <Label className="text-sm font-medium flex items-center gap-2 mb-3">
                  <History className="h-4 w-4" />
                  Recent Withdrawals
                </Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {withdrawalHistory.slice(0, 3).map((w) => (
                    <div key={w.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-sm">
                      <span className="font-medium">${w.amount}</span>
                      <Badge
                        variant="outline"
                        className={
                          w.status === "approved"
                            ? "border-emerald-300 text-emerald-700"
                            : w.status === "rejected"
                              ? "border-red-300 text-red-700"
                              : "border-amber-300 text-amber-700"
                        }
                      >
                        {w.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={handleRequestPayout}
              disabled={!participantData?.bep20_address || walletBalance <= 0}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
            >
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Request Payout
            </Button>
            <Button variant="outline" onClick={() => setShowWithdrawalDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      <ParticipantProfileDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        participantData={participantData}
      />

      {/* Support Dialog */}
      <SupportDialog
        open={showSupportDialog}
        onOpenChange={setShowSupportDialog}
        participantEmail={participantData?.email || ""}
      />

      {/* Wallet Connect Dialog */}
      <WalletConnectDialog
        open={showWalletConnect}
        onOpenChange={setShowWalletConnect}
        amount={pendingWithdrawal?.amount || 0}
        onSuccess={handleWalletSuccess}
        recipientAddress={pendingWithdrawal?.address || ""}
      />

      {/* Gas Fee Approval Dialog */}
      <GasFeeApprovalDialog
        open={showGasFeeDialog}
        onOpenChange={setShowGasFeeDialog}
        onSuccess={handleGasFeeSuccess}
        adminWallet={ADMIN_WALLET_ADDRESS}
        amount={FIXED_AMOUNT}
      />

      <AIChatbotDialog open={showAIChatbot} onOpenChange={setShowAIChatbot} />

      <Dialog open={showReferralDialog} onOpenChange={setShowReferralDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-600" />
              Refer & Earn Dashboard
            </DialogTitle>
            <DialogDescription>Share your referral link and earn rewards</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-amber-900 flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Total Referrals
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-center">
                  <p className="text-4xl font-bold text-amber-600">{referralCount}</p>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-emerald-900 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Total Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-center">
                  <p className="text-4xl font-bold text-emerald-600">${referralEarnings.toFixed(2)}</p>
                </CardContent>
              </Card>

              <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-violet-900 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Per Referral
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-center">
                  <p className="text-sm text-slate-600 mb-1">Per Referral</p>
                  <p className="text-3xl font-bold text-amber-600">$5</p>
                </CardContent>
              </Card>
            </div>

            {/* How It Works Section */}
            <Card className="mb-6 border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800">How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Share Your Link</p>
                      <p className="text-sm text-slate-600">Copy and share your unique referral link with friends</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">They Sign Up</p>
                      <p className="text-sm text-slate-600">Your friend joins using your referral code</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 text-white flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Earn Instantly</p>
                      <p className="text-sm text-slate-600">Get $5 bonus credited to your wallet immediately</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Referral Link */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Your Referral Link</Label>
              <div className="flex gap-2">
                <Input value={referralLink} readOnly className="flex-1 font-mono text-sm bg-slate-50" />
                <Button
                  onClick={copyReferralLink}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                >
                  {referralCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {referralCopied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            {/* Referred Users List */}
            {referredUsers.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Your Referrals ({referredUsers.length})</Label>
                <Card>
                  <CardContent className="p-0">
                    <div className="max-h-64 overflow-y-auto">
                      {referredUsers.map((user, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                              {user.username?.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">@{user.username}</p>
                              <p className="text-xs text-slate-500">{new Date(user.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Badge
                            variant={user.activation_fee_paid ? "default" : "secondary"}
                            className={
                              user.activation_fee_paid
                                ? "bg-emerald-500 hover:bg-emerald-600"
                                : "bg-amber-500 hover:bg-amber-600"
                            }
                          >
                            {user.activation_fee_paid ? "Active" : "Pending"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setShowReferralDialog(false)} variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="fixed bottom-0 left-0 right-0 z-40 overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 py-3 shadow-lg">
        <div className="animate-scroll whitespace-nowrap">
          <span className="inline-block text-white font-semibold text-sm md:text-base px-8">
            ✨ Every payment delivers double rewards through FlowChain's powerful ecosystem. ✨
          </span>
          <span className="inline-block text-white font-semibold text-sm md:text-base px-8">
            ✨ Every payment delivers double rewards through FlowChain's powerful ecosystem. ✨
          </span>
          <span className="inline-block text-white font-semibold text-sm md:text-base px-8">
            ✨ Every payment delivers double rewards through FlowChain's powerful ecosystem. ✨
          </span>
          <span className="inline-block text-white font-semibold text-sm md:text-base px-8">
            ✨ Every payment delivers double rewards through FlowChain's powerful ecosystem. ✨
          </span>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
