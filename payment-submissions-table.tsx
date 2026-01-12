"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  ImageIcon,
  Wallet,
  Mail,
  Calendar,
  CreditCard,
  Filter,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { PaymentSubmission } from "@/app/api/participant/submit-payment/route"

type Props = {
  submissions: PaymentSubmission[]
  onStatusUpdate: (submissionId: string, status: "confirmed" | "rejected", reason?: string) => Promise<void>
}

export function PaymentSubmissionsTable({ submissions, onStatusUpdate }: Props) {
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "confirmed" | "rejected">("all")
  const [selectedSubmission, setSelectedSubmission] = useState<PaymentSubmission | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch =
      s.participantEmail.toLowerCase().includes(search.toLowerCase()) ||
      s.participantWallet.toLowerCase().includes(search.toLowerCase()) ||
      s.participantName?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || s.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleConfirm = async (submission: PaymentSubmission) => {
    setIsUpdating(true)
    try {
      await onStatusUpdate(submission.id, "confirmed")
      toast({
        title: "Payment Confirmed",
        description: `Payment from ${submission.participantEmail} has been confirmed`,
      })
      setSelectedSubmission(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm payment",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleReject = async () => {
    if (!selectedSubmission) return
    setIsUpdating(true)
    try {
      await onStatusUpdate(selectedSubmission.id, "rejected", rejectionReason)
      toast({
        title: "Payment Rejected",
        description: `Payment from ${selectedSubmission.participantEmail} has been rejected`,
      })
      setShowRejectDialog(false)
      setSelectedSubmission(null)
      setRejectionReason("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject payment",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusBadge = (status: PaymentSubmission["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-warning/20 text-warning border-warning/30">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "confirmed":
        return (
          <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Confirmed
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-destructive/20 text-destructive border-destructive/30">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Payment Submissions
            </CardTitle>
            <CardDescription>Review and verify payment screenshots from participants</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{submissions.filter((s) => s.status === "pending").length} pending</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email, name, or wallet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "pending", "confirmed", "rejected"] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="capitalize"
              >
                {status === "all" ? <Filter className="h-3 w-3 mr-1" /> : null}
                {status}
              </Button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Participant</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No submissions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{submission.participantName || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{submission.participantEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-success">${submission.amount}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {submission.paymentMethod === "crypto" ? "Crypto" : "Bank"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedSubmission(submission)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* View Submission Dialog */}
      <Dialog open={!!selectedSubmission && !showRejectDialog} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Payment Submission Details
            </DialogTitle>
            <DialogDescription>Review the payment proof and participant information</DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-6 py-4">
              {/* Participant Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium text-sm">Participant Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedSubmission.participantEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {selectedSubmission.participantWallet.slice(0, 10)}...
                        {selectedSubmission.participantWallet.slice(-8)}
                      </code>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium text-sm">Payment Info</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-bold text-success">${selectedSubmission.amount} USDT</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Method:</span>
                      <Badge variant="outline" className="capitalize">
                        <CreditCard className="h-3 w-3 mr-1" />
                        {selectedSubmission.paymentMethod}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Submitted:</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(selectedSubmission.submittedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Screenshot */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Payment Screenshot</Label>
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border bg-muted">
                  <img
                    src={selectedSubmission.screenshotUrl || "/placeholder.svg"}
                    alt="Payment screenshot"
                    className="object-contain w-full h-full"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Current Status:</span>
                {getStatusBadge(selectedSubmission.status)}
              </div>

              {/* Rejection reason if rejected */}
              {selectedSubmission.status === "rejected" && selectedSubmission.rejectionReason && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm font-medium text-destructive mb-1">Rejection Reason:</p>
                  <p className="text-sm text-muted-foreground">{selectedSubmission.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            {selectedSubmission?.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowRejectDialog(true)}
                  className="text-destructive hover:text-destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleConfirm(selectedSubmission)}
                  disabled={isUpdating}
                  className="bg-success hover:bg-success/90"
                >
                  {isUpdating ? (
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Confirm Payment
                </Button>
              </>
            )}
            {selectedSubmission?.status !== "pending" && (
              <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Reject Payment
            </DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this payment submission.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Rejection Reason</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Screenshot is unclear, amount doesn't match, etc."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isUpdating || !rejectionReason.trim()}>
              {isUpdating ? (
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Reject Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
