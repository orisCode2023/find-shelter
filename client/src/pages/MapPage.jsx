import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Loader2 } from "lucide-react";
import useShelterStore from "../store/useStoreShelter.js";
import { useUserLocation } from "../hooks/useUserLocation.js";
import { userIcon } from "../utils/mapIcons.js";
import RecenterAutomatically from "../components/map/RecenterAutomatically";
import RecenterButton from "../components/map/RecenterButton";
import ShelterMarker from "../components/map/ShelterMarker";
import RoutingMachine from "../components/map/RoutingMachine";

function MapPage() {
  const [isAutoCenter, setIsAutoCenter] = useState(true);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const { myPosition, loading } = useUserLocation();
  const { shelters } = useShelterStore();

  return (
    <div className="mapContainer">
      {loading ? (
        <div className="loaderWrapper">
          <Loader2 className="spinner" size={40} color="crimson" />
          <p className="loadingText">מאתר את המיקום שלך...</p>
        </div>
      ) : (
        <div
          className="mapDiv"
          style={{ height: "100%", width: "100%", position: "relative" }}
        >
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

            {selectedShelter && (
              <RoutingMachine from={myPosition} to={selectedShelter} />
            )}

            <Marker position={myPosition} icon={userIcon}>
              <Popup>אתה נמצא כאן!</Popup>
            </Marker>

            {shelters
              ?.filter((s) => s.lat && s.lon)
              .map((shelter) => (
                <ShelterMarker
                  key={shelter._id || `${shelter.lat}-${shelter.lon}`}
                  shelter={shelter}
                  onNavigate={setSelectedShelter}
                />
              ))}
          </MapContainer>

          {selectedShelter && (
            <button
              className="clearRouteButton"
              onClick={() => setSelectedShelter(null)}
            >
              בטל ניווט ✕
            </button>
          )}

          <RecenterButton
            isAutoCenter={isAutoCenter}
            onClick={() => setIsAutoCenter(true)}
          />
        </div>
      )}
    </div>
  );
}

export default MapPage;
