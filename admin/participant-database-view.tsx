"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Download,
  Filter,
  Eye,
  Mail,
  Phone,
  MapPin,
  Wallet,
  Award,
  MoreVertical,
  Ban,
  CheckCircle,
  XCircle,
  Database,
} from "lucide-react"
import type { ParticipantUser } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { UserRankBadge } from "@/components/user-rank-badge"

type ParticipantDatabaseViewProps = {
  participants: ParticipantUser[]
  onViewDetails: (participant: ParticipantUser) => void
}

export function ParticipantDatabaseView({ participants, onViewDetails }: ParticipantDatabaseViewProps) {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [rankFilter, setRankFilter] = useState<string>("all")
  const [activationFilter, setActivationFilter] = useState<string>("all")

  // Filter participants
  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone?.includes(searchQuery) ||
      p.participantNumber?.toString().includes(searchQuery) ||
      p.country?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || p.status === statusFilter
    const matchesRank = rankFilter === "all" || p.rank === rankFilter
    const matchesActivation =
      activationFilter === "all" ||
      (activationFilter === "activated" && p.activation_fee_paid) ||
      (activationFilter === "pending" && !p.activation_fee_paid)

    return matchesSearch && matchesStatus && matchesRank && matchesActivation
  })

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "Participant #",
      "Username",
      "Name",
      "Email",
      "Phone",
      "Country Code",
      "Country",
      "State",
      "City",
      "Postal Code",
      "Address",
      "Date of Birth",
      "Gender",
      "Occupation",
      "Monthly Income",
      "Wallet Address",
      "Activation Paid",
      "Activation Amount",
      "Payment Method",
      "Payment Status",
      "Status",
      "Rank",
      "Participations",
      "Total Contributed",
      "Total Points",
      "Login Streak",
      "Risk Score",
      "IP Address",
      "Referral Code",
      "Heard From",
      "Created At",
      "Last Active",
    ]

    const rows = filteredParticipants.map((p) => [
      p.participantNumber,
      p.username,
      p.name || "",
      p.email,
      p.phone || "",
      p.country_code || "",
      p.country || "",
      p.state || "",
      p.city || "",
      p.postal_code || "",
      p.address || "",
      p.date_of_birth || "",
      p.gender || "",
      p.occupation || "",
      p.monthly_income || "",
      p.wallet_address,
      p.activation_fee_paid ? "Yes" : "No",
      p.activation_fee_amount,
      p.activation_payment_method || "",
      p.activation_payment_status || "",
      p.status,
      p.rank,
      p.participation_count,
      p.totalContributed || 0,
      p.totalPoints || 0,
      p.loginStreak || 0,
      p.risk_score,
      p.ip_address || "",
      p.referral_code || "",
      p.heard_from || "",
      new Date(p.created_at).toLocaleString(),
      new Date(p.last_active).toLocaleString(),
    ])

    const csvContent = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `participants-database-${new Date().toISOString().split("T")[0]}.csv`
    a.click()

    toast({
      title: "Database Exported",
      description: `${filteredParticipants.length} participants exported to CSV`,
    })
  }

  return (
    <Card className="card-elevated">
      <CardHeader className="border-b border-slate-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
              <Database className="h-5 w-5 text-violet-600" />
              Participants Database
            </CardTitle>
            <CardDescription className="text-slate-500 mt-1">
              Complete database of all registered participants with detailed information
            </CardDescription>
          </div>
          <Button onClick={exportToCSV} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Download className="h-4 w-4 mr-2" />
            Export Database
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-3 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search participants by name, username, email, phone, country, #number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Status: {statusFilter === "all" ? "All" : statusFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Status</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("active")}>Active</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("suspended")}>Suspended</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("frozen")}>Frozen</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Award className="h-4 w-4 mr-2" />
                  Rank: {rankFilter === "all" ? "All" : rankFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setRankFilter("all")}>All Ranks</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRankFilter("platinum")}>Platinum</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRankFilter("gold")}>Gold</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRankFilter("silver")}>Silver</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRankFilter("bronze")}>Bronze</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Activation: {activationFilter === "all" ? "All" : activationFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setActivationFilter("all")}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActivationFilter("activated")}>Activated</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActivationFilter("pending")}>Pending</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <p className="text-xs text-slate-500">Total Records</p>
            <p className="text-2xl font-bold text-slate-900">{participants.length}</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
            <p className="text-xs text-emerald-700">Activated</p>
            <p className="text-2xl font-bold text-emerald-600">
              {participants.filter((p) => p.activation_fee_paid).length}
            </p>
          </div>
          <div className="bg-violet-50 rounded-lg p-3 border border-violet-200">
            <p className="text-xs text-violet-700">Filtered Results</p>
            <p className="text-2xl font-bold text-violet-600">{filteredParticipants.length}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <p className="text-xs text-amber-700">Total Volume</p>
            <p className="text-2xl font-bold text-amber-600">
              ${participants.reduce((sum, p) => sum + (p.totalContributed || 0), 0).toFixed(0)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold text-violet-600">#</TableHead>
                <TableHead className="font-semibold text-violet-600">User Info</TableHead>
                <TableHead className="font-semibold text-violet-600">Contact</TableHead>
                <TableHead className="font-semibold text-violet-600">Location</TableHead>
                <TableHead className="font-semibold text-violet-600">Personal</TableHead>
                <TableHead className="font-semibold text-violet-600">Wallet</TableHead>
                <TableHead className="font-semibold text-violet-600">Activation</TableHead>
                <TableHead className="font-semibold text-violet-600">Status</TableHead>
                <TableHead className="font-semibold text-violet-600">Activity</TableHead>
                <TableHead className="font-semibold text-violet-600 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipants.map((participant) => (
                <TableRow key={participant.id} className="border-b border-slate-100 hover:bg-violet-50/30">
                  {/* Participant Number */}
                  <TableCell>
                    <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200 font-mono">
                      #{participant.participantNumber}
                    </Badge>
                  </TableCell>

                  {/* User Info */}
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">{participant.name || "—"}</p>
                      <p className="text-xs text-violet-600">@{participant.username}</p>
                      <div className="flex items-center gap-1">
                        <UserRankBadge rank={participant.rank} size="sm" showLabel />
                      </div>
                    </div>
                  </TableCell>

                  {/* Contact */}
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <span className="text-xs text-slate-700">{participant.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span className="text-xs text-slate-700">
                          {participant.country_code} {participant.phone || "—"}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Location */}
                  <TableCell>
                    <div className="space-y-0.5 text-xs">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span className="font-medium text-slate-900">{participant.country || "—"}</span>
                      </div>
                      {participant.state && <p className="text-slate-600">{participant.state}</p>}
                      {participant.city && <p className="text-slate-500">{participant.city}</p>}
                      {participant.postal_code && <p className="text-slate-400">{participant.postal_code}</p>}
                    </div>
                  </TableCell>

                  {/* Personal Info */}
                  <TableCell>
                    <div className="space-y-0.5 text-xs text-slate-600">
                      {participant.date_of_birth && <p>DOB: {participant.date_of_birth}</p>}
                      {participant.gender && <p>Gender: {participant.gender}</p>}
                      {participant.occupation && <p>Occupation: {participant.occupation}</p>}
                      {participant.monthly_income && <p>Income: {participant.monthly_income}</p>}
                    </div>
                  </TableCell>

                  {/* Wallet */}
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Wallet className="h-3 w-3 text-slate-400" />
                      <code className="text-xs text-slate-600 font-mono">
                        {participant.wallet_address.slice(0, 6)}...{participant.wallet_address.slice(-4)}
                      </code>
                    </div>
                  </TableCell>

                  {/* Activation */}
                  <TableCell>
                    <div className="space-y-1">
                      {participant.activation_fee_paid ? (
                        <>
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Activated
                          </Badge>
                          <p className="text-[10px] text-slate-500">
                            {new Date(participant.activation_fee_paid_at || "").toLocaleDateString()}
                          </p>
                        </>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                          <XCircle className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <div className="space-y-1">
                      <Badge
                        className={
                          participant.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : participant.status === "frozen"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                        }
                      >
                        {participant.status}
                      </Badge>
                      <p className="text-[10px] text-slate-500">Risk: {participant.risk_score}</p>
                    </div>
                  </TableCell>

                  {/* Activity */}
                  <TableCell>
                    <div className="space-y-0.5 text-xs">
                      <p className="text-slate-700">
                        <span className="font-semibold text-violet-600">{participant.participation_count}</span>{" "}
                        participations
                      </p>
                      <p className="text-emerald-600 font-semibold">${participant.totalContributed || 0}</p>
                      <p className="text-amber-600">{participant.totalPoints || 0} pts</p>
                      <p className="text-slate-400 text-[10px]">
                        Last: {new Date(participant.last_active).toLocaleDateString()}
                      </p>
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-violet-100">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onViewDetails(participant)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Ban className="h-4 w-4 mr-2" />
                          Suspend Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-900">{filteredParticipants.length}</span> of{" "}
            <span className="font-medium text-slate-900">{participants.length}</span> participants
          </p>
          <p className="text-sm text-slate-500">
            Database last updated: <span className="font-medium">{new Date().toLocaleString()}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
