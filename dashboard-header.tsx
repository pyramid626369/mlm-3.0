"use client"

import { RefreshCw, Bell, Search, Command } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { getAdminData } from "@/lib/auth"
import { CreateAdminDialog } from "@/components/create-admin-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type DashboardHeaderProps = {
  onRefresh: () => void
  isRefreshing: boolean
}

export function DashboardHeader({ onRefresh, isRefreshing }: DashboardHeaderProps) {
  const [adminData, setAdminData] = useState<{ email: string; role: string } | null>(null)

  useEffect(() => {
    const data = getAdminData()
    setAdminData(data)
  }, [])

  return (
    <header className="h-14 border-b border-slate-200 bg-white sticky top-0 z-50">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-72 hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search participants..."
              className="pl-9 pr-12 h-9 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:ring-violet-500/20"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border border-slate-200 bg-slate-100 px-1.5 font-mono text-[10px] font-medium opacity-100 hidden sm:flex text-slate-500">
                <Command className="h-3 w-3" />K
              </kbd>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <CreateAdminDialog />

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 relative text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[#e85d3b] rounded-full animate-pulse" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-white border-slate-200">
              <DropdownMenuLabel className="text-slate-900">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100" />
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 focus:bg-slate-50">
                <span className="font-medium text-slate-900">New participant registered</span>
                <span className="text-xs text-slate-500">sheetal@gmail.com joined 2 hours ago</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 focus:bg-slate-50">
                <span className="font-medium text-slate-900">Contribution submitted</span>
                <span className="text-xs text-slate-500">$100 USDT awaiting verification</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-100" />
              <DropdownMenuItem className="text-center text-[#7c3aed] focus:bg-slate-50">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 gap-2 pl-2 pr-3 ml-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
              >
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">
                    {adminData?.email?.charAt(0).toUpperCase() || "A"}
                  </span>
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium leading-none text-slate-900">
                    {adminData?.email?.split("@")[0] || "Admin"}
                  </span>
                  <span className="text-[10px] text-slate-500 capitalize">{adminData?.role || "admin"}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border-slate-200">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-900">{adminData?.email || "admin@system.com"}</span>
                  <Badge variant="secondary" className="w-fit mt-1.5 capitalize text-xs bg-violet-100 text-[#7c3aed]">
                    {adminData?.role || "admin"}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100" />
              <DropdownMenuItem className="focus:bg-slate-50 text-slate-700">Profile Settings</DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-slate-50 text-slate-700">Preferences</DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-slate-50 text-slate-700">Help & Support</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
