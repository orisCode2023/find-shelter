import "./styles/App.css";
import "leaflet/dist/leaflet.css";
import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";
import { Routes, Route } from "react-router"
import AlertListener from "./components/ALertListener";

function App() {

  return (
    <>
      <AlertListener />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
      </Routes>
    </>
  )
}

export default App
