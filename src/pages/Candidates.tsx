import { useState } from "react"
import { useStore } from "@/store/useStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, CheckCircle, Clock, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { generateOfferPDF } from "@/lib/pdfGenerator"

import { PreviewDialog } from "@/components/candidates/PreviewDialog"
import { Eye } from "lucide-react"
import { Candidate } from "@/store/useStore"

export default function Candidates() {
  const { candidates, templates, addCandidate, updateCandidateStatus, companySettings } = useStore()
  const [isOpen, setIsOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    offerDate: new Date().toISOString().split("T")[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addCandidate(formData)
      setIsOpen(false)
      setFormData({
        name: "",
        email: "",
        role: "",
        offerDate: new Date().toISOString().split("T")[0],
      })
    } catch (error) {
      console.error('Failed to add candidate:', error)
    }
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
    const template = templates[0]
    await generateOfferPDF(targetCandidate, template, companySettings)
    try {
      await updateCandidateStatus(targetCandidate.id, "Generated")
      setPreviewOpen(false)
    } catch (error) {
      console.error('Failed to update candidate status:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Candidate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Candidate</DialogTitle>
              <DialogDescription>
                Enter the candidate's details to add them to the pipeline.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Offer Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.offerDate}
                  onChange={(e) =>
                    setFormData({ ...formData, offerDate: e.target.value })
                  }
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit">Add Candidate</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
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
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePreview(candidate)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleGenerate(candidate)}
                      >
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">Generate</span>
                      </Button>
                    </div>
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
        template={templates[0]}
        companySettings={companySettings}
        onGenerate={() => handleGenerate()}
      />
    </div>
  )
}
