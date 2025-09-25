"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Sun, Moon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import Image from "next/image"

// Types
type Sport = "basketball" | "handball" | "football"
type TimeOfDay = "morning" | "afternoon"

interface TimeSlot {
  id: string
  time: string
  period: TimeOfDay
  enabled: boolean
}

interface Stadium {
  id: string
  name: string
  sport_id: Sport
  enabled: boolean
}

interface BookingCalendarProps {
  userId: string
}

export default function BookingCalendar({ userId }: BookingCalendarProps) {
  const { t, language } = useLanguage()
  const { user } = useAuth()
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<string | null>(null)
  const [selectedStadium, setSelectedStadium] = useState<string | null>(null)
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [availableTimeSlots, setAvailableTimeSlots] = useState<{
    morning: TimeSlot[]
    afternoon: TimeSlot[]
  }>({
    morning: [],
    afternoon: [],
  })
  const [availableStadiums, setAvailableStadiums] = useState<Stadium[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Sports configuration
  const sports: { id: Sport; name: string; imageSrc: string }[] = [
    {
      id: "basketball",
      name: t("sports.basketball"),
      imageSrc: "/placeholder.svg",
    },
    {
      id: "handball",
      name: t("sports.handball"),
      imageSrc: "/placeholder.svg",
    },
    {
      id: "football",
      name: t("sports.football"),
      imageSrc: "/placeholder.svg",
    },
  ]

  // Generate dates for the next 4 days
  useEffect(() => {
    const dates = []
    const today = new Date()

    for (let i = 0; i < 4; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(format(date, "yyyy-MM-dd"))
    }

    setAvailableDates(dates)
  }, [])

  // When sport and date are selected, fetch available time slots
  useEffect(() => {
    if (selectedSport && selectedDate) {
      const fetchTimeSlots = async () => {
        try {
          const response = await fetch("/api/time-slots")
          if (!response.ok) {
            throw new Error("Failed to fetch time slots")
          }

          const data = await response.json()

          // Organize by period
          const morning: TimeSlot[] = []
          const afternoon: TimeSlot[] = []

          data.forEach((slot: TimeSlot) => {
            if (slot.period === "morning") {
              morning.push(slot)
            } else {
              afternoon.push(slot)
            }
          })

          setAvailableTimeSlots({ morning, afternoon })
        } catch (error) {
          console.error("Error fetching time slots:", error)
          toast({
            title: language === "ar" ? "خطأ في تحميل أوقات الحجز" : "Error loading time slots",
            description:
              language === "ar"
                ? "حدث خطأ أثناء محاولة تحميل أوقات الحجز. يرجى المحاولة مرة أخرى."
                : "An error occurred while trying to load time slots. Please try again.",
            variant: "destructive",
          })
        }
      }

      const fetchStadiums = async () => {
        try {
          const response = await fetch("/api/stadiums")
          if (!response.ok) {
            throw new Error("Failed to fetch stadiums")
          }

          const data = await response.json()

          // Filter by selected sport
          const filteredStadiums = data.filter((stadium: Stadium) => stadium.sport_id === selectedSport)

          setAvailableStadiums(filteredStadiums)
        } catch (error) {
          console.error("Error fetching stadiums:", error)
          toast({
            title: language === "ar" ? "خطأ في تحميل الملاعب" : "Error loading stadiums",
            description:
              language === "ar"
                ? "حدث خطأ أثناء محاولة تحميل الملاعب. يرجى المحاولة مرة أخرى."
                : "An error occurred while trying to load stadiums. Please try again.",
            variant: "destructive",
          })
        }
      }

      fetchTimeSlots()
      fetchStadiums()
    }
  }, [selectedSport, selectedDate, language])

  const handleBooking = async () => {
    if (!user || !selectedSport || !selectedDate || !selectedTimeSlotId || !selectedStadium) {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description:
          language === "ar"
            ? "يرجى اختيار الرياضة والتاريخ والوقت والملعب"
            : "Please select sport, date, time and stadium",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          stadiumId: selectedStadium,
          date: selectedDate,
          timeSlotId: selectedTimeSlotId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create booking")
      }

      const stadium = availableStadiums.find((s) => s.id === selectedStadium)

      toast({
        title: language === "ar" ? "تم الحجز بنجاح" : "Booking Successful",
        description:
          language === "ar"
            ? `تم حجز ${stadium?.name} يوم ${format(new Date(selectedDate), "EEEE d MMMM", { locale: ar })} الساعة ${selectedTime}`
            : `Booked ${stadium?.name} on ${format(new Date(selectedDate), "EEEE, MMMM d")} at ${selectedTime}`,
      })

      // Reset selections
      setSelectedTime(null)
      setSelectedTimeSlotId(null)
      setSelectedStadium(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"

      toast({
        title: language === "ar" ? "فشل الحجز" : "Booking Failed",
        description:
          language === "ar"
            ? `حدث خطأ أثناء محاولة الحجز: ${errorMessage}`
            : `An error occurred while trying to book: ${errorMessage}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDay = (dateString: string) => {
    const date = new Date(dateString)
    const dayName = format(date, "EEE", { locale: language === "ar" ? ar : undefined })
    const dayNumber = format(date, "d")
    return { dayName, dayNumber }
  }

  // Get the current selected sport for the header icon
  const getCurrentSportImage = () => {
    if (!selectedSport) return null
    const sport = sports.find((s) => s.id === selectedSport)
    return sport?.imageSrc
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
            {selectedSport ? (
              <div className="h-5 w-5 relative">
                <Image
                  src={getCurrentSportImage() || "/images/basketball.png"}
                  alt={selectedSport}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <Calendar className="h-5 w-5 text-primary" />
            )}
          </div>
          <h2 className="text-xl font-semibold">{t("booking.chooseSport")}</h2>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {sports.map((sport) => (
            <Card
              key={sport.id}
              className={cn(
                "cursor-pointer transition-all hover:bg-primary/5",
                selectedSport === sport.id ? "bg-primary text-primary-foreground" : "bg-primary/10",
              )}
              onClick={() => setSelectedSport(sport.id)}
            >
              <CardContent className="flex flex-col items-center justify-center p-4">
                <div className="relative h-16 w-16">
                  <Image src={sport.imageSrc || "/placeholder.svg"} alt={sport.name} fill className="object-contain" />
                </div>
                <span className="mt-2 text-center">{sport.name}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {selectedSport && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">{t("booking.chooseDate")}</h2>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {availableDates.map((date) => {
              const { dayName, dayNumber } = formatDay(date)
              return (
                <Button
                  key={date}
                  variant={selectedDate === date ? "default" : "outline"}
                  className="flex h-auto flex-col py-3"
                  onClick={() => setSelectedDate(date)}
                >
                  <span>{dayName}</span>
                  <span className="text-2xl font-bold">{dayNumber}</span>
                </Button>
              )
            })}
          </div>
        </section>
      )}

      {selectedSport && selectedDate && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">{t("booking.timeSlots")}</h2>

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sun className="h-5 w-5 text-amber-500" />
                <h3 className="font-medium">{t("booking.morning")}</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {availableTimeSlots.morning
                  .filter((slot) => slot.enabled)
                  .map((slot) => (
                    <Button
                      key={slot.id}
                      variant={selectedTimeSlotId === slot.id ? "default" : "outline"}
                      className="text-lg"
                      onClick={() => {
                        setSelectedTime(slot.time)
                        setSelectedTimeSlotId(slot.id)
                      }}
                    >
                      {slot.time}
                    </Button>
                  ))}
                {availableTimeSlots.morning.filter((slot) => slot.enabled).length === 0 && (
                  <div className="col-span-3 text-center py-2 text-muted-foreground">
                    {language === "ar" ? "لا توجد أوقات متاحة في الفترة الصباحية" : "No available morning time slots"}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Moon className="h-5 w-5 text-indigo-500" />
                <h3 className="font-medium">{t("booking.afternoon")}</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {availableTimeSlots.afternoon
                  .filter((slot) => slot.enabled)
                  .map((slot) => (
                    <Button
                      key={slot.id}
                      variant={selectedTimeSlotId === slot.id ? "default" : "outline"}
                      className="text-lg"
                      onClick={() => {
                        setSelectedTime(slot.time)
                        setSelectedTimeSlotId(slot.id)
                      }}
                    >
                      {slot.time}
                    </Button>
                  ))}
                {availableTimeSlots.afternoon.filter((slot) => slot.enabled).length === 0 && (
                  <div className="col-span-3 text-center py-2 text-muted-foreground">
                    {language === "ar"
                      ? "لا توجد أوقات متاحة في فترة ما بعد الظهر"
                      : "No available afternoon time slots"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {selectedSport && selectedDate && selectedTime && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">{language === "ar" ? "اختر الملعب" : "Select Stadium"}</h2>

          <div className="grid grid-cols-2 gap-4 mt-2">
            {availableStadiums.map((stadium) => (
              <Card
                key={stadium.id}
                className={cn(
                  "cursor-pointer transition-all hover:bg-primary/5",
                  selectedStadium === stadium.id ? "bg-primary text-primary-foreground" : "bg-primary/10",
                )}
                onClick={() => setSelectedStadium(stadium.id)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <span>{stadium.name}</span>
                  {stadium.enabled ? (
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                    >
                      {language === "ar" ? "متاح" : "Available"}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                      {language === "ar" ? "غير متاح" : "Unavailable"}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Button className="mt-8 w-full py-6 text-lg" disabled={!selectedStadium || isLoading} onClick={handleBooking}>
            {isLoading ? t("booking.booking") : t("booking.bookNow")}
          </Button>
        </section>
      )}
    </div>
  )
}
