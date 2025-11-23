import { useState } from "react"
import { useStore, Candidate } from "@/store/useStore"
import { Button } from "@/components/ui/button"
import { Plus, CheckCircle, Clock, FileText, Trash2, X, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { generateOfferPDF } from "@/lib/pdfGenerator"
import { PreviewDialog } from "@/components/candidates/PreviewDialog"
import { AddCandidateDialog } from "@/components/candidates/AddCandidateDialog"

export default function Candidates() {
  const { candidates, templates, updateCandidateStatus, deleteCandidate, companySettings } = useStore()
  const [isOpen, setIsOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  
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
      await updateCandidateStatus(targetCandidate.id, "Generated")
      setPreviewOpen(false)
    } catch (error) {
      console.error('Failed to update candidate status:', error)
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
                    <div
                      className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        candidate.status === "Generated"
                          ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
                          : "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      )}
                    >
                      {candidate.status === "Generated" ? (
                        <CheckCircle className="mr-1 h-3 w-3" />
                      ) : (
                        <Clock className="mr-1 h-3 w-3" />
                      )}
                      {candidate.status}
                    </div>
                  </td>
                  <td className="p-4 align-middle">{candidate.offerDate}</td>
                  <td className="p-4 align-middle text-right">
                    {!isManageMode && (
                      <div className="flex items-center justify-end gap-2">
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
      />
    </div>
  )
}
