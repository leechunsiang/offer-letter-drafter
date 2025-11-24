import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Candidate, Template, CompanySettings } from "@/store/useStore"
import { generateOfferContent } from "@/lib/pdfGenerator"
import { Download, Pencil, Save, X } from "lucide-react"
import RichTextEditor from "@/components/RichTextEditor"

interface PreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidate: Candidate | null
  template: Template | null
  companySettings: CompanySettings
  onGenerate: () => void
  onSave: (content: string) => Promise<void>
}

export function PreviewDialog({
  open,
  onOpenChange,
  candidate,
  template,
  companySettings,
  onGenerate,
  onSave,
}: PreviewDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open && candidate && template) {
      if (candidate.customContent) {
        setContent(candidate.customContent)
      } else {
        const generated = generateOfferContent(candidate, template, companySettings)
        setContent(generated)
      }
      setIsEditing(false)
    }
  }, [open, candidate, template, companySettings])

  if (!candidate || !template) return null

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(content)
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to save content:", error)
      alert("Failed to save changes")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Revert to original content
    if (candidate.customContent) {
      setContent(candidate.customContent)
    } else {
      setContent(generateOfferContent(candidate, template, companySettings))
    }
    setIsEditing(false)
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!isSaving) onOpenChange(val)
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col h-[90vh]">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <DialogTitle>Offer Letter Preview</DialogTitle>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button size="sm" onClick={onGenerate}>
                  <Download className="mr-2 h-4 w-4" />
                  Generate PDF
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isSaving}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            )}
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden border rounded-md bg-white shadow-sm flex flex-col">
          {isEditing ? (
            <RichTextEditor
              value={content}
              onChange={setContent}
              className="border-0 rounded-none h-full"
            />
          ) : (
            <div className="flex-1 overflow-y-auto p-8">
              {companySettings.branding.logoUrl && (
                <div className="mb-8">
                  <img 
                    src={companySettings.branding.logoUrl} 
                    alt="Company Logo" 
                    className="h-16 object-contain"
                  />
                </div>
              )}
              <div 
                className="prose max-w-none font-serif preview-content"
                dangerouslySetInnerHTML={{ __html: content }}
              />
              <style dangerouslySetInnerHTML={{__html: `
                .preview-content ul {
                  list-style-type: disc;
                  padding-left: 1.5em;
                  margin-top: 0.5em;
                  margin-bottom: 0.5em;
                }
                .preview-content li {
                  margin-top: 0.25em;
                  margin-bottom: 0.25em;
                }
              `}} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
