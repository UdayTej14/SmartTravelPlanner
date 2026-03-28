import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Trip } from "@/types";

const TRIPS_COLLECTION = "trips";

export async function saveTrip(userId: string, trip: Omit<Trip, "id" | "createdAt">): Promise<string> {
  const docRef = await addDoc(collection(db, TRIPS_COLLECTION), {
    ...trip,
    userId,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getUserTrips(userId: string): Promise<Trip[]> {
  const q = query(
    collection(db, TRIPS_COLLECTION),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  const trips = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  })) as Trip[];

  // Sort newest first client-side (avoids needing a Firestore composite index)
  return trips.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getTripById(tripId: string): Promise<Trip | null> {
  const docRef = doc(db, TRIPS_COLLECTION, tripId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return {
    id: snapshot.id,
    ...snapshot.data(),
    createdAt: snapshot.data().createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  } as Trip;
}

export async function updateTrip(tripId: string, data: Partial<Trip>): Promise<void> {
  const docRef = doc(db, TRIPS_COLLECTION, tripId);
  await updateDoc(docRef, { ...data });
}

export async function deleteTrip(tripId: string): Promise<void> {
  const docRef = doc(db, TRIPS_COLLECTION, tripId);
  await deleteDoc(docRef);
}
