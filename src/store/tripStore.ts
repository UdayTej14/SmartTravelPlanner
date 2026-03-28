import { create } from "zustand";
import type { Trip } from "@/types";

interface TripStore {
  trips: Trip[];
  currentTrip: Trip | null;
  isGenerating: boolean;
  setTrips: (trips: Trip[]) => void;
  addTrip: (trip: Trip) => void;
  removeTrip: (tripId: string) => void;
  setCurrentTrip: (trip: Trip | null) => void;
  setIsGenerating: (value: boolean) => void;
}

export const useTripStore = create<TripStore>((set) => ({
  trips: [],
  currentTrip: null,
  isGenerating: false,
  setTrips: (trips) => set({ trips }),
  addTrip: (trip) => set((state) => ({ trips: [trip, ...state.trips] })),
  removeTrip: (tripId) =>
    set((state) => ({ trips: state.trips.filter((t) => t.id !== tripId) })),
  setCurrentTrip: (trip) => set({ currentTrip: trip }),
  setIsGenerating: (value) => set({ isGenerating: value }),
}));
