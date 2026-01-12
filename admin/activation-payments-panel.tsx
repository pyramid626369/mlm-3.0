"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle2, XCircle, Clock, Search, Eye, DollarSign, Wallet, CreditCard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ActivationPayment {
  id: string
  email: string
  username: string
  wallet: string
  amount: number
  paymentMethod: "crypto" | "bank"
  screenshotUrl: string
  transactionHash?: string
  submittedAt: string
  status: "pending" | "approved" | "rejected"
}

interface Stats {
  pending: number
  approved_today: number
  rejected_today: number
  total_collected: number
}

export function ActivationPaymentsPanel() {
  const { toast } = useToast()
  const [payments, setPayments] = useState<ActivationPayment[]>([])
  const [stats, setStats] = useState<Stats>({ pending: 0, approved_today: 0, rejected_today: 0, total_collected: 0 })
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPayment, setSelectedPayment] = useState<ActivationPayment | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/admin/activation-payments")
      const data = await response.json()
      if (data.success) {
        setPayments(data.payments)
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch activation payments:", error)
    }
  }

  const handleAction = async (paymentId: string, action: "approve" | "reject", reason?: string) => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/admin/activation-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, action, reason }),
      })
      const data = await response.json()
      if (data.success) {
        toast({
          title: action === "approve" ? "Payment Approved" : "Payment Rejected",
          description: data.message,
        })
        setPayments((prev) => prev.filter((p) => p.id !== paymentId))
        setSelectedPayment(null)
        setShowRejectDialog(false)
        setRejectReason("")
        fetchPayments()
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to process payment", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }

  const filteredPayments = payments.filter(
    (p) =>
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.wallet.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60)
    if (diff < 60) return `${diff}m ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
    return `${Math.floor(diff / 1440)}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#1e1b4b] to-[#2e1065] border-[#7c3aed]/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#f59e0b]/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-[#f59e0b]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.pending}</p>
                <p className="text-sm text-[#9ca3af]">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1e1b4b] to-[#2e1065] border-[#7c3aed]/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#10b981]/20 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-[#10b981]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.approved_today}</p>
                <p className="text-sm text-[#9ca3af]">Approved Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1e1b4b] to-[#2e1065] border-[#7c3aed]/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#ef4444]/20 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-[#ef4444]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.rejected_today}</p>
                <p className="text-sm text-[#9ca3af]">Rejected Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1e1b4b] to-[#2e1065] border-[#7c3aed]/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#22d3ee]/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-[#22d3ee]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">${stats.total_collected}</p>
                <p className="text-sm text-[#9ca3af]">Collected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments List */}
      <Card className="bg-[#1f2937] border-[#374151]">
        <CardHeader className="border-b border-[#374151]">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Pending Activation Payments</CardTitle>
              <CardDescription className="text-[#9ca3af]">Review and approve user activation fees</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7280]" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64 bg-[#111827] border-[#374151] text-white"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-[#10b981] mx-auto mb-4" />
              <p className="text-lg font-medium text-white">All caught up!</p>
              <p className="text-sm text-[#9ca3af]">No pending activation payments</p>
            </div>
          ) : (
            <div className="divide-y divide-[#374151]">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="p-4 hover:bg-[#374151]/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#22d3ee] flex items-center justify-center text-white font-bold">
                        {payment.username[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">@{payment.username}</p>
                          <Badge
                            variant="outline"
                            className={
                              payment.paymentMethod === "crypto"
                                ? "bg-[#7c3aed]/10 text-[#7c3aed] border-[#7c3aed]/30"
                                : "bg-[#22d3ee]/10 text-[#22d3ee] border-[#22d3ee]/30"
                            }
                          >
                            {payment.paymentMethod === "crypto" ? (
                              <Wallet className="h-3 w-3 mr-1" />
                            ) : (
                              <CreditCard className="h-3 w-3 mr-1" />
                            )}
                            {payment.paymentMethod}
                          </Badge>
                        </div>
                        <p className="text-sm text-[#9ca3af]">{payment.email}</p>
                        <p className="text-xs text-[#6b7280] font-mono">{payment.wallet}</p>
                        {payment.transactionHash && (
                          <p className="text-xs text-[#6b7280] font-mono">
                            Transaction Hash: {payment.transactionHash}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#22d3ee]">${payment.amount}</p>
                        <p className="text-xs text-[#6b7280]">{formatTime(payment.submittedAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPayment(payment)}
                          className="border-[#374151] text-[#9ca3af] hover:bg-[#374151]"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          Auto-Verified
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Screenshot Dialog */}
      <Dialog open={!!selectedPayment && !showRejectDialog} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="bg-[#1f2937] border-[#374151] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Payment Screenshot</DialogTitle>
            <DialogDescription className="text-[#9ca3af]">
              Review the payment proof from @{selectedPayment?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <img
              src={selectedPayment?.screenshotUrl || "/placeholder.svg"}
              alt="Payment Screenshot"
              className="w-full rounded-lg border border-[#374151]"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg"
              }}
            />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#6b7280]">Amount</p>
                <p className="text-white font-medium">${selectedPayment?.amount}</p>
              </div>
              <div>
                <p className="text-[#6b7280]">Method</p>
                <p className="text-white font-medium capitalize">{selectedPayment?.paymentMethod}</p>
              </div>
              {selectedPayment?.transactionHash && (
                <div className="col-span-2">
                  <p className="text-[#6b7280] mb-1">Transaction Hash</p>
                  <p className="text-white font-mono text-xs break-all bg-[#111827] p-2 rounded border border-[#374151]">
                    {selectedPayment.transactionHash}
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedPayment(null)} className="w-full border-[#374151]">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="bg-[#1f2937] border-[#374151]">
          <DialogHeader>
            <DialogTitle className="text-white">Reject Payment</DialogTitle>
            <DialogDescription className="text-[#9ca3af]">
              Provide a reason for rejecting this activation payment
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="bg-[#111827] border-[#374151] text-white min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} className="border-[#374151]">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedPayment && handleAction(selectedPayment.id, "reject", rejectReason)}
              disabled={!rejectReason.trim() || isProcessing}
            >
              Reject Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
