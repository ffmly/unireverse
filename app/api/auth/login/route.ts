import { NextResponse } from "next/server"
import { auth } from "@/lib/firebase"
import { signInWithEmailAndPassword } from "firebase/auth"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    
    if (!username || !password) {
      return NextResponse.json({ 
        error: "Username and password are required" 
      }, { status: 400 })
    }

    let email = username
    
    // If username doesn't contain @, we need to find the user's email from Firestore
    if (!username.includes('@')) {
      try {
        // Query Firestore to find user by username
        const usersRef = collection(db, 'users')
        const q = query(usersRef, where('username', '==', username))
        const querySnapshot = await getDocs(q)
        
        if (!querySnapshot.empty) {
          // Found user, get their email
          const userDoc = querySnapshot.docs[0]
          email = userDoc.data().email
        } else {
          // User not found, try the default domain
          email = `${username}@university.edu`
        }
      } catch (error) {
        console.error('Error finding user email:', error)
        // Fallback to default domain
        email = `${username}@university.edu`
      }
    }

    // Try to sign in with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    
    return NextResponse.json({ 
      success: true, 
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email
      }
    })
  } catch (error: any) {
    console.error("Login error:", error)
    
    // Handle specific Firebase errors
    if (error.code === 'auth/user-not-found') {
      return NextResponse.json({ 
        error: "User not found" 
      }, { status: 401 })
    }
    
    if (error.code === 'auth/wrong-password') {
      return NextResponse.json({ 
        error: "Wrong password" 
      }, { status: 401 })
    }
    
    if (error.code === 'auth/invalid-credential') {
      return NextResponse.json({ 
        error: "Invalid credentials" 
      }, { status: 401 })
    }
    
    return NextResponse.json({ 
      error: "Login failed" 
    }, { status: 500 })
  }
} 