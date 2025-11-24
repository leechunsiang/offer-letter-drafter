import { useState } from "react"
import { useStore, Candidate } from "@/store/useStore"
import { Button } from "@/components/ui/button"
import { CheckCircle, X, Eye } from "lucide-react"
import { generateOfferPDF } from "@/lib/pdfGenerator"
import { PreviewDialog } from "@/components/candidates/PreviewDialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function Admin() {
  const { candidates, templates, updateCandidateStatus, updateCandidateContent, companySettings } = useStore()
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [candidateToReject, setCandidateToReject] = useState<Candidate | null>(null)

  const submittedCandidates = candidates.filter(c => c.status === 'Submitted')

  // Get the default template or fallback to first template
  const getDefaultTemplate = () => {
    return templates.find(t => t.isDefault) || templates[0]
  }

  const handlePreview = (candidate: Candidate) => {
    if (templates.length === 0) {
      alert("Please create a template first.")
      return
    }
    setSelectedCandidate(candidate)
    setPreviewOpen(true)
  }

  const handleGenerate = async (candidate?: Candidate) => {
    const targetCandidate = candidate || selectedCandidate
    if (!targetCandidate || templates.length === 0) return

    const template = getDefaultTemplate()
    if (!template) {
      alert("Please create a template first.")
      return
    }
    await generateOfferPDF(targetCandidate, template, companySettings)
  }

  const handleSaveContent = async (content: string) => {
    if (!selectedCandidate) return
    await updateCandidateContent(selectedCandidate.id, content)
    setSelectedCandidate({ ...selectedCandidate, customContent: content })
  }

  const handleApprove = async (candidate: Candidate) => {
    if (confirm(`Are you sure you want to approve ${candidate.name}?`)) {
      try {
        await updateCandidateStatus(candidate.id, "Approved")
      } catch (error) {
        console.error('Failed to approve candidate:', error)
        alert('Failed to approve candidate')
      }
    }
  }

  const openRejectDialog = (candidate: Candidate) => {
    setCandidateToReject(candidate)
    setFeedback("")
    setRejectDialogOpen(true)
  }

  const handleReject = async () => {
    if (!candidateToReject) return
    if (!feedback.trim()) {
      alert("Please provide feedback for rejection.")
      return
    }

    try {
      await updateCandidateStatus(candidateToReject.id, "Rejected", feedback)
      setRejectDialogOpen(false)
      setCandidateToReject(null)
    } catch (error) {
      console.error('Failed to reject candidate:', error)
      alert('Failed to reject candidate')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Admin Approval</h1>
      </div>

      <div className="rounded-md border bg-card">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Name
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Role
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Status
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Offer Date
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {submittedCandidates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">
                    No pending approvals.
                  </td>
                </tr>
              ) : (
                submittedCandidates.map((candidate) => (
                  <tr
                    key={candidate.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle font-medium">
                      {candidate.name}
                      <div className="text-xs text-muted-foreground">
                        {candidate.email}
                      </div>
                    </td>
                    <td className="p-4 align-middle">{candidate.role}</td>
                    <td className="p-4 align-middle">
                      <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-blue-500 text-white hover:bg-blue-600">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        {candidate.status}
                      </div>
                    </td>
                    <td className="p-4 align-middle">{candidate.offerDate}</td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleApprove(candidate)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => openRejectDialog(candidate)}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handlePreview(candidate)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Preview</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PreviewDialog 
        open={previewOpen} 
        onOpenChange={setPreviewOpen}
        candidate={selectedCandidate}
        template={getDefaultTemplate()}
        companySettings={companySettings}
        onGenerate={() => handleGenerate()}
        onSave={handleSaveContent}
      />

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Candidate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="feedback">Reason for Rejection</Label>
              <Textarea
                id="feedback"
                placeholder="Please explain why this candidate is being rejected..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject Candidate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
