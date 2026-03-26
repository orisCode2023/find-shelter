import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import * as geolib from 'geolib';
import alertSound from '../audio/alert-sound.mp3';

const SOCKET_SERVER_URL = "http://localhost:3000"; 
const DANGER_RADIUS = 10000;  // 10 ק"מ (במטרים)
const NEARBY_RADIUS = 30000;  // 30 ק"מ (במטרים)

const AlertListener = () => {
    const [activeAlert, setActiveAlert] = useState(null);
    const [isUserInDanger, setIsUserInDanger] = useState(false);
    const socketRef = useRef(null);
    const audioRef = useRef(new Audio(alertSound));

    useEffect(() => {
        socketRef.current = io(SOCKET_SERVER_URL);

        socketRef.current.on("red_alert", (data) => {
            console.log("התראה התקבלה מהשרת:", data);
            processAlert(data);
        });

        const handleManualTest = (event) => {
            // בבדיקה ידנית אנחנו מאלצים "סכנה" כדי לראות שה-UI עובד
            processAlert({ ...event.detail, isTest: true });
        };

        window.addEventListener('manual_test_alert', handleManualTest);

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
            window.removeEventListener('manual_test_alert', handleManualTest);
            stopAlert();
        };
    }, []);

    const processAlert = (data) => {
        // 1. טיפול בבדיקה ידנית (Test)
        if (data.isTest) {
            setActiveAlert(data);
            setIsUserInDanger(true);
            playSiren();
            return;
        }

        // 2. אימות נתונים מהבאקנד (לוודא שיש קואורדינטות)
        if (!data.lat || !data.lng) {
            console.warn("התראה התקבלה ללא קואורדינטות, מציג כברירת מחדל ללא סירנה");
            setActiveAlert(data);
            setIsUserInDanger(false);
            return;
        }

        // 3. בדיקת מיקום המשתמש וחישוב מרחק
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const userPos = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };

                const alertPos = {
                    latitude: parseFloat(data.lat),
                    longitude: parseFloat(data.lng)
                };

                const distance = geolib.getDistance(userPos, alertPos);
                console.log(`מרחק מההתראה: ${distance / 1000} ק"מ`);

                if (distance <= DANGER_RADIUS) {
                    // טווח 1: עד 10 ק"מ -> אדום + סירנה
                    setActiveAlert(data);
                    setIsUserInDanger(true);
                    playSiren();
                } 
                else if (distance <= NEARBY_RADIUS) {
                    // טווח 2: 10-30 ק"מ -> כתום ללא סירנה
                    setActiveAlert(data);
                    setIsUserInDanger(false);
                    // מוודא שהסאונד לא עובד אם המרחק גדול מ-10
                    audioRef.current.pause(); 
                } 
                else {
                    // טווח 3: מעל 30 ק"מ -> לא מציג כלום
                    console.log("התראה מעל 30 קמ, מתעלם.");
                    setActiveAlert(null);
                    setIsUserInDanger(false);
                }
            }, (err) => {
                console.error("שגיאת מיקום:", err);
                // אם אין גישה למיקום, נציג את ההתראה ליתר ביטחון ככתום (ללא סירנה)
                setActiveAlert(data);
                setIsUserInDanger(false);
            }, 
            { enableHighAccuracy: true, timeout: 5000 });
        }
    };

    const playSiren = () => {
        const audio = audioRef.current;
        audio.loop = true;
        audio.currentTime = 0;
        audio.play().catch(e => console.log("ניגון אוטו' נחסם ע''י הדפדפן"));
        
        if (navigator.vibrate) {
            navigator.vibrate([1000, 500, 1000]);
        }
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
                
                {/* הצגת זמן ההתראה מהבאקנד שלך */}
                {activeAlert.time && <p style={styles.timeTag}>זמן: {activeAlert.time}</p>}

                <div style={styles.actions}>
                    {isUserInDanger ? (
                        <button onClick={stopAlert} style={styles.btnDanger}>הבנתי, הפסק סירנה</button>
                    ) : (
                        <button onClick={() => setActiveAlert(null)} style={styles.btnClose}>סגור</button>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: { 
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
        pointerEvents: 'none', zIndex: 10000, display: 'flex', 
        justifyContent: 'center', alignItems: 'flex-start', paddingTop: '50px' 
    },
    dangerBox: { 
        pointerEvents: 'auto', background: '#dc2626', color: 'white', 
        padding: '25px', borderRadius: '16px', textAlign: 'center', 
        boxShadow: '0 10px 50px rgba(0,0,0,0.5)', width: '90%', maxWidth: '400px',
        border: '4px solid white'
    },
    infoBox: { 
        pointerEvents: 'auto', background: '#f59e0b', color: 'black', 
        padding: '20px', borderRadius: '12px', textAlign: 'center', 
        width: '90%', maxWidth: '350px', boxShadow: '0 5px 20px rgba(0,0,0,0.3)'
    },
    header: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '10px' },
    title: { margin: 0, fontSize: '1.4rem' },
    locationName: { fontSize: '1.6rem', fontWeight: 'bold', margin: '10px 0' },
    description: { fontSize: '1.1rem', marginBottom: '10px' },
    timeTag: { fontSize: '0.9rem', opacity: 0.8, marginBottom: '15px' },
    btnDanger: { 
        padding: '12px 24px', background: 'white', color: '#dc2626', 
        border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' 
    },
    btnClose: { 
        padding: '8px 20px', background: '#1e293b', color: 'white', 
        border: 'none', borderRadius: '6px', cursor: 'pointer' 
    }
};

export default AlertListener;