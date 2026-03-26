import { useState, useEffect } from "react";
import useShelterStore from "../store/useStoreShelter";

export function useUserLocation() {
  const [myPosition, setMyPosition] = useState([32.0853, 34.7818]);
  const [loading, setLoading] = useState(true);
  const { findShelter } = useShelterStore();

  useEffect(() => {
    let isPageActive = true;

    const success = async ({ coords }) => {
      if (!isPageActive) return;
      const newPos = [coords.latitude, coords.longitude];
      setMyPosition(newPos);
      await findShelter({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      setLoading(false);
    };

    const error = (err) => {
      console.error("GPS error:", err.message);
      setLoading(false);
    };

    const watcherId = navigator.geolocation.watchPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    return () => {
      isPageActive = false;
      navigator.geolocation.clearWatch(watcherId);
    };
  }, [findShelter]);

  return { myPosition, loading };
}