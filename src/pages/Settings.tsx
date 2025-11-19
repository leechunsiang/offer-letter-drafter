import { useState, useEffect } from "react"
import { useStore } from "@/store/useStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Save, Upload } from "lucide-react"

export default function Settings() {
  const { companySettings, updateCompanySettings } = useStore()
  const [formData, setFormData] = useState(companySettings)

  useEffect(() => {
    setFormData(companySettings)
  }, [companySettings])

  const handleChange = (section: keyof typeof formData, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log("Logo file selected:", file.name, file.type, file.size);
      
      if (file.size > 2 * 1024 * 1024) {
        alert("File size exceeds 2MB limit.");
        return;
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        console.log("Logo converted to base64, length:", base64String.length);
        setFormData((prev) => ({
          ...prev,
          branding: {
            ...prev.branding,
            logoUrl: base64String,
          },
        }))
      }
      reader.readAsDataURL(file)
    }
  }



  const handleSave = async () => {
    try {
      await updateCompanySettings(formData)
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings. Please try again.')
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            General information about your company used in documents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.info.name}
                onChange={(e) => handleChange("info", "name", e.target.value)}
                placeholder="Acme Corp"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.info.website}
                onChange={(e) => handleChange("info", "website", e.target.value)}
                placeholder="https://acme.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.info.phone}
                onChange={(e) => handleChange("info", "phone", e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.info.address}
                onChange={(e) => handleChange("info", "address", e.target.value)}
                placeholder="123 Business St, Suite 100, City, State"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>
            Manage your company logo and brand colors.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Company Logo</Label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-lg border border-dashed flex items-center justify-center overflow-hidden bg-muted">
                  {formData.branding.logoUrl ? (
                    <img
                      src={formData.branding.logoUrl}
                      alt="Company Logo"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground text-center p-2">No Logo</span>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <Label htmlFor="logo-upload" className="cursor-pointer inline-block">
                    <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground">
                      <Upload className="h-4 w-4" />
                      <span>Upload Logo</span>
                    </div>
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </Label>

                  <p className="text-xs text-muted-foreground mt-2">
                    Recommended size: 200x200px. Max size: 2MB.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={formData.branding.primaryColor}
                  onChange={(e) => handleChange("branding", "primaryColor", e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={formData.branding.primaryColor}
                  onChange={(e) => handleChange("branding", "primaryColor", e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Configuration</CardTitle>
          <CardDescription>
            Set up the sender details for your offer letters.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="senderName">Sender Name</Label>
              <Input
                id="senderName"
                value={formData.emailConfig.senderName}
                onChange={(e) => handleChange("emailConfig", "senderName", e.target.value)}
                placeholder="HR Department"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senderEmail">Sender Email</Label>
              <Input
                id="senderEmail"
                type="email"
                value={formData.emailConfig.senderEmail}
                onChange={(e) => handleChange("emailConfig", "senderEmail", e.target.value)}
                placeholder="hr@acme.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
