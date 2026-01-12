"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { ParticipantsTable } from "@/components/participants-table"
import { ParticipantModal } from "@/components/participant-modal"
import { PaymentSubmissionsTable } from "@/components/payment-submissions-table"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { RiskEnginePanel } from "@/components/risk-engine-panel"
import { ActivityFeed } from "@/components/activity-feed"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { isAdminAuthenticated, getAdminToken, getAdminData } from "@/lib/auth"
import { Users, Activity, ImageIcon, Clock, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { SkeletonStatsGrid, SkeletonActivityFeed, SkeletonTable } from "@/components/ui/skeleton-loader"
import { EmptyState } from "@/components/ui/empty-state"
import { SupportTicketsPanel } from "@/components/support-tickets-panel"
import { ApprovedWalletsPanel } from "@/components/admin/approved-wallets-panel"
import { ParticipantDatabaseView } from "@/components/admin/participant-database-view"
import type { PaymentSubmission } from "@/app/api/participant/submit-payment/route"
import type { AuditLog, ConversionFunnel, RiskFlag } from "@/lib/types"

type ParticipantWithActivity = {
  id: string
  participantNumber?: number
  wallet_address: string
  email: string
  name: string
  phone: string
  address?: string
  city?: string
  state?: string
  country?: string
  password: string
  role: "participant" | "admin" | "super_admin"
  created_at: string
  last_active: string
  status: "active" | "inactive" | "suspended"
  totalGiven: number
  totalReceived: number
  pendingRequests: number
  completedTransactions: number
  participation_count: number
  risk_score: number
  wallet_balance?: number
  contributed_amount?: number
  risk_flags?: RiskFlag[]
  recentTransactions?: Array<{
    id: string
    type: "given" | "received"
    amount: number
    chain: "BSC" | "ETH"
    tx_hash?: string
    created_at: string
  }>
}

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  const [participants, setParticipants] = useState<ParticipantWithActivity[]>([])
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantWithActivity | null>(null)
  const [participantModalOpen, setParticipantModalOpen] = useState(false)
  const [paymentSubmissions, setPaymentSubmissions] = useState<PaymentSubmission[]>([])
  const [activityLogs, setActivityLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState({
    totalParticipants: 0,
    activeParticipants: 0,
    totalContributed: 0,
    totalRewards: 0,
    newThisWeek: 0,
    activatedUsers: 0,
    pendingContributions: 0,
    flaggedUsers: 0,
  })

  const fetchParticipants = async () => {
    try {
      const token = getAdminToken()
      const response = await fetch("/api/admin/participants", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch participants")
      }

      const data = await response.json()
      const participantsWithRank = (data.participants || []).map((p: ParticipantWithActivity) => ({
        ...p,
        participation_count: p.completedTransactions || 0,
        risk_score: p.status === "suspended" ? 85 : p.pendingRequests > 3 ? 60 : 15,
        risk_flags:
          p.status === "suspended"
            ? [
                {
                  id: `flag-${p.id}`,
                  type: "account_suspended" as const,
                  severity: "high" as const,
                  description: "Account has been suspended",
                  created_at: p.created_at,
                  resolved: false,
                },
              ]
            : [],
      }))
      setParticipants(participantsWithRank)

      setStats((prev) => ({
        ...prev,
        totalParticipants: participantsWithRank.length,
        activeParticipants: participantsWithRank.filter((p: ParticipantWithActivity) => p.status === "active").length,
        newThisWeek: participantsWithRank.filter((p: ParticipantWithActivity) => {
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return new Date(p.created_at) > weekAgo
        }).length,
      }))
    } catch (error) {
      console.error("Error fetching participants:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPaymentSubmissions = async () => {
    try {
      const token = getAdminToken()
      const response = await fetch("/api/participant/submit-payment", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch submissions")
      }

      const data = await response.json()
      setPaymentSubmissions(data.submissions || [])
    } catch (error) {
      console.error("Error fetching submissions:", error)
    }
  }

  const fetchStats = async () => {
    try {
      const token = getAdminToken()
      const response = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch stats")
      }

      const data = await response.json()
      if (data.stats) {
        setStats((prev) => ({
          ...prev,
          ...data.stats,
          pendingContributions: paymentSubmissions.filter((s) => s.status === "pending").length,
        }))
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const fetchActivityLogs = async () => {
    try {
      const token = getAdminToken()
      const response = await fetch("/api/admin/activity", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch activity")
      }

      const data = await response.json()
      setActivityLogs(data.activities || [])
    } catch (error) {
      console.error("Error fetching activity:", error)
    }
  }

  const handleStatusUpdate = async (submissionId: string, status: "confirmed" | "rejected", reason?: string) => {
    const token = getAdminToken()
    const response = await fetch("/api/participant/submit-payment", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        submissionId,
        status,
        reviewedBy: "admin@system.com",
        rejectionReason: reason,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to update status")
    }

    await fetchPaymentSubmissions()
  }

  useEffect(() => {
    setMounted(true)

    const adminData = getAdminData()
    if (!isAdminAuthenticated()) {
      router.push("/admin/login")
    } else if (adminData?.role === "super_admin") {
      // Super admin should use the dedicated super admin dashboard
      router.push("/super-admin/dashboard")
    } else {
      fetchParticipants()
      fetchPaymentSubmissions()
      fetchStats()
      fetchActivityLogs()
    }
  }, [router])

  useEffect(() => {
    if (paymentSubmissions.length > 0) {
      setStats((prev) => ({
        ...prev,
        pendingContributions: paymentSubmissions.filter((s) => s.status === "pending").length,
      }))
    }
  }, [paymentSubmissions])

  useEffect(() => {
    if (!isAdminAuthenticated()) return

    const interval = setInterval(() => {
      fetchParticipants()
      fetchPaymentSubmissions()
      fetchStats()
      fetchActivityLogs()
    }, 3000) // 3 seconds instead of 60 seconds

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([fetchParticipants(), fetchPaymentSubmissions(), fetchStats(), fetchActivityLogs()])
    setIsRefreshing(false)
    toast({
      title: "Data refreshed",
      description: "All data has been updated",
    })
  }

  const handleViewParticipantDetails = (participant: ParticipantWithActivity) => {
    setSelectedParticipant(participant)
    setParticipantModalOpen(true)
  }

  const handleResolveFlag = (flagId: string, participantId: string) => {
    toast({
      title: "Flag Resolved",
      description: "Risk flag has been marked as resolved",
    })
  }

  const conversionFunnel: ConversionFunnel = {
    registered: stats.totalParticipants || 0,
    payment_submitted: paymentSubmissions.length || 0,
    payment_approved: paymentSubmissions.filter((s) => s.status === "confirmed").length || 0,
    active_participants: stats.activeParticipants || 0,
  }

  const flaggedParticipants = participants
    .filter((p) => p.risk_score >= 40)
    .map((p) => ({
      id: p.id,
      participantId: p.id,
      participantEmail: p.email,
      participantName: p.name,
      flags: p.risk_flags || [
        {
          id: `flag-${p.id}`,
          type: "fast_join" as const,
          severity: p.risk_score >= 70 ? ("high" as const) : ("medium" as const),
          description: "Registered within suspicious timeframe",
          created_at: p.created_at,
          resolved: false,
        },
      ],
      riskScore: p.risk_score,
    }))

  const dailyMetrics = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const dateStr = date.toISOString().split("T")[0]

    const dayActivities = activityLogs.filter((log) => {
      const logDate = new Date(log.timestamp).toISOString().split("T")[0]
      return logDate === dateStr
    })

    return {
      date: dateStr,
      joins: dayActivities.filter((a) => a.action === "new_registration").length,
      payments: dayActivities.filter((a) => a.action === "payment_submitted").length,
      active: dayActivities.length,
    }
  })

  if (!mounted) return null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} pendingPayments={0} flaggedUsers={0} />
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <DashboardHeader onRefresh={handleRefresh} isRefreshing={isRefreshing} />
          <main className="flex-1 overflow-auto p-6 bg-slate-50">
            <div className="space-y-6 max-w-7xl mx-auto">
              <SkeletonStatsGrid />
              <div className="grid gap-6 lg:grid-cols-2">
                <SkeletonActivityFeed />
                <SkeletonTable rows={3} />
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingPayments={stats.pendingContributions}
        flaggedUsers={stats.flaggedUsers}
      />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <DashboardHeader onRefresh={handleRefresh} isRefreshing={isRefreshing} />

        <main className="flex-1 overflow-auto p-6 bg-slate-50">
          {activeTab === "overview" && (
            <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
                  <p className="text-slate-500 text-sm">Platform overview and activity</p>
                </div>
                <Badge variant="outline" className="text-xs text-slate-500 border-slate-200 bg-white">
                  Updated: {new Date().toLocaleTimeString()}
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="card-elevated">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Total Participants</p>
                        <p className="text-2xl font-semibold text-slate-900 mt-1">
                          <AnimatedCounter value={stats.totalParticipants} />
                        </p>
                        <p className="text-xs text-emerald-600 mt-1">+{stats.newThisWeek} this week</p>
                      </div>
                      <div className="h-10 w-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-cyan-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-elevated">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Active Users</p>
                        <p className="text-2xl font-semibold text-slate-900 mt-1">
                          <AnimatedCounter value={stats.activeParticipants} />
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {stats.totalParticipants > 0
                            ? ((stats.activeParticipants / stats.totalParticipants) * 100).toFixed(0)
                            : 0}
                          % of total
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-violet-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-elevated">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Pending Review</p>
                        <p className="text-2xl font-semibold text-amber-600 mt-1">
                          <AnimatedCounter value={stats.pendingContributions} />
                        </p>
                        <p className="text-xs text-amber-600 mt-1">Awaiting review</p>
                      </div>
                      <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-amber-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-elevated">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Total Volume</p>
                        <p className="text-2xl font-semibold text-slate-900 mt-1">
                          <AnimatedCounter value={stats.totalContributed + stats.totalRewards} prefix="$" />
                        </p>
                        <p className="text-xs text-emerald-600 mt-1">All contributions</p>
                      </div>
                      <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-emerald-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <ActivityFeed activities={activityLogs} maxHeight="320px" />

                {stats.pendingContributions > 0 ? (
                  <Card className="card-elevated">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base font-medium text-slate-900">Pending Reviews</CardTitle>
                          <CardDescription className="text-sm text-slate-500">
                            Contributions awaiting review
                          </CardDescription>
                        </div>
                        <Badge
                          variant="secondary"
                          className="cursor-pointer bg-violet-100 text-violet-600 hover:bg-violet-200 border-0"
                          onClick={() => setActiveTab("payments")}
                        >
                          View All
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {paymentSubmissions
                          .filter((s) => s.status === "pending")
                          .slice(0, 3)
                          .map((submission) => (
                            <div
                              key={submission.id}
                              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors"
                              onClick={() => setActiveTab("payments")}
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center">
                                  <ImageIcon className="h-4 w-4 text-amber-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm text-slate-900">
                                    {submission.participantName || submission.participantEmail}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {new Date(submission.submittedAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <span className="font-semibold text-emerald-600">${submission.amount}</span>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="card-elevated">
                    <CardContent className="p-0">
                      <EmptyState
                        type="payments"
                        title="No pending contributions"
                        description="All submissions have been reviewed."
                      />
                    </CardContent>
                  </Card>
                )}
              </div>

              <Card className="card-elevated">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-base font-medium text-slate-900">Recent Participants</CardTitle>
                    <CardDescription className="text-sm text-slate-500">Latest registered users</CardDescription>
                  </div>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer bg-violet-100 text-violet-600 hover:bg-violet-200 border-0"
                    onClick={() => setActiveTab("participants")}
                  >
                    View All
                  </Badge>
                </CardHeader>
                <CardContent>
                  {participants.length === 0 ? (
                    <EmptyState
                      type="users"
                      title="No participants yet"
                      description="Participants will appear here once they register."
                    />
                  ) : (
                    <div className="space-y-3">
                      {participants.slice(0, 5).map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors"
                          onClick={() => handleViewParticipantDetails(p)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-violet-100 flex items-center justify-center">
                              <Users className="h-4 w-4 text-violet-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-slate-900">{p.name || p.email}</p>
                              <p className="text-xs text-slate-500">{p.email}</p>
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className={
                              p.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                            }
                          >
                            {p.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "participants" && (
            <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Participants</h1>
                <p className="text-slate-500 text-sm">Manage all registered participants</p>
              </div>
              <ParticipantsTable
                participants={participants as any}
                onViewDetails={handleViewParticipantDetails as any}
              />
            </div>
          )}

          {activeTab === "payments" && (
            <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Contributions</h1>
                <p className="text-slate-500 text-sm">Review and manage payment submissions</p>
              </div>
              <PaymentSubmissionsTable submissions={paymentSubmissions} onStatusUpdate={handleStatusUpdate} />
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
                <p className="text-slate-500 text-sm">Platform metrics and performance</p>
              </div>
              <AnalyticsDashboard
                dailyMetrics={dailyMetrics}
                funnel={conversionFunnel}
                totalParticipants={stats.totalParticipants}
                pendingPayments={stats.pendingContributions}
                flaggedUsers={stats.flaggedUsers}
              />
            </div>
          )}

          {activeTab === "database" && (
            <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
              <ParticipantDatabaseView
                participants={participants as any}
                onViewDetails={handleViewParticipantDetails as any}
              />
            </div>
          )}

          {activeTab === "risk-engine" && (
            <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Risk Engine</h1>
                <p className="text-slate-500 text-sm">Monitor and manage flagged participants</p>
              </div>
              <RiskEnginePanel flaggedParticipants={flaggedParticipants} onResolveFlag={handleResolveFlag} />
            </div>
          )}

          {activeTab === "support" && (
            <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
              <SupportTicketsPanel />
            </div>
          )}

          {activeTab === "approved-wallets" && (
            <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
              <ApprovedWalletsPanel />
            </div>
          )}

          {activeTab === "activity-log" && (
            <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Activity Log</h1>
                <p className="text-slate-500 text-sm">Complete system activity history</p>
              </div>
              <ActivityFeed activities={activityLogs} maxHeight="600px" />
            </div>
          )}
        </main>
      </div>

      {selectedParticipant && (
        <ParticipantModal
          participant={selectedParticipant as any}
          open={participantModalOpen}
          onOpenChange={setParticipantModalOpen}
        />
      )}
    </div>
  )
}
