import { useState, useEffect } from "react"
import { useStore } from "@/store/useStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Save } from "lucide-react"

export default function Templates() {
  const { templates, addTemplate, updateTemplate } = useStore()
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{ name: string; content: string }>({
    name: "",
    content: "",
  })

  // Load template into form when selected
  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id)
    const template = templates.find((t) => t.id === id)
    if (template) {
      setEditForm({ name: template.name, content: template.content })
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
        setEditForm({ name: template.name, content: template.content })
      }
    }
  }, [templates, selectedTemplateId])

  const handleSave = () => {
    if (selectedTemplateId) {
      updateTemplate(selectedTemplateId, editForm.content)
    } else {
      addTemplate({ name: editForm.name, content: editForm.content })
      // Ideally we would select the new one, but for simplicity we just reset
      setEditForm({ name: "New Template", content: "" })
      setSelectedTemplateId(null)
    }
  }

  const handleNew = () => {
    setSelectedTemplateId(null)
    setEditForm({ name: "New Template", content: "" })
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
              <div className="font-medium">{template.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 h-full">
        <Card className="h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between border-b py-4">
            <CardTitle>
              {selectedTemplateId ? "Edit Template" : "New Template"}
            </CardTitle>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
          </CardHeader>
          <CardContent className="flex-1 space-y-4 p-6 flex flex-col">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2 flex-1 flex flex-col">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                className="flex-1 font-mono text-sm resize-none"
                value={editForm.content}
                onChange={(e) =>
                  setEditForm({ ...editForm, content: e.target.value })
                }
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
