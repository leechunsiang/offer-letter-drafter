import { useState } from "react"
import { useStore, Candidate } from "@/store/useStore"
import { Button } from "@/components/ui/button"
import { Plus, CheckCircle, Clock, FileText, Trash2, X, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { generateOfferPDF } from "@/lib/pdfGenerator"
import { PreviewDialog } from "@/components/candidates/PreviewDialog"
import { AddCandidateDialog } from "@/components/candidates/AddCandidateDialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function Candidates() {
  const { candidates, templates, updateCandidateStatus, updateCandidateContent, deleteCandidate, companySettings } = useStore()
  const [isOpen, setIsOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<string>("")
  
  // Manage mode state
  const [isManageMode, setIsManageMode] = useState(false)
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set())

  // Get the default template or fallback to first template
  const getDefaultTemplate = () => {
    return templates.find(t => t.isDefault) || templates[0]
  }

  const handlePreview = (candidate: Candidate) => {
    console.log("Preview clicked for", candidate.name)
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

    console.log("Generating PDF for", targetCandidate.name)
    const template = getDefaultTemplate()
    if (!template) {
      alert("Please create a template first.")
      return
    }
    await generateOfferPDF(targetCandidate, template, companySettings)
    try {
      if (targetCandidate.status === 'Pending') {
        await updateCandidateStatus(targetCandidate.id, "Generated")
      }
      // Don't close preview automatically if generating from preview dialog
      // setPreviewOpen(false) 
    } catch (error) {
      console.error('Failed to update candidate status:', error)
    }
  }

  const handleSaveContent = async (content: string) => {
    if (!selectedCandidate) return
    await updateCandidateContent(selectedCandidate.id, content)
    // Update local state to reflect changes immediately in preview if needed
    setSelectedCandidate({ ...selectedCandidate, customContent: content })
  }

  const handleSubmit = async (candidate: Candidate) => {
    if (confirm(`Are you sure you want to submit ${candidate.name} for approval?`)) {
      try {
        await updateCandidateStatus(candidate.id, "Submitted")
      } catch (error) {
        console.error('Failed to submit candidate:', error)
        alert('Failed to submit candidate')
      }
    }
  }

  const toggleManageMode = () => {
    setIsManageMode(!isManageMode)
    setSelectedCandidates(new Set())
  }

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedCandidates)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedCandidates(newSelected)
  }

  const handleDeleteSelected = async () => {
    if (confirm(`Are you sure you want to delete ${selectedCandidates.size} candidate(s)?`)) {
      try {
        await Promise.all(Array.from(selectedCandidates).map(id => deleteCandidate(id)))
        setSelectedCandidates(new Set())
        setIsManageMode(false)
      } catch (error) {
        console.error('Failed to delete candidates:', error)
      }
    }
  }

  const handleViewFeedback = (feedback: string) => {
    console.log('handleViewFeedback called with:', feedback)
    setSelectedFeedback(feedback)
    setFeedbackDialogOpen(true)
    console.log('Dialog should now be open')
  }

  const getStatusColor = (status: Candidate['status']) => {
    switch (status) {
      case 'Generated':
      case 'Approved':
        return "border-transparent bg-green-500 text-white hover:bg-green-600"
      case 'Submitted':
        return "border-transparent bg-blue-500 text-white hover:bg-blue-600"
      case 'Rejected':
        return "border-transparent bg-red-500 text-white hover:bg-red-600"
      default:
        return "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
    }
  }

  const getStatusIcon = (status: Candidate['status']) => {
    switch (status) {
      case 'Generated':
      case 'Approved':
        return <CheckCircle className="mr-1 h-3 w-3" />
      case 'Submitted':
        return <Clock className="mr-1 h-3 w-3" /> // Or a different icon like Send
      case 'Rejected':
        return <X className="mr-1 h-3 w-3" />
      default:
        return <Clock className="mr-1 h-3 w-3" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
        <div className="flex items-center gap-2">
          {isManageMode ? (
            <>
              {selectedCandidates.size > 0 && (
                <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete ({selectedCandidates.size})
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={toggleManageMode}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={toggleManageMode}>
              Manage
            </Button>
          )}
          <Button onClick={() => setIsOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Candidate
          </Button>
          
          <AddCandidateDialog 
            open={isOpen} 
            onOpenChange={setIsOpen} 
          />
        </div>
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
              {candidates.map((candidate) => (
                <tr
                  key={candidate.id}
                  className={cn(
                    "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
                    isManageMode && "cursor-pointer",
                    selectedCandidates.has(candidate.id) && "bg-muted"
                  )}
                  onClick={() => isManageMode && toggleSelection(candidate.id)}
                >
                  <td className="p-4 align-middle font-medium">
                    {candidate.name}
                    <div className="text-xs text-muted-foreground">
                      {candidate.email}
                    </div>
                  </td>
                  <td className="p-4 align-middle">{candidate.role}</td>
                  <td className="p-4 align-middle">
                    <div className="flex flex-col gap-1 items-start">
                      <div
                        className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                          getStatusColor(candidate.status)
                        )}
                      >
                        {getStatusIcon(candidate.status)}
                        {candidate.status}
                      </div>
                      {candidate.status === 'Rejected' && candidate.feedback && (
                        <div 
                          className="text-xs text-red-500 max-w-[200px] truncate cursor-pointer hover:underline" 
                          title="Click to view full feedback"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewFeedback(candidate.feedback!)
                          }}
                        >
                          Reason: {candidate.feedback}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 align-middle">{candidate.offerDate}</td>
                  <td className="p-4 align-middle text-right">
                    {!isManageMode && (
                      <div className="flex items-center justify-end gap-2">
                        {(candidate.status === 'Pending' || candidate.status === 'Generated' || candidate.status === 'Rejected') && (
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSubmit(candidate)
                            }}
                          >
                            Submit
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreview(candidate)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleGenerate(candidate)
                          }}
                        >
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">Generate</span>
                        </Button>
                      </div>
                    )}
                    {isManageMode && (
                      <div className="flex justify-end">
                        <div className={cn(
                          "h-5 w-5 rounded-full border border-primary",
                          selectedCandidates.has(candidate.id) ? "bg-primary" : "bg-transparent"
                        )}>
                          {selectedCandidates.has(candidate.id) && (
                            <CheckCircle className="h-5 w-5 text-primary-foreground p-0.5" />
                          )}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
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

      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejection Feedback</DialogTitle>
            <DialogDescription>
              Full feedback provided for the rejected candidate.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-4 bg-muted rounded-md">
            <p className="text-sm whitespace-pre-wrap">{selectedFeedback}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
