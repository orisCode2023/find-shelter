import "./styles/App.css";
import "leaflet/dist/leaflet.css";
import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";
import { Routes, Route } from "react-router"

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
      </Routes>
    </>
  )
}

export default App
