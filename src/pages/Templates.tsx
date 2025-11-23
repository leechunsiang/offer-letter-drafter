import { useState, useEffect } from "react"
import { useStore } from "@/store/useStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import RichTextEditor from "@/components/RichTextEditor"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Save, Trash2 } from "lucide-react"

import { useToast } from "@/contexts/ToastContext"

export default function Templates() {
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useStore()
  const { showToast } = useToast()
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{ name: string; content: string; isDefault: boolean }>({
    name: "",
    content: "",
    isDefault: false,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Load template into form when selected
  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id)
    const template = templates.find((t) => t.id === id)
    if (template) {
      setEditForm({ 
        name: template.name, 
        content: template.content,
        isDefault: template.isDefault || false
      })
    }
  }

  // Initialize selection
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplateId) {
      // We can safely call this here as it will only happen once when no template is selected
      const id = templates[0].id
      setSelectedTemplateId(id)
      const template = templates.find((t) => t.id === id)
      if (template) {
        setEditForm({ 
          name: template.name, 
          content: template.content,
          isDefault: template.isDefault || false
        })
      }
    }
  }, [templates, selectedTemplateId])

  const handleSave = async () => {
    if (!editForm.name.trim()) {
      showToast("Please enter a template name", "warning")
      return
    }

    // Basic validation for empty content (stripping HTML tags)
    const strippedContent = editForm.content.replace(/<[^>]*>/g, '').trim()
    if (!strippedContent) {
      showToast("Please enter content for the template", "warning")
      return
    }
    
    setIsSaving(true)
    try {
      if (selectedTemplateId && selectedTemplateId !== 'new') {
        await updateTemplate(selectedTemplateId, {
          name: editForm.name,
          content: editForm.content,
          isDefault: editForm.isDefault
        })
        showToast('Template updated successfully!', 'success')
      } else {
        await addTemplate({ 
          name: editForm.name, 
          content: editForm.content,
          isDefault: editForm.isDefault
        })
        // After creating, we can either stay on the new one (if we get ID back) or reset
        // For now, let's reset to "New" state to allow adding another, or maybe select the new one?
        // The store updates `templates`, so the useEffect might pick it up if we set to null.
        // But let's just reset form for now.
        setEditForm({ name: "New Template", content: "", isDefault: false })
        setSelectedTemplateId('new') 
        showToast('Template created successfully!', 'success')
      }
    } catch (error) {
      console.error('Failed to save template:', error)
      showToast('Failed to save template. Please try again.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedTemplateId || selectedTemplateId === 'new') return

    if (!window.confirm("Are you sure you want to delete this template?")) return

    setIsDeleting(true)
    try {
      await deleteTemplate(selectedTemplateId)
      showToast('Template deleted successfully', 'success')
      
      // Reset to new template state
      setSelectedTemplateId('new')
      setEditForm({ name: "New Template", content: "", isDefault: false })
    } catch (error) {
      console.error('Failed to delete template:', error)
      showToast('Failed to delete template. Please try again.', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleNew = () => {
    setSelectedTemplateId('new')
    setEditForm({ name: "New Template", content: "", isDefault: false })
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      <div className="w-64 flex-shrink-0 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Templates</h2>
          <Button size="sm" variant="outline" onClick={handleNew}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => handleSelectTemplate(template.id)}
              className={`cursor-pointer rounded-lg border p-3 transition-colors hover:bg-muted ${
                selectedTemplateId === template.id
                  ? "bg-muted border-primary"
                  : "bg-card"
              }`}
            >
              <div className="font-medium flex items-center justify-between">
                <span className="truncate">{template.name}</span>
                {template.isDefault && (
                  <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Default
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 h-full">
        <Card className="h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between border-b py-4">
            <CardTitle>
              {selectedTemplateId === 'new' || !selectedTemplateId ? "New Template" : "Edit Template"}
            </CardTitle>
            <div className="flex items-center gap-2">
              {selectedTemplateId && selectedTemplateId !== 'new' && (
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting || isSaving}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button onClick={handleSave} disabled={isSaving || isDeleting}>
                <Save className="mr-2 h-4 w-4" /> 
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-4 p-6 flex flex-col min-h-0">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={editForm.isDefault}
                  onChange={(e) =>
                    setEditForm({ ...editForm, isDefault: e.target.checked })
                  }
                />
                <Label htmlFor="isDefault" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Set as default template
                </Label>
              </div>
            </div>
            <div className="flex-1 flex flex-col min-h-0 gap-2">
              <Label htmlFor="content">Content</Label>
              <RichTextEditor
                value={editForm.content}
                onChange={(value) => setEditForm({ ...editForm, content: value })}
                placeholder="Enter your template content here. Use the toolbar to format text."
                className="flex-1"
              />
              <p className="text-xs text-muted-foreground">
                Available variables: {"{{name}}"}, {"{{role}}"}, {"{{offerDate}}"}, {"{{companyName}}"}, {"{{companyAddress}}"}, {"{{companyWebsite}}"}, {"{{companyPhone}}"}, {"{{senderName}}"}, {"{{senderEmail}}"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
