import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import useShelterStore from "../store/useStoreShelter.js";
import { useUserLocation } from "../hooks/useUserLocation.js";
import { userIcon } from "../utils/mapIcons.js";
import RecenterAutomatically from "../components/map/RecenterAutomatically";
import RecenterButton from "../components/map/RecenterButton";
import ShelterMarker from "../components/map/ShelterMarker";
import RoutingMachine from "../components/map/RoutingMachine";
import { NavLink } from "react-router";
import "../styles/MapPage.css";

function MapPage() {
  const [isAutoCenter, setIsAutoCenter] = useState(true);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const { myPosition, loading } = useUserLocation();
  const { shelters } = useShelterStore();

  if (loading) {
    return (
      <div className="loader-overlay">
        <div className="loader-content">
          <Loader2 className="spinner" size={50} />
          <h2>מאתר מיקום מדויק...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="map-page-wrapper">
      <header className="map-header">
        <NavLink to={"/"} className="back-link">
          <ArrowRight size={20} /> חזרה
        </NavLink>
        <div className="map-stats">
          <ShieldCheck size={18} color="#10b981" />
          <span>{shelters?.length || 0} מקלטים באזור</span>
        </div>
      </header>

      <main className="map-main">
        <MapContainer
          center={myPosition}
          zoom={15}
          className="main-leaflet-map"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <RecenterAutomatically
            position={myPosition}
            isAutoCenter={isAutoCenter}
            setIsAutoCenter={setIsAutoCenter}
          />

          {selectedShelter && (
            <RoutingMachine from={myPosition} to={selectedShelter} />
          )}

          <Marker position={myPosition} icon={userIcon}>
            <Popup>אתה כאן</Popup>
          </Marker>

          {shelters?.filter((s) => s.lat && s.lon).map((shelter) => (
            <ShelterMarker
              key={shelter._id || `${shelter.lat}-${shelter.lon}`}
              shelter={shelter}
              onNavigate={setSelectedShelter}
            />
          ))}
        </MapContainer>

        {/* פקדים צפים מעל המפה */}
        <div className="map-overlay-controls">
          {selectedShelter && (
            <button className="btn-abort" onClick={() => setSelectedShelter(null)}>
              ביטול ניווט ✕
            </button>
          )}
          <RecenterButton
            isAutoCenter={isAutoCenter}
            onClick={() => setIsAutoCenter(true)}
          />
        </div>
      </main>
    </div>
  );
}

export default MapPage;