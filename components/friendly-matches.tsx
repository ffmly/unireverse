"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Calendar,
  Clock,
  ClubIcon as Football,
  HandIcon,
  ShoppingBasketIcon as Basketball,
  Users,
  Plus,
  Building,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useLanguage } from "@/lib/language-context"
import { Badge } from "@/components/ui/badge"
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

interface FriendlyMatch {
  id: string
  hostId: string
  hostName: string
  sportId: string
  date: string
  time: string
  status: "open" | "closed" | "confirmed"
  guestId?: string
  guestName?: string
}

export default function FriendlyMatches() {
  const [matches, setMatches] = useState<FriendlyMatch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { t, language } = useLanguage()

  // Form state
  const [formData, setFormData] = useState({
    sportId: "",
    date: "",
    time: "",
  })

  useEffect(() => {
    const fetchMatches = async () => {
      setIsLoading(true)
      try {
        // In a real implementation, fetch friendly matches from API
        // For now, show empty list
        setMatches([])
      } catch (error) {
        toast({
          title: language === "ar" ? "خطأ في تحميل المباريات" : "Error loading matches",
          description:
            language === "ar"
              ? "حدث خطأ أثناء محاولة تحميل المباريات الودية. يرجى المحاولة مرة أخرى."
              : "An error occurred while trying to load friendly matches. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMatches()
  }, [language])

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.sportId || !formData.date || !formData.time) {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const newMatch: FriendlyMatch = {
        id: Date.now().toString(),
        hostId: "1", // Current user's club ID
        hostName: "نادي أثلتيك يونايتد", // Current user's club name
        sportId: formData.sportId,
        date: formData.date,
        time: formData.time,
        status: "open",
      }

      setMatches([newMatch, ...matches])
      setIsCreateDialogOpen(false)
      setFormData({ sportId: "", date: "", time: "" })

      toast({
        title: language === "ar" ? "تم إنشاء المباراة" : "Match Created",
        description:
          language === "ar" ? "تم إنشاء المباراة الودية بنجاح" : "The friendly match has been created successfully",
      })
    } catch (error) {
      toast({
        title: language === "ar" ? "فشل إنشاء المباراة" : "Match Creation Failed",
        description:
          language === "ar"
            ? "حدث خطأ أثناء محاولة إنشاء المباراة الودية. يرجى المحاولة مرة أخرى."
            : "An error occurred while trying to create the friendly match. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleJoinMatch = async (matchId: string) => {
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setMatches(
        matches.map((match) =>
          match.id === matchId
            ? {
                ...match,
                status: "confirmed",
                guestId: "1", // Current user's club ID
                guestName: "نادي أثلتيك يونايتد", // Current user's club name
              }
            : match,
        ),
      )

      toast({
        title: language === "ar" ? "تم الانضمام للمباراة" : "Joined Match",
        description:
          language === "ar" ? "تم الانضمام للمباراة الودية بنجاح" : "You have successfully joined the friendly match",
      })
    } catch (error) {
      toast({
        title: language === "ar" ? "فشل الانضمام للمباراة" : "Join Failed",
        description:
          language === "ar"
            ? "حدث خطأ أثناء محاولة الانضمام للمباراة الودية. يرجى المحاولة مرة أخرى."
            : "An error occurred while trying to join the friendly match. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getSportIcon = (sportId: string) => {
    switch (sportId) {
      case "basketball":
        return <Basketball className="h-5 w-5 text-orange-500" />
      case "handball":
        return <HandIcon className="h-5 w-5 text-purple-500" />
      case "football":
        return <Football className="h-5 w-5 text-blue-500" />
      default:
        return <Basketball className="h-5 w-5" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
            {t("friendlyMatches.open")}
          </Badge>
        )
      case "closed":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
            {t("friendlyMatches.closed")}
          </Badge>
        )
      case "confirmed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            {t("friendlyMatches.confirmed")}
          </Badge>
        )
      default:
        return null
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{t("friendlyMatches.title")}</h2>
          <p className="text-muted-foreground">{t("friendlyMatches.description")}</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("friendlyMatches.create")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("friendlyMatches.create")}</DialogTitle>
              <DialogDescription>
                {language === "ar"
                  ? "أدخل تفاصيل المباراة الودية التي ترغب في إنشائها."
                  : "Enter the details of the friendly match you want to create."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateMatch}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="sportId">{t("friendlyMatches.sport")}</Label>
                  <Select
                    value={formData.sportId}
                    onValueChange={(value) => handleInputChange("sportId", value)}
                    required
                  >
                    <SelectTrigger id="sportId">
                      <SelectValue placeholder={language === "ar" ? "اختر الرياضة" : "Select sport"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basketball">{t("sports.basketball")}</SelectItem>
                      <SelectItem value="handball">{t("sports.handball")}</SelectItem>
                      <SelectItem value="football">{t("sports.football")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">{t("friendlyMatches.date")}</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">{t("friendlyMatches.time")}</Label>
                  <Select value={formData.time} onValueChange={(value) => handleInputChange("time", value)} required>
                    <SelectTrigger id="time">
                      <SelectValue placeholder={language === "ar" ? "اختر الوقت" : "Select time"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="08:00">08:00</SelectItem>
                      <SelectItem value="14:00">14:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{language === "ar" ? "إنشاء المباراة" : "Create Match"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {matches.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <Users className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-xl font-medium">{t("friendlyMatches.noMatches")}</h3>
          <p className="text-muted-foreground">{t("friendlyMatches.noMatchesDesc")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <Card key={match.id} className="overflow-hidden">
              <div className="bg-gradient-to-r from-primary/20 to-transparent h-2" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getSportIcon(match.sportId)}
                    {t(`sports.${match.sportId}`)}
                  </div>
                  {getStatusBadge(match.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{match.hostName}</span>
                    <span className="text-xs text-muted-foreground">{language === "ar" ? "(مضيف)" : "(Host)"}</span>
                  </div>

                  {match.guestName && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{match.guestName}</span>
                      <span className="text-xs text-muted-foreground">{language === "ar" ? "(ضيف)" : "(Guest)"}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(match.date), "EEEE d MMMM yyyy", { locale: language === "ar" ? ar : undefined })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{match.time}</span>
                  </div>
                </div>
              </CardContent>

              {match.status === "open" && match.hostId !== "1" && (
                <CardFooter>
                  <Button className="w-full" onClick={() => handleJoinMatch(match.id)}>
                    {t("friendlyMatches.join")}
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
