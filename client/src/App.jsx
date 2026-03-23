import HomePage from "./pages/HomePage";
import "./styles/App.css";
import { Routes, Route } from "react-router"

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </>
  )
}

export default App
