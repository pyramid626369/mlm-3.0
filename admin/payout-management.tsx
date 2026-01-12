"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DollarSign,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Settings,
  Search,
  Filter,
  Download,
  Eye,
} from "lucide-react"

interface PayoutRequest {
  id: string
  username: string
  email: string
  amount: number
  wallet: string
  network: string
  status: "pending" | "processing" | "completed" | "failed" | "cancelled"
  requestedAt: string
  processedAt?: string
  txHash?: string
}

interface PayoutManagementProps {
  onProcessPayout?: (id: string) => void
  onRejectPayout?: (id: string) => void
}

export function PayoutManagement({ onProcessPayout, onRejectPayout }: PayoutManagementProps) {
  const [filter, setFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null)
  const [showProcessDialog, setShowProcessDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [autoPayoutEnabled, setAutoPayoutEnabled] = useState(true)

  // Mock data
  const payoutRequests: PayoutRequest[] = [
    {
      id: "1",
      username: "john_doe",
      email: "john@example.com",
      amount: 150,
      wallet: "0x1234567890abcdef1234567890abcdef12345678",
      network: "BSC",
      status: "pending",
      requestedAt: "2025-01-08T10:30:00Z",
    },
    {
      id: "2",
      username: "jane_smith",
      email: "jane@example.com",
      amount: 200,
      wallet: "0xabcdef1234567890abcdef1234567890abcdef12",
      network: "ETH",
      status: "processing",
      requestedAt: "2025-01-08T09:15:00Z",
    },
    {
      id: "3",
      username: "mike_wilson",
      email: "mike@example.com",
      amount: 175,
      wallet: "0x9876543210fedcba9876543210fedcba98765432",
      network: "BSC",
      status: "completed",
      requestedAt: "2025-01-07T14:20:00Z",
      processedAt: "2025-01-07T15:30:00Z",
      txHash: "0xabc123...",
    },
    {
      id: "4",
      username: "sarah_jones",
      email: "sarah@example.com",
      amount: 100,
      wallet: "0xfedcba0987654321fedcba0987654321fedcba09",
      network: "POLYGON",
      status: "failed",
      requestedAt: "2025-01-07T11:45:00Z",
    },
  ]

  const filteredRequests = payoutRequests.filter((req) => {
    const matchesFilter = filter === "all" || req.status === filter
    const matchesSearch =
      req.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const stats = {
    pending: payoutRequests.filter((r) => r.status === "pending").length,
    processing: payoutRequests.filter((r) => r.status === "processing").length,
    totalPending: payoutRequests
      .filter((r) => r.status === "pending" || r.status === "processing")
      .reduce((sum, r) => sum + r.amount, 0),
    todayProcessed: payoutRequests.filter((r) => r.status === "completed").length,
  }

  const handleProcess = async () => {
    if (!selectedPayout) return
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    onProcessPayout?.(selectedPayout.id)
    setIsProcessing(false)
    setShowProcessDialog(false)
    setSelectedPayout(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "processing":
        return (
          <Badge className="bg-[#22d3ee]/20 text-[#22d3ee] border border-[#22d3ee]/30">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Processing
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-[#6b7280]/20 text-[#6b7280] border border-[#6b7280]/30">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-[#1e1b4b] to-[#2e1065] border-[#7c3aed]/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#9ca3af]">Pending Requests</p>
                  <p className="text-2xl font-bold text-[#f59e0b]">{stats.pending}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-[#f59e0b]/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-[#f59e0b]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#1e1b4b] to-[#2e1065] border-[#7c3aed]/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#9ca3af]">Processing</p>
                  <p className="text-2xl font-bold text-[#22d3ee]">{stats.processing}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-[#22d3ee]/20 flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 text-[#22d3ee]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#1e1b4b] to-[#2e1065] border-[#7c3aed]/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#9ca3af]">Total Pending</p>
                  <p className="text-2xl font-bold text-white">${stats.totalPending}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-[#7c3aed]/20 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-[#7c3aed]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#1e1b4b] to-[#2e1065] border-[#7c3aed]/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#9ca3af]">Today Processed</p>
                  <p className="text-2xl font-bold text-[#10b981]">{stats.todayProcessed}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-[#10b981]/20 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-[#10b981]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Auto-Payout Settings */}
        <Card className="bg-gradient-to-br from-[#1e1b4b] to-[#2e1065] border-[#7c3aed]/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-[#22d3ee]" />
                <CardTitle className="text-white">Auto-Payout Settings</CardTitle>
              </div>
              <Switch checked={autoPayoutEnabled} onCheckedChange={setAutoPayoutEnabled} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-[#111827] border border-[#374151]">
                <Label className="text-[#9ca3af] text-xs">Schedule</Label>
                <p className="text-white font-medium">Daily at 00:00 UTC</p>
              </div>
              <div className="p-3 rounded-lg bg-[#111827] border border-[#374151]">
                <Label className="text-[#9ca3af] text-xs">Min Amount</Label>
                <p className="text-white font-medium">$50.00</p>
              </div>
              <div className="p-3 rounded-lg bg-[#111827] border border-[#374151]">
                <Label className="text-[#9ca3af] text-xs">Next Run</Label>
                <p className="text-white font-medium">In 4h 23m</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payout Requests Table */}
        <Card className="bg-gradient-to-br from-[#1e1b4b] to-[#2e1065] border-[#7c3aed]/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Payout Requests</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7280]" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64 bg-[#111827] border-[#374151] text-white"
                  />
                </div>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-32 bg-[#111827] border-[#374151] text-white">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1f2937] border-[#374151]">
                    <SelectItem value="all" className="text-white">
                      All
                    </SelectItem>
                    <SelectItem value="pending" className="text-white">
                      Pending
                    </SelectItem>
                    <SelectItem value="processing" className="text-white">
                      Processing
                    </SelectItem>
                    <SelectItem value="completed" className="text-white">
                      Completed
                    </SelectItem>
                    <SelectItem value="failed" className="text-white">
                      Failed
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="border-[#374151] text-[#9ca3af] bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-[#374151] hover:bg-transparent">
                  <TableHead className="text-[#9ca3af]">User</TableHead>
                  <TableHead className="text-[#9ca3af]">Amount</TableHead>
                  <TableHead className="text-[#9ca3af]">Wallet</TableHead>
                  <TableHead className="text-[#9ca3af]">Network</TableHead>
                  <TableHead className="text-[#9ca3af]">Status</TableHead>
                  <TableHead className="text-[#9ca3af]">Requested</TableHead>
                  <TableHead className="text-[#9ca3af]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id} className="border-[#374151] hover:bg-[#7c3aed]/10">
                    <TableCell>
                      <div>
                        <p className="font-medium text-white">{request.username}</p>
                        <p className="text-xs text-[#6b7280]">{request.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-white font-medium">${request.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <code className="text-xs text-[#9ca3af]">
                        {request.wallet.slice(0, 6)}...{request.wallet.slice(-4)}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-[#374151] text-[#9ca3af] border-0">{request.network}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-[#9ca3af] text-sm">
                      {new Date(request.requestedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-[#9ca3af] hover:text-white"
                          onClick={() => {
                            setSelectedPayout(request)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {request.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-[#10b981] hover:text-[#10b981] hover:bg-[#10b981]/20"
                              onClick={() => {
                                setSelectedPayout(request)
                                setShowProcessDialog(true)
                              }}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-[#ef4444] hover:text-[#ef4444] hover:bg-[#ef4444]/20"
                              onClick={() => onRejectPayout?.(request.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Process Dialog */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent className="bg-[#1e1b4b] border-[#374151] text-white">
          <DialogHeader>
            <DialogTitle>Process Payout</DialogTitle>
            <DialogDescription className="text-[#9ca3af]">
              Confirm the payout details before processing
            </DialogDescription>
          </DialogHeader>

          {selectedPayout && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-xl bg-[#111827] border border-[#374151] space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#9ca3af]">Recipient</span>
                  <span className="text-white font-medium">{selectedPayout.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9ca3af]">Amount</span>
                  <span className="text-[#10b981] font-bold">${selectedPayout.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9ca3af]">Network</span>
                  <Badge className="bg-[#374151] text-white border-0">{selectedPayout.network}</Badge>
                </div>
                <div className="pt-2 border-t border-[#374151]">
                  <span className="text-[#9ca3af] text-xs">Wallet Address</span>
                  <code className="block text-xs text-[#22d3ee] mt-1 break-all">{selectedPayout.wallet}</code>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/30">
                <AlertTriangle className="h-4 w-4 text-[#f59e0b]" />
                <span className="text-sm text-[#f59e0b]">This action cannot be undone</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowProcessDialog(false)}
              className="border-[#374151] text-[#9ca3af]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleProcess}
              disabled={isProcessing}
              className="bg-[#10b981] hover:bg-[#059669] text-white"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Process Payout
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
