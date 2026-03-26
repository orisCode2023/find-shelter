import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import * as geolib from 'geolib';
import alertSound from '../audio/alert-sound.mp3';

const SOCKET_SERVER_URL = "http://localhost:3000"; 
const DANGER_RADIUS = 12000; 
const NEARBY_RADIUS = 30000; 

const AlertListener = () => {
    const [activeAlert, setActiveAlert] = useState(null);
    const [isUserInDanger, setIsUserInDanger] = useState(false);
    const [userCity, setUserCity] = useState(""); 
    
    const lastKnownPos = useRef(null);
    const socketRef = useRef(null);
    const audioRef = useRef(new Audio(alertSound));

    // 1. פונקציה לעדכון מיקום ושם עיר - שתהיה זמינה לקריאה בכל רגע
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
                    const city = data.address.city || data.address.town || data.address.village || "";
                    if (city) setUserCity(city);
                    resolve({ latitude, longitude, city });
                } catch (e) {
                    resolve({ latitude, longitude, city: "" });
                }
            }, () => resolve(null), { enableHighAccuracy: true, timeout: 3000 });
        });
    };

    useEffect(() => {
        // א. התחלת מעקב רציף - מעדכן את ה-Ref בכל תנועה של המכשיר
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                lastKnownPos.current = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
            },
            null,
            { enableHighAccuracy: true, maximumAge: 10000 } // מאפשר שימוש במיקום מה-10 שניות האחרונות
        );

        // ב. עדכון שם עיר ראשוני
        refreshLocationAndCity();

        socketRef.current = io(SOCKET_SERVER_URL);
        socketRef.current.on("red_alert", (data) => {
            console.log("📥 התראה התקבלה:", data.location);
            processAlert(data);
        });

        return () => {
            navigator.geolocation.clearWatch(watchId);
            if (socketRef.current) socketRef.current.disconnect();
            stopAlert();
        };
    }, []);

    const processAlert = async (data) => {
        // אם אין לנו מיקום בכלל (למשל האפליקציה רק נפתחה), ננסה להביא מהר
        if (!lastKnownPos.current) {
            await refreshLocationAndCity();
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
                setActiveAlert(data);
                setIsUserInDanger(true);
                playSiren();
                return true; // מצאנו סכנה
            } else if (nearby && !isUserInDanger) {
                setActiveAlert(data);
                setIsUserInDanger(false);
            }
            return false;
        };

        // בדיקה 1: על סמך המיקום האחרון הידוע (תגובה מיידית של מילי-שניות)
        const foundDanger = runCheck(lastKnownPos.current, userCity);

        // בדיקה 2: אם לא מצאנו סכנה מיידית, נבקש עדכון מיקום טרי "ליתר ביטחון"
        // זה פותר את המקרה שנסעת עיר ולא פתחת את הטלפון שעה
        if (!foundDanger) {
            const freshData = await refreshLocationAndCity();
            if (freshData) {
                runCheck({ latitude: freshData.latitude, longitude: freshData.longitude }, freshData.city);
            }
        }
    };

    const playSiren = () => {
        const audio = audioRef.current;
        audio.loop = true;
        audio.play().catch(() => console.log("Audio blocked - click anywhere"));
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
                    <h2 style={styles.title}>{isUserInDanger ? "צבע אדום באזורך!" : "התראה באזור סמוך"}</h2>
                </div>
                <p style={styles.locationName}>{activeAlert.location}</p>
                <p style={styles.description}>{activeAlert.description}</p>
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
    infoBox: { pointerEvents: 'auto', background: '#f59e0b', color: 'black', padding: '20px', borderRadius: '12px', textAlign: 'center', width: '90%', maxWidth: '350px' },
    header: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '10px' },
    title: { margin: 0, fontSize: '1.4rem' },
    locationName: { fontSize: '1.6rem', fontWeight: 'bold', margin: '10px 0' },
    description: { fontSize: '1.1rem', marginBottom: '10px' },
    btnDanger: { padding: '12px 24px', background: 'white', color: '#dc2626', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    btnClose: { padding: '8px 20px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }
};

export default AlertListener;