import { create } from 'zustand';
import { checkRentalAvailability } from '../services/rentalService.js';
import { fetchBranchInventory } from '../services/productService.js';

const useInventoryStore = create((set) => ({
  branchInventory: null,
  lastAvailability: null,
  loading: false,

  loadBranchInventory: async (params) => {
    set({ loading: true });
    try {
      const res = await fetchBranchInventory(params);
      const data = res.data.data;
      set({ branchInventory: data, loading: false });
      return data;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  checkWindow: async (payload) => {
    set({ loading: true });
    try {
      const res = await checkRentalAvailability(payload);
      const lastAvailability = res.data.data;
      set({ lastAvailability, loading: false });
      return lastAvailability;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  clearAvailability: () => set({ lastAvailability: null }),
}));

export default useInventoryStore;
