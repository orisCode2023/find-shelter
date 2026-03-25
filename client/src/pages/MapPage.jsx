import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Loader2 } from "lucide-react";
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

function RecenterAutomatically({ position }) {
  const map = useMap();
  useEffect(() => {
    map.setView([position.latitude, position.longitude]);
  }, [position, map]);
  return null;
}

function MapPage() {
  const [myPosition, setMyPosition] = useState({
    latitude: 32.0853,
    longitude: 34.7818,
  });
  const [loading, setLoading] = useState(true);
  const { shelters, findShelter } = useShelterStore();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newPos = { latitude, longitude };
        setMyPosition(newPos);
        await findShelter(newPos);
        setLoading(false);
      },
      async () => {
        await findShelter({ latitude: 32.0853, longitude: 34.7818 });
        setLoading(false);
      }
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
          key={`${myPosition.latitude}-${myPosition.longitude}`}
          center={[myPosition.latitude, myPosition.longitude]}
          zoom={13}
          scrollWheelZoom={true}
          className="leaflet-container"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <RecenterAutomatically position={myPosition} />

          <Marker position={[myPosition.latitude, myPosition.longitude]} icon={userIcon}>
            <Popup>אתה נמצא כאן!</Popup>
          </Marker>

          {shelters
            .filter((s) => typeof s.lat === "number" && typeof s.lon === "number")
            .map((s) => (
              <Marker key={s._id} position={[s.lat, s.lon]} icon={shelterIcon}>
                <Popup>
                  <div className="shelterPopupDiv">
                    <h4 className="shelterTitle">מקלט ציבורי</h4>
                    {s.distanceInMeters && (
                      <p className="shelterDistance">מרחק: {s.distanceInMeters} מטרים</p>
                    )}
                    <button
                      className="shelterButton"
                      onClick={() => handleNavigate(s.lat, s.lon)}
                    >
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

// import { useState, useEffect } from "react";
// import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
// import { Loader2 } from "lucide-react";
// import L from "leaflet";
// import markerIcon from "leaflet/dist/images/marker-icon.png";
// import markerShadow from "leaflet/dist/images/marker-shadow.png";
// import useShelterStore from "../store/useStoreShelter";

// let usertIcon = L.icon({
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
// });

// let shelterIcon = L.icon({
//   iconUrl:
//     "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
//   shadowUrl: markerShadow,
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
// });

// function RecenterAutomatically({ position }) {
//   const map = useMap();
//   useEffect(() => {
//     map.setView(position);
//   }, [position, map]);
//   return null;
// }

// function getUserLocation() {
//   navigator.geolocation.getCurrentPosition((position) => {
//     if (position) {
//       const { latitude, longitude } = position.coords;
//       return [latitude, longitude];
//     }
//   });
// }

// function MapPage() {
//   const [myPosition, setMyPosition] = useState({
//     latitude: 32.0853,
//     longitude: 34.7818,
//   });
//   // const [myPosition, setMyPosition] = useState([32.0853, 34.7818]);
//   const [loading, setLoading] = useState(true);
//   const { shelters, loadShelters, findShelter } = useShelterStore();

//   // useEffect(() => {
//   //   const fetchData = async () => {
//   //     await loadShelters();
//   //   };
//   //   fetchData().catch(console.error);
//   // }, [loadShelters]);

//   function changeLocation() {
//     const cords = getUserLocation();
//     console.log(cords);
//     console.log(myPosition);
//     if (cords) {
//       setMyPosition((prev) => ({
//         ...prev,
//         latitude: cords[0],
//         longitude: cords[1],
//       }));
//     }
//   }

//   useEffect(() => {
//     findShelter(myPosition);
//     console.log(shelters);
//     changeLocation();
//     setLoading(false);
//   }, []);

//   const handleNavigate = (lat, lon) => {
//     const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=walking`;
//     window.open(url, "_blank");
//   };

//   return (
//     <div className="mapContainer">
//       {loading ? (
//         <>
//           <Loader2 className="spinner" size={40} color="crimson" />
//           <p className="loadingText">מאתר את המיקום שלך...</p>
//         </>
//       ) : (
//         <MapContainer
//           key={`${myPosition.latitude}-${myPosition.longitude}`}
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

//           <Marker position={myPosition} icon={usertIcon}>
//             <Popup>אתה נמצא כאן!</Popup>
//           </Marker>

//           {shelters
//             .filter(
//               (s) => typeof s.lat === "number" && typeof s.lon === "number",
//             )
//             .map((s) => (
//               <Marker key={s._id} position={[s.lat, s.lon]} icon={shelterIcon}>
//                 <Popup>
//                   <div className="shelterPopupDiv">
//                     <h4 className="shelterTitle">מקלט ציבורי</h4>
//                     {shelter.distanceInMeters && (
//                       <p className="shelterDistance">
//                         מרחק: {shelter.distanceInMeters} מטרים
//                       </p>
//                     )}
//                     <button
//                       className="shelterButton"
//                       onClick={() => handleNavigate(shelter.lat, shelter.lon)}
//                     >
//                       נווט ברגל 🏃‍♂️
//                     </button>
//                   </div>
//                 </Popup>
//               </Marker>
//             ))}
//         </MapContainer>
//       )}
//     </div>
//   );
// }

// export default MapPage;
