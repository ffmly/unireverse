import { NextResponse } from "next/server"
import { bookingsOperations, stadiumsOperations, timeSlotsOperations, usersOperations } from "@/lib/firestore-utils"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    // Get bookings - either all or filtered by user
    const bookings = userId 
      ? await bookingsOperations.getByUserId(userId)
      : await bookingsOperations.getAll()
    
    // For each booking, get the stadium, time slot, and user details
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking: any) => {
        const [stadium, timeSlot] = await Promise.all([
          stadiumsOperations.getById(booking.stadium_id),
          timeSlotsOperations.getById(booking.time_slot_id)
        ])
        
        // Try to find user by Firebase Auth UID first
        let user = null
        try {
          user = await usersOperations.getById(booking.user_id)
        } catch (error) {
          // If not found by ID, this might be a Firebase Auth UID that doesn't have a corresponding Firestore document
          // Create a basic user document for this Firebase Auth UID
          console.log(`Creating missing user document for ID: ${booking.user_id}`)
          try {
            const userDocRef = doc(db, 'users', booking.user_id)
            await setDoc(userDocRef, {
              username: `user_${booking.user_id.substring(0, 8)}`,
              email: `user_${booking.user_id.substring(0, 8)}@university.edu`,
              role: 'club',
              clubName: `Club ${booking.user_id.substring(0, 8)}`,
              department: 'Unknown',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            })
            console.log(`Successfully created user document for ID: ${booking.user_id}`)
            // Try to get the user again
            user = await usersOperations.getById(booking.user_id)
            console.log(`Successfully retrieved user: ${user ? 'yes' : 'no'}`)
          } catch (createError) {
            console.error(`Failed to create user document for ${booking.user_id}:`, createError)
          }
        }
        
        return {
          ...booking,
          stadiums: stadium ? { name: (stadium as any).name, sport_id: (stadium as any).sport_id } : null,
          time_slots: timeSlot ? { time: (timeSlot as any).time, period: (timeSlot as any).period } : null,
          user: user ? { 
            username: (user as any).username, 
            clubName: (user as any).clubName,
            email: (user as any).email,
            role: (user as any).role
          } : null
        }
      })
    )

    return NextResponse.json(enrichedBookings)
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId, stadiumId, date, timeSlotId } = await request.json()

    // Check if booking already exists
    const existingBookings = await bookingsOperations.findByStadiumDateAndTimeSlot(
      stadiumId, 
      date, 
      timeSlotId
    )

    if (existingBookings.length > 0) {
      return NextResponse.json({ error: "This time slot is already booked for this stadium" }, { status: 400 })
    }

    // Create new booking
    const data = await bookingsOperations.create({
      user_id: userId,
      stadium_id: stadiumId,
      date,
      time_slot_id: timeSlotId
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
