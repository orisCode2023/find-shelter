import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import * as geolib from 'geolib';
import alertSound from '../audio/alert-sound.mp3';

const SOCKET_SERVER_URL = "http://localhost:3000"; 
const DANGER_RADIUS = 12000; // 12 ק"מ לסכנה
const NEARBY_RADIUS = 30000; // 30 ק"מ להתראה סמוכה

const AlertListener = () => {
    const [activeAlert, setActiveAlert] = useState(null);
    const [isUserInDanger, setIsUserInDanger] = useState(false);
    const [userCity, setUserCity] = useState(""); 
    
    const lastKnownPos = useRef(null);
    const userCityRef = useRef(""); // Ref נוסף כדי שהסוקט יראה תמיד את העיר המעודכנת
    const socketRef = useRef(null);
    const audioRef = useRef(new Audio(alertSound));

    // 1. פונקציה לעדכון מיקום ושם עיר (Reverse Geocoding)
    const refreshLocationAndCity = async () => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) return resolve(null);

            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                lastKnownPos.current = { latitude, longitude };
                
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=he`
                    );
                    const data = await response.json();
                    const city = data.address.city || data.address.town || data.address.village || data.address.settlement || "";
                    if (city) {
                        setUserCity(city);
                        userCityRef.current = city; // מעדכן גם את ה-Ref
                    }
                    resolve({ latitude, longitude, city });
                } catch (e) {
                    resolve({ latitude, longitude, city: "" });
                }
            }, () => resolve(null), { enableHighAccuracy: true, timeout: 5000 });
        });
    };

    // 2. ניהול סוקט, טסטים ומעקב GPS רציף
    useEffect(() => {
        // א. התחלת מעקב רציף (watchPosition)
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                lastKnownPos.current = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
            },
            null,
            { enableHighAccuracy: true, maximumAge: 5000 }
        );

        // ב. זיהוי עיר ראשוני
        refreshLocationAndCity();

        // ג. חיבור לסוקט ורישום מאזינים (פעם אחת בלבד!)
        socketRef.current = io(SOCKET_SERVER_URL);

        socketRef.current.on("red_alert", (data) => {
            console.log("📥 התראה התקבלה מהסוקט:", data.location);
            processAlert(data);
        });

        const handleManualTest = (event) => {
            console.log("🧪 טסט ידני הופעל");
            processAlert({ 
                location: event.detail?.location || "יישוב בדיקה", 
                description: "זוהי התראת בדיקה של המערכת",
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
        // אם המערכת כבר ב"סכנה", אנחנו מעדכנים רק אם זו התראה נוספת בעיר שלנו
        if (isUserInDanger && !data.isTest) {
            if (userCityRef.current && data.location.includes(userCityRef.current)) {
                setActiveAlert(data);
            }
            return;
        }

        const runCheck = (pos, city) => {
            const isCityMatch = city && data.location.includes(city);
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
                console.log(`🚨 סכנה זוהתה ב-${data.location}`);
                setActiveAlert(data);
                setIsUserInDanger(true);
                playSiren();
                return true;
            } else if (nearby) {
                console.log(`📢 אזור סמוך זוהה ב-${data.location}`);
                setActiveAlert(data);
                setIsUserInDanger(false);
                return false;
            }
            return false;
        };

        // בדיקה 1: מיידית לפי מה שיש בזיכרון (מונע איבוד התראות במטח)
        const foundDanger = runCheck(lastKnownPos.current, userCityRef.current);

        // בדיקה 2: "וידוא הריגה" עם GPS טרי (למקרה שנסעת לאחרונה)
        if (!foundDanger && !data.isTest) {
            const freshData = await refreshLocationAndCity();
            if (freshData) {
                runCheck({ latitude: freshData.latitude, longitude: freshData.longitude }, freshData.city);
            }
        }
    };

    const playSiren = () => {
        const audio = audioRef.current;
        audio.loop = true;
        audio.play().catch(() => console.log("לחץ על המסך כדי לאפשר סאונד"));
        if (navigator.vibrate) navigator.vibrate([1000, 500, 1000]);
    };

    const stopAlert = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setIsUserInDanger(false);
        setActiveAlert(null);
    };

    if (!activeAlert) return null;

    return (
        <div style={styles.overlay}>
            <div style={isUserInDanger ? styles.dangerBox : styles.infoBox}>
                <div style={styles.header}>
                    <span>{isUserInDanger ? "🚨" : "📢"}</span>
                    <h2 style={styles.title}>
                        {isUserInDanger ? "צבע אדום באזורך!" : "התראה באזור סמוך"}
                    </h2>
                </div>
                
                <p style={styles.locationName}>{activeAlert.location}</p>
                <p style={styles.description}>{activeAlert.description}</p>
                
                {activeAlert.time && <p style={styles.timeTag}>זמן: {activeAlert.time}</p>}

                <div style={styles.actions}>
                    <button onClick={stopAlert} style={isUserInDanger ? styles.btnDanger : styles.btnClose}>
                        {isUserInDanger ? "הבנתי, הפסק סירנה" : "סגור"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '50px' },
    dangerBox: { pointerEvents: 'auto', background: '#dc2626', color: 'white', padding: '25px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 10px 50px rgba(0,0,0,0.5)', width: '90%', maxWidth: '400px', border: '4px solid white' },
    infoBox: { pointerEvents: 'auto', background: '#f59e0b', color: 'black', padding: '20px', borderRadius: '12px', textAlign: 'center', width: '90%', maxWidth: '350px', boxShadow: '0 5px 20px rgba(0,0,0,0.3)' },
    header: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '10px' },
    title: { margin: 0, fontSize: '1.4rem' },
    locationName: { fontSize: '1.6rem', fontWeight: 'bold', margin: '10px 0' },
    description: { fontSize: '1.1rem', marginBottom: '10px' },
    timeTag: { fontSize: '0.9rem', opacity: 0.8, marginBottom: '15px' },
    btnDanger: { padding: '12px 24px', background: 'white', color: '#dc2626', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' },
    btnClose: { padding: '8px 20px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }
};

export default AlertListener;