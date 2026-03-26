import { Marker, Popup } from "react-leaflet";
import { shelterIcon } from "../../utils/mapIcons";

function ShelterMarker({ shelter, onNavigate }) {
  return (
    <Marker
      position={[shelter.lat, shelter.lon]}
      icon={shelterIcon}
    >
      <Popup>
        <div className="shelterPopupDiv">
          <h4 className="shelterTitle">מקלט ציבורי</h4>
          {shelter.distanceInMeters && (
            <p className="shelterDistance">
              מרחק: {Math.round(shelter.distanceInMeters)} מטרים
            </p>
          )}
          <button
            className="shelterButton"
            onClick={() => onNavigate(shelter)}
          >
            נווט ברגל 🏃‍♂️
          </button>
        </div>
      </Popup>
    </Marker>
  );
}

export default ShelterMarker;