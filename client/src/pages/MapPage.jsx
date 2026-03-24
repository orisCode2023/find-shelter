import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Loader2 } from "lucide-react";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import useShelterStore from "../store/useStoreShelter";

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function RecenterAutomatically({ position }) {
    const map = useMap();
    useEffect(() => {
        map.setView(position);
    }, [position, map]);
    return null;
}

// function MapPage() {
//   const [myPosition, setMyPosition] = useState([32.0853, 34.7818]);
//   const [loading, setLoading] = useState(true);
//   const { shelters, loadShelters } = useShelterStore();
//   console.log(shelters);

//   useEffect(() => {
//     const fetchData = async () => {
//       await loadShelters();
//     };

//     fetchData().catch(console.error);
//   }, [loadShelters]);

//   useEffect(() => {
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         const { latitude, longitude } = position.coords;
//         setMyPosition([latitude, longitude]);
//         setLoading(false);
//       },
//       () => {
//         console.warn("Geolocation denied, using default position");
//         setMyPosition([32.0853, 34.7818]);  
//         setLoading(false);
//       },
//     );
//   }, []);
//   return (
//     <div className="mapContainer">
//       {loading ? (
//         <>
//           <Loader2 className="spinner" size={40} color="crimson" />
//           <p className="loadingText">מאתר את המיקום שלך...</p>
//         </>
//       ) : (
//         <MapContainer
//           key={`${myPosition[0]}-${myPosition[1]}`}
//           center={myPosition}
//           zoom={13}
//           scrollWheelZoom={true}
//           className="leaflet-container"
//         >
//           <TileLayer
//             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           />

//           <RecenterAutomatically position={myPosition} />

//           <Marker position={myPosition}>
//             <Popup>אתה נמצא כאן!</Popup>
//           </Marker>
//         </MapContainer>
//       )}
//     </div>
//   );
// }

// export default MapPage;

function MapPage() {
    const [myPosition, setMyPosition] = useState([32.0853, 34.7818]);
    const [loading, setLoading] = useState(true);
    const { shelters, loadShelters } = useShelterStore();

    useEffect(() => {
        loadShelters().catch(console.error);
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
            }
        );
    }, []);

    const handleNavigate = (lat, lon) => {
        // פתיחת גוגל מפס למסלול הליכה
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=walking`;
        window.open(url, "_blank");
    };

    return (
        <div className="mapContainer">
            {loading ? (
                <div className="loader-wrapper">
                    <Loader2 className="spinner" size={40} color="crimson" />
                    <p className="loadingText">מאתר את המיקום שלך...</p>
                </div>
            ) : (
                <MapContainer
                    center={myPosition}
                    zoom={13}
                    scrollWheelZoom={true}
                    className="leaflet-container"
                >
                    <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <RecenterAutomatically position={myPosition} />

                    {/* מרקר המיקום שלי */}
                    <Marker position={myPosition}>
                        <Popup>אתה נמצא כאן!</Popup>
                    </Marker>

                    {/* רינדור המקלטים מה-Store */}
                    {shelters && shelters.map((shelter) => (
                        <Marker
                            key={shelter._id}
                            position={[shelter.lat, shelter.lon]}
                        >
                            <Popup>
                                <div style={{ textAlign: "right", direction: "rtl" }}>
                                    <h3 style={{ margin: "0 0 8px" }}>מקלט ציבורי</h3>
                                    {/* אם הוספת distanceInMeters ב-Service, הוא יופיע כאן */}
                                    {shelter.distanceInMeters && (
                                        <p>מרחק: <strong>{shelter.distanceInMeters} מטרים</strong></p>
                                    )}
                                    <button
                                        onClick={() => handleNavigate(shelter.lat, shelter.lon)}
                                        style={{
                                            backgroundColor: "crimson",
                                            color: "white",
                                            border: "none",
                                            padding: "8px 12px",
                                            borderRadius: "5px",
                                            cursor: "pointer",
                                            marginTop: "5px",
                                            width: "100%"
                                        }}
                                    >
                                        נווט עכשיו 🏃‍♂️
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
