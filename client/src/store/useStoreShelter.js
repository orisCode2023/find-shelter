import { create } from "zustand";
import { requestPost } from "../api/apiRequest.js";

const useShelterStore = create((set) => ({
  shelters: [],

  loadShelters: async () => {
    try {
      const res = await fetch("http://localhost:3000/shelters", {
        cache: "no-cache",
      });
      set({ shelters: await res.json() });
    } catch (err) {
      console.log(console.error(err.message));
    }
  },
  findShelter: async (userLocation) => {
    try {
      const res = await requestPost('/nearby', {
        lat: userLocation.latitude,
        lon: userLocation.longitude,
      });
      set({ shelters: res });
    } catch (error) {
      console.log(console.error(error.message));
    }
  },
}));

export default useShelterStore;
