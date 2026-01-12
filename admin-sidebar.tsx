"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FlowChainLogoCompact } from "@/components/flowchain-logo"
import {
  LayoutDashboard,
  Users,
  Settings,
  Shield,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  ImageIcon,
  AlertTriangle,
  Activity,
  MessageSquare,
  Wallet,
  Database,
  Crown,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { clearAdminAuth, getAdminData } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

type AdminSidebarProps = {
  activeTab: string
  onTabChange: (tab: string) => void
  pendingPayments?: number
  flaggedUsers?: number
}

const mainMenuItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, badge: null },
  { id: "participants", label: "Participants", icon: Users, badge: null },
  { id: "payments", label: "Contributions", icon: ImageIcon, badge: null, highlight: true },
  { id: "analytics", label: "Analytics", icon: BarChart3, badge: null },
]

const managementItems = [
  { id: "database", label: "Database", icon: Database, badge: null, superAdminOnly: true },
  { id: "risk-engine", label: "Risk Engine", icon: AlertTriangle, badge: null, isRisk: true },
  { id: "support", label: "Support Tickets", icon: MessageSquare, badge: null },
  { id: "approved-wallets", label: "Approved Wallets", icon: Wallet, badge: null, superAdminOnly: true },
  { id: "activity-log", label: "Activity Log", icon: Activity, badge: null, superAdminOnly: true },
  { id: "admins", label: "Admin Users", icon: Shield, badge: null, superAdminOnly: true },
]

const systemItems = [
  { id: "notifications", label: "Notifications", icon: Bell, badge: "3" },
  { id: "settings", label: "Settings", icon: Settings, badge: null },
]

export function AdminSidebar({ activeTab, onTabChange, pendingPayments = 0, flaggedUsers = 0 }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [adminData, setAdminData] = useState<{ email: string; role: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const data = getAdminData()
    setAdminData(data)
  }, [])

  const handleLogout = () => {
    clearAdminAuth()
    router.push("/admin/login")
  }

  const renderMenuItem = (item: {
    id: string
    label: string
    icon: any
    badge: string | null
    highlight?: boolean
    isRisk?: boolean
    superAdminOnly?: boolean
  }) => {
    const isSuperAdminItem = item.superAdminOnly
    const userIsSuperAdmin = adminData?.role === "super_admin"

    return (
      <Button
        key={item.id}
        variant={activeTab === item.id ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start gap-3 h-10 relative text-slate-600 hover:text-slate-900 hover:bg-slate-100",
          collapsed && "justify-center px-2",
          activeTab === item.id && "bg-violet-100 text-[#7c3aed] hover:bg-violet-100 hover:text-[#7c3aed]",
          item.id === "payments" &&
            pendingPayments > 0 &&
            activeTab !== "payments" &&
            "bg-amber-50 text-amber-600 hover:bg-amber-100",
          item.isRisk && flaggedUsers > 0 && activeTab !== "risk-engine" && "bg-red-50 text-red-600 hover:bg-red-100",
          isSuperAdminItem && userIsSuperAdmin && "border-l-2 border-purple-400",
        )}
        onClick={() => onTabChange(item.id)}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            {item.id === "payments" && pendingPayments > 0 ? (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs bg-amber-100 text-amber-600 border-0">
                {pendingPayments}
              </Badge>
            ) : item.id === "risk-engine" && flaggedUsers > 0 ? (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs bg-red-100 text-red-600 border-0">
                {flaggedUsers}
              </Badge>
            ) : isSuperAdminItem && userIsSuperAdmin ? (
              <Crown className="h-3 w-3 text-purple-500" />
            ) : item.badge ? (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs bg-slate-100 text-slate-500 border-0">
                {item.badge}
              </Badge>
            ) : null}
          </>
        )}
        {collapsed && item.id === "payments" && pendingPayments > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-500" />
        )}
        {collapsed && item.id === "risk-engine" && flaggedUsers > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
        )}
      </Button>
    )
  }

  return (
    <div
      className={cn(
        "relative flex flex-col border-r border-slate-200 bg-white transition-all duration-200",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <FlowChainLogoCompact size="sm" />
            <div>
              <span className="font-bold text-sm text-[#E85D3B] tracking-wide">FLOWCHAIN</span>
              <div className="flex items-center gap-1">
                <Crown className="h-3 w-3 text-purple-500" />
                <p className="text-xs text-purple-600 font-medium">Super Admin</p>
              </div>
            </div>
          </div>
        ) : (
          <FlowChainLogoCompact size="sm" className="mx-auto" />
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute -right-3 top-20 h-6 w-6 rounded-full border border-slate-200 bg-white shadow-sm z-10 hover:bg-slate-50 text-slate-500",
          collapsed && "justify-center px-2",
        )}
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      <ScrollArea className="flex-1 py-4">
        <div className="space-y-6 px-3">
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>
            )}
            {mainMenuItems.map(renderMenuItem)}
          </div>

          {!collapsed && <Separator className="bg-slate-200" />}

          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                Management
                <Crown className="h-3 w-3 text-purple-500" />
              </p>
            )}
            {managementItems.map(renderMenuItem)}
          </div>

          {!collapsed && <Separator className="bg-slate-200" />}

          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">System</p>
            )}
            {systemItems.map(renderMenuItem)}
          </div>
        </div>
      </ScrollArea>

      <div className="border-t border-slate-200 p-3">
        {!collapsed && adminData && (
          <div className="mb-3 p-2 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100">
            <p className="text-xs font-medium text-purple-700 truncate">{adminData.email}</p>
            <p className="text-xs text-purple-500 capitalize">{adminData.role?.replace("_", " ")}</p>
          </div>
        )}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 h-10 text-red-500 hover:text-red-600 hover:bg-red-50",
            collapsed && "justify-center px-2",
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </div>
  )
}
