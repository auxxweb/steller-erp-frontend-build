import { create } from 'zustand';
import {
  checkRentalAvailability,
  fetchRental,
  fetchRentalTimeline,
} from '../services/rentalService.js';

const useRentalWorkflowStore = create((set, get) => ({
  activeRentalId: null,
  rental: null,
  items: [],
  timeline: [],
  availability: null,
  scannedUnitIds: new Set(),
  loading: false,
  error: null,

  setActiveRental: (id) => set({ activeRentalId: id }),

  loadRental: async (id) => {
    set({ loading: true, error: null, activeRentalId: id });
    try {
      const res = await fetchRental(id);
      const { rental, items } = res.data.data;
      set({ rental, items, loading: false });
      return { rental, items };
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || 'Failed to load rental',
      });
      throw err;
    }
  },

  loadTimeline: async (id) => {
    const rentalId = id || get().activeRentalId;
    if (!rentalId) return [];
    const res = await fetchRentalTimeline(rentalId);
    const timeline = res.data.data.timeline || [];
    set({ timeline });
    return timeline;
  },

  checkAvailability: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await checkRentalAvailability(payload);
      const availability = res.data.data;
      set({ availability, loading: false });
      return availability;
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || 'Availability check failed',
      });
      throw err;
    }
  },

  markUnitScanned: (unitId) => {
    const next = new Set(get().scannedUnitIds);
    next.add(unitId);
    set({ scannedUnitIds: next });
  },

  clearScans: () => set({ scannedUnitIds: new Set() }),

  allUnitsScanned: () => {
    const { items, scannedUnitIds } = get();
    const required = items
      .filter((i) => i.productUnit?.id || i.productUnit)
      .map((i) => (i.productUnit?.id || i.productUnit).toString());
    if (!required.length) return true;
    return required.every((id) => scannedUnitIds.has(id));
  },

  reset: () =>
    set({
      activeRentalId: null,
      rental: null,
      items: [],
      timeline: [],
      availability: null,
      scannedUnitIds: new Set(),
      loading: false,
      error: null,
    }),
}));

export default useRentalWorkflowStore;
