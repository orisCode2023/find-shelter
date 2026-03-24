import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Loader2 } from "lucide-react";
import L from "leaflet";
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import useShelterStore from "../store/useStoreShelter.js";

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function RecenterAutomatically({ position }) {
    const map = useMap();
    useEffect(() => {
        map.setView(position);
    }, [position, map]);
    return null;
}

function MapPage() {
    const [myPosition, setMyPosition] = useState([32.0853, 34.7818]);
    const [loading, setLoading] = useState(true);
    const { shelters, loadShelters } = useShelterStore();

    useEffect(() => {
        const fetchData = async () => {
            await loadShelters();
        };

        fetchData().catch(console.error);
    }, [loadShelters]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setMyPosition([latitude, longitude]);
                setLoading(false);
            },
            (error) => {
                console.error("sorry, we couldn't find your position", error.message);
                setLoading(false);
            }
        );
    }, []);

    return (
        <div className="mapContainer">
            {loading ? (
                <>
                    <Loader2 className="spinner" size={40} color="crimson" />
                    <p className="loadingText">מאתר את המיקום שלך...</p>
                </>
            ) : (
                <MapContainer
                    key={`${myPosition[0]}-${myPosition[1]}`}
                    center={myPosition}
                    zoom={13}
                    scrollWheelZoom={true}
                    className="leaflet-container"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <RecenterAutomatically position={myPosition} />

                    <Marker position={myPosition}>
                        <Popup>אתה נמצא כאן!</Popup>
                    </Marker>
                </MapContainer>
            )}
        </div>
    );
}

export default MapPage