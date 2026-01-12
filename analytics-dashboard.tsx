"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp, CheckCircle2, ArrowUpRight, ArrowDownRight, AlertTriangle } from "lucide-react"
import type { DailyMetric, ConversionFunnel } from "@/lib/types"

interface AnalyticsDashboardProps {
  dailyMetrics: DailyMetric[]
  funnel: ConversionFunnel
  totalParticipants: number
  pendingPayments: number
  flaggedUsers: number
}

export function AnalyticsDashboard({
  dailyMetrics = [],
  funnel = { registered: 0, payment_submitted: 0, payment_approved: 0, active_participants: 0 },
  totalParticipants = 0,
  pendingPayments = 0,
  flaggedUsers = 0,
}: AnalyticsDashboardProps) {
  const safeMetrics = dailyMetrics && dailyMetrics.length > 0 ? dailyMetrics : []
  const todayMetrics =
    safeMetrics.length > 0
      ? safeMetrics[safeMetrics.length - 1]
      : { joins: 0, payments: 0, active: 0, date: new Date().toISOString() }
  const yesterdayMetrics = safeMetrics.length > 1 ? safeMetrics[safeMetrics.length - 2] : null

  const joinGrowth =
    yesterdayMetrics && yesterdayMetrics.joins > 0
      ? ((todayMetrics.joins - yesterdayMetrics.joins) / yesterdayMetrics.joins) * 100
      : 0

  const safeFunnel = funnel || { registered: 0, payment_submitted: 0, payment_approved: 0, active_participants: 0 }

  const approvalRate =
    safeFunnel.payment_submitted > 0
      ? ((safeFunnel.payment_approved / safeFunnel.payment_submitted) * 100).toFixed(1)
      : "0"

  const conversionRate =
    safeFunnel.registered > 0 ? ((safeFunnel.active_participants / safeFunnel.registered) * 100).toFixed(1) : "0"

  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-elevated">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Daily Joins</p>
                <p className="metric-value text-foreground">{todayMetrics?.joins || 0}</p>
                <div
                  className={`flex items-center text-xs mt-1 ${joinGrowth >= 0 ? "text-success" : "text-destructive"}`}
                >
                  {joinGrowth >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(joinGrowth).toFixed(1)}% vs yesterday
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approval Rate</p>
                <p className="metric-value text-success">{approvalRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {safeFunnel.payment_approved}/{safeFunnel.payment_submitted} approved
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="metric-value text-primary">{conversionRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">Registration to Active</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated border-warning/30">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Flagged Users</p>
                <p className="metric-value text-warning">{flaggedUsers}</p>
                <p className="text-xs text-muted-foreground mt-1">Requires review</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-lg">Conversion Funnel</CardTitle>
          <CardDescription>User journey from registration to active participation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: "Registered", value: safeFunnel.registered, color: "bg-muted-foreground" },
              { label: "Payment Submitted", value: safeFunnel.payment_submitted, color: "bg-warning" },
              { label: "Payment Approved", value: safeFunnel.payment_approved, color: "bg-primary" },
              { label: "Active Participants", value: safeFunnel.active_participants, color: "bg-success" },
            ].map((step, i) => {
              const percentage = safeFunnel.registered > 0 ? (step.value / safeFunnel.registered) * 100 : 0
              return (
                <div key={step.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{step.label}</span>
                    <span className="font-medium">
                      {step.value} <span className="text-muted-foreground">({percentage.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${step.color} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Daily Metrics Chart */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-lg">7-Day Activity</CardTitle>
          <CardDescription>Daily platform metrics overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {(safeMetrics.length > 0
              ? safeMetrics.slice(-7)
              : Array.from({ length: 7 }, (_, i) => ({
                  date: new Date(Date.now() - (6 - i) * 86400000).toISOString(),
                  joins: 0,
                  payments: 0,
                  active: 0,
                }))
            ).map((metric, i) => (
              <div key={metric.date || i} className="text-center">
                <div className="space-y-1 mb-2">
                  <div
                    className="mx-auto w-8 bg-primary/20 rounded-sm"
                    style={{ height: `${Math.max(20, (metric.joins || 0) * 8)}px` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(metric.date).toLocaleDateString("en", { weekday: "short" })}
                </p>
                <p className="text-sm font-medium">{metric.joins || 0}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
