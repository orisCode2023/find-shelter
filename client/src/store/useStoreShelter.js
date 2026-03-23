import { create } from "zustand";
import { fetchAllShelters } from "../api/apiRequest.js";

const useShelterStore = create((set) => ({
  shelters: [],
  loading: false,
  error: null,

  loadShelters: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchAllShelters();
      set({ shelters: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
}));

export default useShelterStore