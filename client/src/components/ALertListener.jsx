import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import * as geolib from 'geolib';
import alertSound from '../audio/alert-sound.mp3';

// קונפיגורציה
const SOCKET_SERVER_URL = "http://localhost:3000"; 
const DANGER_RADIUS = 12000; // 12 ק"מ לסכנה (אדום)
const NEARBY_RADIUS = 30000; // 30 ק"מ להתראה סמוכה (כתום)

const AlertListener = () => {
    const [activeAlert, setActiveAlert] = useState(null);
    const [isUserInDanger, setIsUserInDanger] = useState(false);
    const [userCity, setUserCity] = useState(""); 
    
    const lastKnownPos = useRef(null);
    const userCityRef = useRef(""); 
    const socketRef = useRef(null);
    const audioRef = useRef(new Audio(alertSound));

    // --- 1. פונקציות עזר למיקום וניווט ---

    const updateLocation = async () => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) return resolve(null);

            navigator.geolocation.getCurrentPosition(async (position) => {
                const coords = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                lastKnownPos.current = coords;

                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&accept-language=he`
                    );
                    const data = await response.json();
                    const city = data.address.city || data.address.town || data.address.village || "";
                    if (city) {
                        setUserCity(city);
                        userCityRef.current = city;
                    }
                    resolve({ ...coords, city });
                } catch (e) {
                    resolve(coords);
                }
            }, (err) => {
                console.error("GPS Error:", err);
                resolve(null);
            }, { enableHighAccuracy: true, timeout: 5000 });
        });
    };

    const handleNavigate = () => {
        if (!lastKnownPos.current) {
            alert("מזהה מיקום... נסה שוב בעוד רגע");
            updateLocation();
            return;
        }

        const { latitude, longitude } = lastKnownPos.current;
        
        // כאן ניתן להחליף במיקום דינמי מה-DB של המקלטים
        const destLat = 31.6038; 
        const destLng = 34.7640;

        // פורמט המבטיח קו ניווט כחול (Direction) ומצב הליכה (dirflg=w)
        const url = `https://www.google.com/maps?saddr=${latitude},${longitude}&daddr=${destLat},${destLng}&dirflg=w`;
        
        window.open(url, '_blank');
    };

    // --- 2. ניהול סוקט ואירועים ---

    useEffect(() => {
        // הפעלה ראשונית ועדכון GPS רציף
        updateLocation();
        const watchId = navigator.geolocation.watchPosition((pos) => {
            lastKnownPos.current = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        }, null, { enableHighAccuracy: true });

        socketRef.current = io(SOCKET_SERVER_URL);

        socketRef.current.on("red_alert", (data) => {
            console.log("📥 התראה התקבלה:", data.location);
            processAlert(data);
        });

        const handleManualTest = (event) => {
            console.log("🧪 בדיקת מערכת הופעלה");
            processAlert({ 
                location: event.detail?.location || "אזור בדיקה", 
                isTest: true 
            });
        };

        window.addEventListener('manual_test_alert', handleManualTest);

        return () => {
            navigator.geolocation.clearWatch(watchId);
            if (socketRef.current) socketRef.current.disconnect();
            window.removeEventListener('manual_test_alert', handleManualTest);
            stopAlert();
        };
    }, []);

    const processAlert = async (data) => {
        // מניעת דריסה של מצב סכנה קיים על ידי התראה רחוקה יותר
        if (isUserInDanger && !data.isTest) return;

        const checkLogic = (pos, city) => {
            const isCityMatch = city && data.location && data.location.includes(city);
            let distance = null;

            if (pos && data.lat && data.lng) {
                distance = geolib.getDistance(pos, {
                    latitude: parseFloat(data.lat),
                    longitude: parseFloat(data.lng)
                });
            }

            const danger = isCityMatch || (distance && distance <= DANGER_RADIUS) || data.isTest;
            const nearby = distance && distance <= NEARBY_RADIUS;

            if (danger) {
                setActiveAlert(data);
                setIsUserInDanger(true);
                playSiren();
                return true;
            } else if (nearby) {
                setActiveAlert(data);
                setIsUserInDanger(false);
            }
            return false;
        };

        // שלב א': בדיקה מיידית מול זיכרון (למניעת איבוד התראות במטח)
        const found = checkLogic(lastKnownPos.current, userCityRef.current);

        // שלב ב': אם לא נמצאה סכנה, רענון GPS שקט ליתר ביטחון
        if (!found && !data.isTest) {
            const fresh = await updateLocation();
            if (fresh) checkLogic(fresh, fresh.city);
        }
    };

    const playSiren = () => {
        audioRef.current.loop = true;
        audioRef.current.play().catch(() => console.log("אודיו נחסם ע\"י הדפדפן"));
        if (navigator.vibrate) navigator.vibrate([1000, 500, 1000]);
    };

    const stopAlert = () => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsUserInDanger(false);
        setActiveAlert(null);
    };

    if (!activeAlert) return null;

    return (
        <div style={styles.overlay}>
            <div style={{
                ...(isUserInDanger ? styles.dangerBox : styles.infoBox),
                animation: isUserInDanger ? 'pulseAlert 1.5s infinite' : 'none'
            }}>
                <div style={styles.header}>
                    <span style={styles.icon}>{isUserInDanger ? "🚨" : "📢"}</span>
                    <h2 style={styles.title}>
                        {isUserInDanger ? "צבע אדום באזורך!" : "התראה באזור סמוך"}
                    </h2>
                </div>
                
                <p style={styles.locationName}>{activeAlert.location}</p>
                
                {isUserInDanger && (
                    <div style={styles.navContainer}>
                        <button onClick={handleNavigate} style={styles.btnNavigate}>
                            🏃‍♂️ נווט למקלט הכי קרוב
                        </button>
                    </div>
                )}

                <div style={styles.actions}>
                    <button onClick={stopAlert} style={styles.btnStop}>
                        {isUserInDanger ? "הפסק סירנה" : "סגור"}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes pulseAlert {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
                    70% { transform: scale(1.03); box-shadow: 0 0 0 20px rgba(220, 38, 38, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
                }
            `}</style>
        </div>
    );
};

const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 99999, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '40px', direction: 'rtl' },
    dangerBox: { pointerEvents: 'auto', background: '#dc2626', color: 'white', padding: '30px', borderRadius: '20px', textAlign: 'center', width: '90%', maxWidth: '420px', border: '5px solid white', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' },
    infoBox: { pointerEvents: 'auto', background: '#f59e0b', color: 'black', padding: '20px', borderRadius: '15px', textAlign: 'center', width: '85%', maxWidth: '360px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' },
    title: { margin: 0, fontSize: '1.4rem', fontWeight: '800' },
    locationName: { fontSize: '2rem', fontWeight: '900', margin: '15px 0' },
    btnNavigate: { width: '100%', padding: '18px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
    btnStop: { padding: '10px 25px', background: 'rgba(255,255,255,0.2)', color: 'inherit', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' },
    icon: { fontSize: '1.8rem' }
};

export default AlertListener;