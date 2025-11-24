import { useState, useEffect } from "react"
import { useStore } from "@/store/useStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import RichTextEditor from "@/components/RichTextEditor"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Save, Trash2, Star } from "lucide-react"

import { useToast } from "@/contexts/ToastContext"
import { useTeam } from "@/contexts/TeamContext"

export default function Templates() {
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useStore()
  const { showToast } = useToast()
  const { currentTeam } = useTeam()
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{ name: string; content: string }>({
    name: "",
    content: "",
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
        content: template.content
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
          content: template.content
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
      if (!currentTeam) {
        showToast("No team selected", "error")
        return
      }

      if (selectedTemplateId && selectedTemplateId !== 'new') {
        await updateTemplate(selectedTemplateId, {
          name: editForm.name,
          content: editForm.content
        }, currentTeam.id)
        showToast('Template updated successfully!', 'success')
      } else {
        await addTemplate({ 
          name: editForm.name, 
          content: editForm.content,
          isDefault: false
        }, currentTeam.id)
        // After creating, we can either stay on the new one (if we get ID back) or reset
        // For now, let's reset to "New" state to allow adding another, or maybe select the new one?
        // The store updates `templates`, so the useEffect might pick it up if we set to null.
        // But let's just reset form for now.
        setEditForm({ name: "New Template", content: "" })
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
      setEditForm({ name: "New Template", content: "" })
    } catch (error) {
      console.error('Failed to delete template:', error)
      showToast('Failed to delete template. Please try again.', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleNew = () => {
    setSelectedTemplateId('new')
    setEditForm({ name: "New Template", content: "" })
  }

  const handleSetDefault = async (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const template = templates.find((t) => t.id === templateId)
    if (!template) return

    try {
      // Toggle the default status
      const newDefaultStatus = !template.isDefault
      await updateTemplate(templateId, { isDefault: newDefaultStatus })
      
      if (newDefaultStatus) {
        showToast('Default template updated successfully', 'success')
      } else {
        showToast('Template unmarked as default', 'success')
      }
    } catch (error) {
      console.error('Failed to set default template:', error)
      showToast('Failed to set default template. Please try again.', 'error')
    }
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      <div className="w-80 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Templates</h2>
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
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium">{template.name}</span>
                <button
                  onClick={(e) => handleSetDefault(template.id, e)}
                  className={`flex-shrink-0 p-1 rounded transition-colors ${
                    template.isDefault 
                      ? "text-yellow-500 hover:text-yellow-600" 
                      : "text-muted-foreground hover:text-yellow-500"
                  }`}
                  title={template.isDefault ? "Default template" : "Set as default"}
                >
                  <Star className={`h-4 w-4 ${template.isDefault ? "fill-current" : ""}`} />
                </button>
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
