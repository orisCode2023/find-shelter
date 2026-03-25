import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Loader2, Target } from "lucide-react";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import useShelterStore from "../store/useStoreShelter";

let userIcon = L.icon({
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

function MapPage() {
    const [myPosition, setMyPosition] = useState([32.0853, 34.7818]);
    const [loading, setLoading] = useState(true);
    const [isAutoCenter, setIsAutoCenter] = useState(true);
    const { shelters, findShelter } = useShelterStore();

    useEffect(() => {
        let isPageActive = true;

        const success = async ({ coords }) => {
            if (isPageActive) {
                const newPos = [coords.latitude, coords.longitude];
                setMyPosition(newPos);
                
                if (findShelter) {
                    await findShelter({ latitude: coords.latitude, longitude: coords.longitude });
                }
                
                setLoading(false);
            }
        };

        const error = (err) => {
            console.error("GPS error:", err.message);
            setLoading(false);
        };

        const watcherId = navigator.geolocation.watchPosition(success, error, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });

        return () => {
            isPageActive = false;
            navigator.geolocation.clearWatch(watcherId);
        };
    }, [findShelter]);

    const handleNavigate = (lat, lon) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=walking`;
        window.open(url, "_blank");
    };

    return (
        <div className="mapContainer">
            {loading ? (
                <div className="loaderWrapper">
                    <Loader2 className="spinner" size={40} color="crimson" />
                    <p className="loadingText">מאתר את המיקום שלך...</p>
                </div>
            ) : (
                <div className="mapDiv" style={{ height: '100%', width: '100%', position: 'relative' }}>
                    <MapContainer
                        center={myPosition}
                        zoom={15}
                        scrollWheelZoom={true}
                        className="leaflet-container"
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <RecenterAutomatically 
                            position={myPosition} 
                            isAutoCenter={isAutoCenter} 
                            setIsAutoCenter={setIsAutoCenter} 
                        />

                        <Marker position={myPosition} icon={userIcon}>
                            <Popup>אתה נמצא כאן!</Popup>
                        </Marker>

                        {shelters && shelters
                            .filter(s => s.lat && s.lon)
                            .map((shelter) => (
                                <Marker 
                                    key={shelter._id || `${shelter.lat}-${shelter.lon}`} 
                                    position={[shelter.lat, shelter.lon]} 
                                    icon={shelterIcon}
                                >
                                    <Popup>
                                        <div className="shelterPopupDiv">
                                            <h4 className="shelterTitle">מקלט ציבורי</h4>
                                            {shelter.distanceInMeters && (
                                                <p className="shelterDistance">מרחק: {Math.round(shelter.distanceInMeters)} מטרים</p>
                                            )}
                                            <button
                                                className="shelterButton"
                                                onClick={() => handleNavigate(shelter.lat, shelter.lon)}
                                            >
                                                נווט ברגל 🏃‍♂️
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                    </MapContainer>

                    <button
                        className={`recenterButton ${isAutoCenter ? "active" : ""}`}
                        onClick={() => setIsAutoCenter(true)}
                    >
                        חזרה למקום שלי
                        <Target size={24} />
                    </button>
                </div>
            )}
        </div>
    );
}

export default MapPage;