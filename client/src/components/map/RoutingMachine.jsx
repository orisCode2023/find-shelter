import L from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

function RoutingMachine({ from, to }) {
  const map = useMap();

  useEffect(() => {
    if (!from || !to || !L.Routing) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(from[0], from[1]),
        L.latLng(to.lat, to.lon),
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      createMarker: () => null,
      lineOptions: {
        styles: [{ color: "#e63946", weight: 5 }],
      },
    }).addTo(map);

    // ✅ safely remove control without crashing
    return () => {
      try {
        map.removeControl(routingControl);
      } catch (e) {
        // ignore cleanup errors
      }
    };
  }, [from, to, map]);

  return null;
}

export default RoutingMachine;