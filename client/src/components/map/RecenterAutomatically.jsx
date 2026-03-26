import { useEffect } from "react";
import { useMap } from "react-leaflet";

function RecenterAutomatically({ position, isAutoCenter, setIsAutoCenter }) {
  const map = useMap();

  useEffect(() => {
    const onInteraction = () => setIsAutoCenter(false);
    map.on("dragstart", onInteraction);
    map.on("zoomstart", onInteraction);
    return () => {
      map.off("dragstart", onInteraction);
      map.off("zoomstart", onInteraction);
    };
  }, [map, setIsAutoCenter]);

  useEffect(() => {
    if (isAutoCenter && position) {
      map.flyTo(position, map.getZoom(), { animate: true, duration: 1.5 });
    }
  }, [position, map, isAutoCenter]);

  return null;
}

export default RecenterAutomatically;