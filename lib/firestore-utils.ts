import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  DocumentReference,
  QueryConstraint
} from 'firebase/firestore'
import { db } from './firebase'

// Generic Firestore operations

// Get all documents from a collection
export async function getAllDocuments(collectionName: string) {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName))
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error)
    throw error
  }
}

// Get documents with query constraints
export async function getDocuments(collectionName: string, ...constraints: QueryConstraint[]) {
  try {
    const q = query(collection(db, collectionName), ...constraints)
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error(`Error querying ${collectionName}:`, error)
    throw error
  }
}

// Get a single document by ID
export async function getDocument(collectionName: string, documentId: string) {
  try {
    const docRef = doc(db, collectionName, documentId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      }
    } else {
      return null
    }
  } catch (error) {
    console.error(`Error fetching document ${documentId} from ${collectionName}:`, error)
    throw error
  }
}

// Add a new document
export async function addDocument(collectionName: string, data: any) {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return {
      id: docRef.id,
      ...data
    }
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error)
    throw error
  }
}

// Update a document
export async function updateDocument(collectionName: string, documentId: string, data: any) {
  try {
    const docRef = doc(db, collectionName, documentId)
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    })
    return {
      id: documentId,
      ...data
    }
  } catch (error) {
    console.error(`Error updating document ${documentId} in ${collectionName}:`, error)
    throw error
  }
}

// Delete a document
export async function deleteDocument(collectionName: string, documentId: string) {
  try {
    await deleteDoc(doc(db, collectionName, documentId))
    return { id: documentId }
  } catch (error) {
    console.error(`Error deleting document ${documentId} from ${collectionName}:`, error)
    throw error
  }
}

// Specific operations for the app

// Stadiums
export const stadiumsOperations = {
  getAll: () => getAllDocuments('stadiums'),
  getById: (id: string) => getDocument('stadiums', id),
  create: (data: { name: string; sport_id: string; enabled?: boolean }) => 
    addDocument('stadiums', { ...data, enabled: data.enabled ?? true }),
  update: (id: string, data: any) => updateDocument('stadiums', id, data),
  delete: (id: string) => deleteDocument('stadiums', id),
}

// Time Slots
export const timeSlotsOperations = {
  getAll: () => getAllDocuments('timeSlots'),
  getById: (id: string) => getDocument('timeSlots', id),
  create: (data: { time: string; period: string; enabled?: boolean }) => 
    addDocument('timeSlots', { ...data, enabled: data.enabled ?? true }),
  update: (id: string, data: any) => updateDocument('timeSlots', id, data),
  delete: (id: string) => deleteDocument('timeSlots', id),
  findByTimeAndPeriod: (time: string, period: string) => 
    getDocuments('timeSlots', where('time', '==', time), where('period', '==', period))
}

// Bookings
export const bookingsOperations = {
  getAll: () => getAllDocuments('bookings'),
  getById: (id: string) => getDocument('bookings', id),
  create: (data: { user_id: string; stadium_id: string; date: string; time_slot_id: string }) => 
    addDocument('bookings', data),
  update: (id: string, data: any) => updateDocument('bookings', id, data),
  delete: (id: string) => deleteDocument('bookings', id),
  findByStadiumDateAndTimeSlot: (stadiumId: string, date: string, timeSlotId: string) =>
    getDocuments('bookings', 
      where('stadium_id', '==', stadiumId),
      where('date', '==', date),
      where('time_slot_id', '==', timeSlotId)
    ),
  getByUserId: (userId: string) =>
    getDocuments('bookings', where('user_id', '==', userId), orderBy('date', 'desc'))
}

// Users/Profiles
export const usersOperations = {
  getAll: () => getAllDocuments('users'),
  getById: (id: string) => getDocument('users', id),
  create: (data: any) => addDocument('users', data),
  update: (id: string, data: any) => updateDocument('users', id, data),
  delete: (id: string) => deleteDocument('users', id),
  findByUsername: (username: string) => 
    getDocuments('users', where('username', '==', username))
} 