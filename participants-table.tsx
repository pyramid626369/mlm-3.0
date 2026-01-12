"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Copy, Search, Filter, Download, Mail, Phone, Globe, User, Shield, Wallet, Hash } from "lucide-react"
import type { ParticipantProfile } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { CreateAdminDialog } from "@/components/create-admin-dialog"
import { StatusBadge } from "@/components/ui/status-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { SkeletonTable } from "@/components/ui/skeleton-loader"
import { UserRankBadge } from "@/components/user-rank-badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type ParticipantWithActivity = ParticipantProfile & {
  participantNumber?: number
  username?: string
  email?: string
  name?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  country?: string
  password?: string
  role?: string
  status?: "active" | "inactive" | "suspended"
  totalGiven: number
  totalReceived: number
  pendingRequests: number
  completedTransactions: number
  participation_count?: number
  activation_fee_paid?: boolean
  wallet_balance?: number
  contributed_amount?: number
}

type ParticipantsTableProps = {
  participants: ParticipantWithActivity[]
  onViewDetails: (participant: ParticipantWithActivity) => void
  isLoading?: boolean
}

function getRank(participationCount: number): "bronze" | "silver" | "gold" | "platinum" {
  if (participationCount >= 30) return "platinum"
  if (participationCount >= 15) return "gold"
  if (participationCount >= 5) return "silver"
  return "bronze"
}

