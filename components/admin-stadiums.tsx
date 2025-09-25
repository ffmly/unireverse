"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Plus, Trash2, Power, PowerOff } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useLanguage } from "@/lib/language-context"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

interface Stadium {
  id: string
  name: string
  sportId: string
  enabled: boolean
}

export default function AdminStadiums() {
  const { t, language } = useLanguage()
  const [stadiums, setStadiums] = useState<Stadium[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedStadium, setSelectedStadium] = useState<Stadium | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    sportId: "",
    enabled: true,
  })

  useEffect(() => {
    const fetchStadiums = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/stadiums')
        if (!response.ok) {
          throw new Error("Failed to fetch stadiums")
        }

        const data = await response.json()
        
        // Transform data to match component format
        const transformedStadiums = data.map((stadium: any) => ({
          id: stadium.id,
          name: stadium.name,
          sportId: stadium.sport_id,
          enabled: stadium.enabled !== false
        }))

        setStadiums(transformedStadiums)
      } catch (error) {
        toast({
          title: language === "ar" ? "خطأ في تحميل الملاعب" : "Error loading stadiums",
          description:
            language === "ar"
              ? "حدث خطأ أثناء محاولة تحميل الملاعب. يرجى المحاولة مرة أخرى."
              : "An error occurred while trying to load stadiums. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStadiums()
  }, [language])

  const handleInputChange = (name: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddStadium = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.sportId) {
      toast({
        title: language === "ar" ? "خطأ في الإدخال" : "Input Error",
        description: language === "ar" 
          ? "يرجى ملء جميع الحقول المطلوبة" 
          : "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      // Create stadium in Firebase through our API
      const response = await fetch('/api/stadiums', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          sportId: formData.sportId,
          enabled: formData.enabled,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create stadium')
      }

      const newStadiumData = await response.json()
      
      // Add to local state
      const newStadium: Stadium = {
        id: newStadiumData.id,
        name: newStadiumData.name,
        sportId: newStadiumData.sport_id,
        enabled: newStadiumData.enabled !== false,
      }

      setStadiums([...stadiums, newStadium])
      setIsAddDialogOpen(false)
      setFormData({ name: "", sportId: "", enabled: true })

      toast({
        title: language === "ar" ? "تم إضافة الملعب" : "Stadium Added",
        description: language === "ar" ? "تم إضافة الملعب بنجاح" : "The stadium has been added successfully",
      })
    } catch (error) {
      console.error('Error creating stadium:', error)
      toast({
        title: language === "ar" ? "فشل إضافة الملعب" : "Failed to Add Stadium",
        description:
          language === "ar"
            ? "حدث خطأ أثناء محاولة إضافة الملعب. يرجى المحاولة مرة أخرى."
            : "An error occurred while trying to add the stadium. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditStadium = (stadium: Stadium) => {
    setSelectedStadium(stadium)
    setFormData({
      name: stadium.name,
      sportId: stadium.sportId,
      enabled: stadium.enabled,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateStadium = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedStadium) return

    try {
      // Update stadium in Firebase through our API
      const response = await fetch(`/api/stadiums/${selectedStadium.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          sport_id: formData.sportId,
          enabled: formData.enabled,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update stadium')
      }

      const updatedStadiumData = await response.json()
      
      // Update local state
      const updatedStadiums = stadiums.map((stadium) =>
        stadium.id === selectedStadium.id
          ? {
              ...stadium,
              name: formData.name,
              sportId: formData.sportId,
              enabled: formData.enabled,
            }
          : stadium,
      )

      setStadiums(updatedStadiums)
      setIsEditDialogOpen(false)
      setSelectedStadium(null)

      toast({
        title: language === "ar" ? "تم تحديث الملعب" : "Stadium Updated",
        description: language === "ar" ? "تم تحديث بيانات الملعب بنجاح" : "The stadium has been updated successfully",
      })
    } catch (error) {
      console.error('Error updating stadium:', error)
      toast({
        title: language === "ar" ? "فشل تحديث الملعب" : "Failed to Update Stadium",
        description:
          language === "ar"
            ? "حدث خطأ أثناء محاولة تحديث الملعب. يرجى المحاولة مرة أخرى."
            : "An error occurred while trying to update the stadium. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleToggleStadium = async (stadiumId: string, enabled: boolean) => {
    try {
      // Update stadium status in Firebase through our API
      const response = await fetch(`/api/stadiums/${stadiumId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled }),
      })

      if (!response.ok) {
        throw new Error('Failed to update stadium status')
      }

      const updatedStadiums = stadiums.map((stadium) => (stadium.id === stadiumId ? { ...stadium, enabled } : stadium))

      setStadiums(updatedStadiums)

      toast({
        title: enabled
          ? language === "ar"
            ? "تم تفعيل الملعب"
            : "Stadium Enabled"
          : language === "ar"
            ? "تم تعطيل الملعب"
            : "Stadium Disabled",
        description: enabled
          ? language === "ar"
            ? "تم تفعيل الملعب بنجاح"
            : "The stadium has been enabled successfully"
          : language === "ar"
            ? "تم تعطيل الملعب بنجاح"
            : "The stadium has been disabled successfully",
      })
    } catch (error) {
      console.error('Error toggling stadium:', error)
      toast({
        title: language === "ar" ? "فشل تغيير حالة الملعب" : "Failed to Change Stadium Status",
        description:
          language === "ar"
            ? "حدث خطأ أثناء محاولة تغيير حالة الملعب. يرجى المحاولة مرة أخرى."
            : "An error occurred while trying to change the stadium status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteStadium = async (stadiumId: string) => {
    if (
      !confirm(
        language === "ar"
          ? "هل أنت متأكد من رغبتك في حذف هذا الملعب؟"
          : "Are you sure you want to delete this stadium?",
      )
    )
      return

    try {
      // Delete stadium from Firebase through our API
      const response = await fetch(`/api/stadiums/${stadiumId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete stadium')
      }

      setStadiums(stadiums.filter((stadium) => stadium.id !== stadiumId))

      toast({
        title: language === "ar" ? "تم حذف الملعب" : "Stadium Deleted",
        description: language === "ar" ? "تم حذف الملعب بنجاح" : "The stadium has been deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting stadium:', error)
      toast({
        title: language === "ar" ? "فشل حذف الملعب" : "Failed to Delete Stadium",
        description:
          language === "ar"
            ? "حدث خطأ أثناء محاولة حذف الملعب. يرجى المحاولة مرة أخرى."
            : "An error occurred while trying to delete the stadium. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex justify-between">
        <h2 className="text-xl font-semibold">{t("stadiums.manage")}</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("stadiums.add")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("stadiums.add")}</DialogTitle>
              <DialogDescription>
                {language === "ar" ? "أدخل بيانات الملعب الجديد." : "Enter the details of the new stadium."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddStadium}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("stadiums.name")}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sportId">{t("stadiums.sport")}</Label>
                  <Select
                    value={formData.sportId}
                    onValueChange={(value) => handleInputChange("sportId", value)}
                    required
                  >
                    <SelectTrigger id="sportId">
                      <SelectValue placeholder={language === "ar" ? "اختر الرياضة" : "Select sport"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tennis">{t("sports.tennis")}</SelectItem>
                      <SelectItem value="handball">{t("sports.handball")}</SelectItem>
                      <SelectItem value="football">{t("sports.football")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enabled"
                    checked={formData.enabled}
                    onCheckedChange={(checked) => handleInputChange("enabled", checked)}
                  />
                  <Label htmlFor="enabled">{t("stadiums.status")}</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{language === "ar" ? "إضافة الملعب" : "Add Stadium"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("stadiums.name")}</TableHead>
                <TableHead>{t("stadiums.sport")}</TableHead>
                <TableHead>{t("stadiums.status")}</TableHead>
                <TableHead className="w-[150px]">{t("stadiums.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stadiums.map((stadium) => (
                <TableRow key={stadium.id}>
                  <TableCell className="font-medium">{stadium.name}</TableCell>
                  <TableCell>{t(`sports.${stadium.sportId}`)}</TableCell>
                  <TableCell>
                    {stadium.enabled ? (
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                      >
                        {t("stadiums.enabled")}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                        {t("stadiums.disabled")}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStadium(stadium.id, !stadium.enabled)}
                        title={stadium.enabled ? t("stadiums.disable") : t("stadiums.enable")}
                      >
                        {stadium.enabled ? (
                          <PowerOff className="h-4 w-4 text-red-500" />
                        ) : (
                          <Power className="h-4 w-4 text-green-500" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditStadium(stadium)}
                        title={t("stadiums.edit")}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteStadium(stadium.id)}
                        title={t("stadiums.delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === "ar" ? "تعديل بيانات الملعب" : "Edit Stadium"}</DialogTitle>
            <DialogDescription>
              {language === "ar" ? "قم بتعديل بيانات الملعب." : "Edit the stadium details."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateStadium}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">{t("stadiums.name")}</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sportId">{t("stadiums.sport")}</Label>
                <Select
                  value={formData.sportId}
                  onValueChange={(value) => handleInputChange("sportId", value)}
                  required
                >
                  <SelectTrigger id="edit-sportId">
                    <SelectValue placeholder={language === "ar" ? "اختر الرياضة" : "Select sport"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tennis">{t("sports.tennis")}</SelectItem>
                    <SelectItem value="handball">{t("sports.handball")}</SelectItem>
                    <SelectItem value="football">{t("sports.football")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-enabled"
                  checked={formData.enabled}
                  onCheckedChange={(checked) => handleInputChange("enabled", checked)}
                />
                <Label htmlFor="edit-enabled">{t("stadiums.status")}</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{language === "ar" ? "حفظ التغييرات" : "Save Changes"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
