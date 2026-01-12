"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle2, XCircle, AlertTriangle, LogIn, Settings, Activity } from "lucide-react"
import type { AuditLog } from "@/lib/types"

interface ActivityFeedProps {
  activities: AuditLog[]
  maxHeight?: string
}

export function ActivityFeed({ activities, maxHeight = "400px" }: ActivityFeedProps) {
  const getActivityIcon = (action: AuditLog["action"]) => {
    switch (action) {
      case "login":
        return LogIn
      case "approve_payment":
        return CheckCircle2
      case "reject_payment":
        return XCircle
      case "flag_user":
        return AlertTriangle
      case "update_status":
        return Settings
      case "admin_action":
        return Settings
      default:
        return Activity
    }
  }

  const getActivityColor = (action: AuditLog["action"]) => {
    switch (action) {
      case "approve_payment":
        return "text-success"
      case "reject_payment":
        return "text-destructive"
      case "flag_user":
        return "text-warning"
      default:
        return "text-muted-foreground"
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) return "Just now"
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Real-time Activity
        </CardTitle>
        <CardDescription>Platform events and admin actions</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea style={{ height: maxHeight }}>
          <div className="divide-y divide-border">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.action)
              return (
                <div key={activity.id} className="activity-item animate-fade-in">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${getActivityColor(activity.action)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{activity.actor_email}</span>{" "}
                        <span className="text-muted-foreground">{activity.details}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatTime(activity.created_at)}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
