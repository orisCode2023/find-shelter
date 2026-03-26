import { Target } from "lucide-react";

function RecenterButton({ isAutoCenter, onClick }) {
  return (
    <button
      className={`recenterButton ${isAutoCenter ? "active" : ""}`}
      onClick={onClick}
    >
      חזרה למקום שלי
      <Target size={24} />
    </button>
  );
}

export default RecenterButton;