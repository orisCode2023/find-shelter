import { create } from "zustand";
// import { fetchAllShelters } from "../api/apiRequest.js";

const useShelterStore = create((set) => ({
  shelters: [],
  error: null,

  loadShelters: async () => {
    set({error: null });
    try {
      const res = await fetch('http://localhost:3000/shelters', {
        cache: 'no-cache'
      });
      set({ shelters: await res.json() });
    } catch (err) {
      set({ error: err.message});
    }
  },
}));

export default useShelterStore