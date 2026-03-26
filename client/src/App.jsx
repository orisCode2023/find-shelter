import "./styles/App.css";
import "leaflet/dist/leaflet.css";
import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";
import { Routes, Route } from "react-router"
import AlertListener from "./components/ALertListener";
import Navbar from "./components/Navbar.jsx";

function App() {

  return (
    <>
      <AlertListener />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
      </Routes>
    </>
  )
}

export default App
