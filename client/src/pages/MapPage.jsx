import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Loader2 } from "lucide-react";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import useShelterStore from "../store/useStoreShelter";

let usertIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

let shelterIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

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
            () => {
                setMyPosition([32.0853, 34.7818]);
                setLoading(false);
            },
        );
    }, []);

    const handleNavigate = (lat, lon) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=walking`;
        window.open(url, "_blank");
    };

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

                    <Marker position={myPosition} icon={usertIcon}>
                        <Popup>אתה נמצא כאן!</Popup>
                    </Marker>

                    {shelters && shelters.map((shelter) => (
                        <Marker
                            key={shelter._id}
                            position={[shelter.lat, shelter.lon]}
                            icon={shelterIcon}
                        >
                            <Popup>
                                <div className="shelterPopupDiv">
                                    <h4 className="shelterTitle">מקלט ציבורי</h4>
                                    {shelter.distanceInMeters && (
                                        <p className="shelterDistance">מרחק: {shelter.distanceInMeters} מטרים</p>
                                    )}
                                    <button
                                        className="shelterButton"
                                        onClick={() => handleNavigate(shelter.lat, shelter.lon)}>
                                        נווט ברגל 🏃‍♂️
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            )}
        </div>
    );
}

export default MapPage;
