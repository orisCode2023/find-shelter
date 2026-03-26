import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import * as geolib from 'geolib';
import alertSound from '../audio/alert-sound.mp3';

// קונפיגורציה - שנה לפי הצורך
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

    // --- 1. ניהול מיקום וזיהוי עיר ---

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
                    // זיהוי שם העיר (Reverse Geocoding)
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&accept-language=he`
                    );
                    const data = await response.json();
                    const city = data.address.city || data.address.town || data.address.village || data.address.settlement || "";
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

    // פונקציית הניווט - פותרת את בעיית הקו הכחול בטלפון
    const handleNavigate = () => {
        if (!lastKnownPos.current) {
            alert("מזהה מיקום... וודא שה-GPS פועל ונסה שוב");
            updateLocation();
            return;
        }

        const { latitude, longitude } = lastKnownPos.current;
        
        // כאן תכניס את קואורדינטות המקלט הכי קרוב מה-DB שלך
        // כרגע שמתי מיקום לדוגמה (מרכז קרית גת)
        const destLat = 31.6038; 
        const destLng = 34.7640;

        // בניית ה-URL בפורמט Directions הרשמי של Google
        // origin = המיקום שלך, destination = המקלט, travelmode = הליכה
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${destLat},${destLng}&travelmode=walking`;
        
        // פתיחה בחלון חדש (בטלפון זה יקפיץ הצעה לפתוח באפליקציית Maps)
        const newWindow = window.open(googleMapsUrl, '_blank');
        
        // גיבוי למקרה שחוסם פופ-אפים עצר את הפתיחה
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            window.location.href = googleMapsUrl;
        }
    };

    // --- 2. ניהול תקשורת (Socket) ואירועים ---

    useEffect(() => {
        // עדכון ראשוני ורישום מעקב רציף
        updateLocation();
        const watchId = navigator.geolocation.watchPosition((pos) => {
            lastKnownPos.current = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        }, null, { enableHighAccuracy: true, maximumAge: 10000 });

        socketRef.current = io(SOCKET_SERVER_URL);

        socketRef.current.on("red_alert", (data) => {
            console.log("📢 התראה חדשה:", data.location);
            processAlert(data);
        });

        // האזנה לטסט ידני מהדפדפן/כפתור חיצוני
        const handleManualTest = (event) => {
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
        // אם אנחנו כבר במצב "סכנה", לא נותנים להתראות רחוקות יותר להחליף את המסך
        if (isUserInDanger && !data.isTest) return;

        const runCheck = (pos, city) => {
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

        // שלב 1: בדיקה מהירה מול המיקום האחרון בזיכרון (תגובה מיידית למניעת איבוד התראות)
        const foundDanger = runCheck(lastKnownPos.current, userCityRef.current);

        // שלב 2: אם לא זוהתה סכנה, ננסה לרענן מיקום שוב ליתר ביטחון
        if (!foundDanger && !data.isTest) {
            const fresh = await updateLocation();
            if (fresh) runCheck(fresh, fresh.city);
        }
    };

    const playSiren = () => {
        audioRef.current.loop = true;
        audioRef.current.play().catch(() => console.log("אודיו דורש לחיצה ראשונית על הדף"));
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
                animation: isUserInDanger ? 'pulseRed 1.5s infinite' : 'none'
            }}>
                <div style={styles.header}>
                    <span style={styles.icon}>{isUserInDanger ? "🚨" : "📢"}</span>
                    <h2 style={styles.title}>
                        {isUserInDanger ? "צבע אדום באזורך!" : "התראה באזור סמוך"}
                    </h2>
                </div>
                
                <p style={styles.locationName}>{activeAlert.location}</p>
                <p style={styles.instruction}>
                    {isUserInDanger ? "צא מיד למרחב מוגן!" : "התראה בטווח של עד 30 ק\"מ"}
                </p>
                
                {isUserInDanger && (
                    <div style={styles.navSection}>
                        <button onClick={handleNavigate} style={styles.btnNavigate}>
                            🏃‍♂️ נווט למקלט הכי קרוב
                        </button>
                    </div>
                )}

                <div style={styles.actions}>
                    <button onClick={stopAlert} style={styles.btnStop}>
                        {isUserInDanger ? "הבנתי, הפסק סירנה" : "סגור"}
                    </button>
                </div>
            </div>

            {/* הגדרת האנימציה - פועלת גם בטלפון */}
            <style>{`
                @keyframes pulseRed {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
                    70% { transform: scale(1.02); box-shadow: 0 0 0 20px rgba(220, 38, 38, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
                }
            `}</style>
        </div>
    );
};

// עיצוב (Styles)
const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '40px', direction: 'rtl', fontFamily: 'system-ui, sans-serif' },
    dangerBox: { pointerEvents: 'auto', background: '#dc2626', color: 'white', padding: '30px', borderRadius: '24px', textAlign: 'center', width: '90%', maxWidth: '420px', border: '5px solid white', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' },
    infoBox: { pointerEvents: 'auto', background: '#f59e0b', color: 'black', padding: '20px', borderRadius: '18px', textAlign: 'center', width: '85%', maxWidth: '360px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' },
    title: { margin: 0, fontSize: '1.4rem', fontWeight: '800' },
    locationName: { fontSize: '2.2rem', fontWeight: '900', margin: '15px 0', letterSpacing: '-1px' },
    instruction: { fontSize: '1.1rem', marginBottom: '20px', opacity: 0.9 },
    btnNavigate: { width: '100%', padding: '18px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '14px', fontSize: '1.25rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' },
    btnStop: { padding: '10px 25px', background: 'rgba(255,255,255,0.2)', color: 'inherit', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '10px', cursor: 'pointer', fontSize: '1rem' },
    icon: { fontSize: '2rem' }
};

export default AlertListener;