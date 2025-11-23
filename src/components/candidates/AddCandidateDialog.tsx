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
} from "@/components/ui/dialog"

interface AddCandidateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddCandidateDialog({ open, onOpenChange, onSuccess }: AddCandidateDialogProps) {
  const { addCandidate } = useStore()
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
      setFormData({
        name: "",
        email: "",
        role: "",
        offerDate: new Date().toISOString().split("T")[0],
      })
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Failed to add candidate:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
  )
}
