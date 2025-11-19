import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Candidate, Template, CompanySettings } from "@/store/useStore"
import { generateOfferContent } from "@/lib/pdfGenerator"
import { Download } from "lucide-react"

interface PreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidate: Candidate | null
  template: Template | null
  companySettings: CompanySettings
  onGenerate: () => void
}

export function PreviewDialog({
  open,
  onOpenChange,
  candidate,
  template,
  companySettings,
  onGenerate,
}: PreviewDialogProps) {
  if (!candidate || !template) return null

  console.log("PreviewDialog rendering. Company Settings:", companySettings);
  if (companySettings.branding.logoUrl) {
    console.log("PreviewDialog: Logo URL present, length:", companySettings.branding.logoUrl.length);
  } else {
    console.log("PreviewDialog: No logo URL found.");
  }

  const content = generateOfferContent(candidate, template, companySettings)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Offer Letter Preview</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto border rounded-md p-8 bg-white shadow-sm">
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
            className="prose max-w-none font-serif"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={onGenerate}>
            <Download className="mr-2 h-4 w-4" />
            Generate PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