export function ParticipantsTable({ participants, onViewDetails, isLoading }: ParticipantsTableProps) {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    })
  }

  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone?.includes(searchQuery) ||
      p.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.participantNumber?.toString().includes(searchQuery)

    const matchesRole = roleFilter === "all" || p.role === roleFilter
    const matchesStatus = statusFilter === "all" || p.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  const exportToCSV = () => {
    const headers = [
      "Number",
      "Username",
      "Name",
      "Email",
      "Phone",
      "Address",
      "City",
      "State",
      "Country",
      "Role",
      "Status",
      "Wallet Balance",
      "Contributed Amount",
      "Total Given",
      "Total Received",
      "Participations",
      "Activation Paid",
    ]
    const rows = filteredParticipants.map((p) => [
      p.participantNumber?.toString() || "",
      p.username || "",
      p.name || "",
      p.email || "",
      p.phone || "",
      p.address || "",
      p.city || "",
      p.state || "",
      p.country || "",
      p.role || "",
      p.status || "",
      (p.wallet_balance || 0).toString(),
      (p.contributed_amount || 0).toString(),
      p.totalGiven.toString(),
      p.totalReceived.toString(),
      p.participation_count?.toString() || "0",
      p.activation_fee_paid ? "Yes" : "No",
    ])

    const csvContent = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `participants-${new Date().toISOString().split("T")[0]}.csv`
    a.click()

    toast({
      title: "Exported!",
      description: `${filteredParticipants.length} participants exported to CSV`,
    })
  }

  if (isLoading) {
    return <SkeletonTable rows={5} />
  }

  return (
    <Card className="card-elevated">
      <CardHeader className="border-b border-slate-200 pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
              <User className="h-5 w-5 text-violet-600" />
              All Participants
            </CardTitle>
            <CardDescription className="text-slate-500 mt-1">
              {participants.length} registered • {participants.filter((p) => p.status === "active").length} active
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <CreateAdminDialog />
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              className="border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by name, username, email, phone, country, #number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-violet-500"
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {roleFilter === "all" ? "All Roles" : roleFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border-slate-200">
                <DropdownMenuLabel className="text-slate-500">Filter by Role</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem onClick={() => setRoleFilter("all")} className="text-slate-700 hover:bg-slate-50">
                  All Roles
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setRoleFilter("participant")}
                  className="text-slate-700 hover:bg-slate-50"
                >
                  Participants
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRoleFilter("admin")} className="text-slate-700 hover:bg-slate-50">
                  Admins
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {statusFilter === "all" ? "All Status" : statusFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border-slate-200">
                <DropdownMenuLabel className="text-slate-500">Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem onClick={() => setStatusFilter("all")} className="text-slate-700 hover:bg-slate-50">
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter("active")}
                  className="text-slate-700 hover:bg-slate-50"
                >
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter("inactive")}
                  className="text-slate-700 hover:bg-slate-50"
                >
                  Inactive
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter("suspended")}
                  className="text-slate-700 hover:bg-slate-50"
                >
                  Suspended
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {filteredParticipants.length === 0 ? (
          <div className="p-6">
            <EmptyState
              type="users"
              title="No participants found"
              description="Try adjusting your search or filters to find what you're looking for."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-b border-slate-200 hover:bg-slate-50">
                  <TableHead className="font-semibold text-violet-600 w-20">#</TableHead>
                  <TableHead className="font-semibold text-violet-600">User</TableHead>
                  <TableHead className="font-semibold text-violet-600">Contact</TableHead>
                  <TableHead className="font-semibold text-violet-600">Location</TableHead>
                  <TableHead className="font-semibold text-violet-600 text-right">Wallet</TableHead>
                  <TableHead className="font-semibold text-violet-600 text-right">Contributed</TableHead>
                  <TableHead className="font-semibold text-violet-600">Rank</TableHead>
                  <TableHead className="font-semibold text-violet-600">Status</TableHead>
                  <TableHead className="font-semibold text-violet-600 text-right">Activity</TableHead>
                  <TableHead className="font-semibold text-violet-600 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants.map((participant, index) => (
                  <TableRow
                    key={participant.id}
                    className="group border-b border-slate-100 hover:bg-violet-50/50 transition-colors"
                  >
                    {/* Number */}
                    <TableCell>
                      <Badge className="font-mono text-xs bg-cyan-100 text-cyan-700 border-cyan-200 hover:bg-cyan-200">
                        <Hash className="h-3 w-3 mr-1" />
                        {participant.participantNumber || index + 100}
                      </Badge>
                    </TableCell>

                    {/* User Info */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {participant.name || <span className="text-slate-400 italic">No name</span>}
                          </span>
                          {participant.activation_fee_paid && (
                            <Badge className="text-[10px] px-1.5 py-0 bg-emerald-100 text-emerald-700 border-emerald-200">
                              Activated
                            </Badge>
                          )}
                        </div>
                        {participant.username && (
                          <span className="text-xs text-violet-600">@{participant.username}</span>
                        )}
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Wallet className="h-3 w-3" />
                          <span className="font-mono">
                            {participant.wallet_address.slice(0, 6)}...{participant.wallet_address.slice(-4)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-violet-600"
                            onClick={() => copyToClipboard(participant.wallet_address, "Wallet")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>

                    {/* Contact */}
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-sm text-slate-700">{participant.email || "—"}</span>
                          {participant.email && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-violet-600"
                              onClick={() => copyToClipboard(participant.email!, "Email")}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-sm text-slate-700">{participant.phone || "—"}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Location */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 text-slate-400" />
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-900 font-medium">{participant.country || "—"}</span>
                          {(participant.city || participant.state) && (
                            <span className="text-xs text-slate-400">
                              {[participant.city, participant.state].filter(Boolean).join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Wallet Balance */}
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-semibold text-emerald-600">
                          ${(participant.wallet_balance || 0).toFixed(2)}
                        </span>
                        <span className="text-xs text-slate-400">Balance</span>
                      </div>
                    </TableCell>

                    {/* Contributed Amount */}
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-semibold text-violet-600">
                          ${(participant.contributed_amount || 0).toFixed(2)}
                        </span>
                        <span className="text-xs text-slate-400">Contributed</span>
                      </div>
                    </TableCell>

                    {/* Rank */}
                    <TableCell>
                      <UserRankBadge rank={getRank(participant.participation_count || 0)} size="sm" showLabel />
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusBadge status={participant.status || "active"} />
                    </TableCell>

                    {/* Activity */}
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-sm font-semibold text-emerald-600">
                          ${participant.totalGiven.toFixed(0)}
                        </span>
                        <span className="text-xs text-slate-400">{participant.completedTransactions} transactions</span>
                        <span className="text-xs text-violet-600">
                          {participant.participation_count || 0} participations
                        </span>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-400 hover:text-violet-600 hover:bg-violet-100"
                        onClick={() => onViewDetails(participant)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-4 border-t border-slate-200 text-sm">
          <span className="text-slate-500">
            Showing <span className="text-slate-900 font-medium">{filteredParticipants.length}</span> of{" "}
            <span className="text-slate-900 font-medium">{participants.length}</span> participants
          </span>
          <div className="flex items-center gap-4 text-slate-500">
            <span>
              Total Volume:{" "}
              <span className="text-emerald-600 font-semibold">
                ${participants.reduce((sum, p) => sum + p.totalGiven, 0).toFixed(2)}
              </span>
            </span>
            <span>
              Activated:{" "}
              <span className="text-emerald-600 font-semibold">
                {participants.filter((p) => p.activation_fee_paid).length}
              </span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
