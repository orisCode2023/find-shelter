import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import * as geolib from 'geolib';
// ייבוא הקובץ בדיוק מהנתיב שראיתי ב-TAR
import alertSound from '../audio/alert-sound.mp3'; 

const SOCKET_SERVER_URL = "http://localhost:3000"; 

const AlertListener = () => {
    const [activeAlert, setActiveAlert] = useState(null);
    const [isUserInDanger, setIsUserInDanger] = useState(false);
    const socketRef = useRef(null);
    const audioRef = useRef(new Audio(alertSound));

    useEffect(() => {
        socketRef.current = io(SOCKET_SERVER_URL);

        // האזנה לאירוע - וודא שבבאקנד אתה שולח 'red_alert'
        socketRef.current.on("red_alert", (data) => {
            console.log("התקבלה התראה:", data);
            processAlert(data);
        });

        return () => {
            socketRef.current.disconnect();
            audioRef.current.pause();
        };
    }, []);

    const processAlert = (data) => {
        setActiveAlert(data);
        
        if (!data.polygon || data.polygon.length < 3) return;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const userPos = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };

                // המרה לפורמט של geolib במידה והבאקנד שולח lat/lng
                const polygon = data.polygon.map(p => ({
                    latitude: p.lat,
                    longitude: p.lon
                }));

                const inDanger = geolib.isPointInPolygon(userPos, polygon);
                
                if (inDanger) {
                    setIsUserInDanger(true);
                    playSiren();
                }
            }, (err) => console.error("Location error:", err), 
            { enableHighAccuracy: true });
        }
    };

    const playSiren = () => {
        audioRef.current.loop = true;
        audioRef.current.play().catch(() => console.log("User interaction required for audio"));
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
            <div style={isUserInDanger ? styles.dangerBox : styles.infoBox}>
                <h2>⚠️ התרעת צבע אדום</h2>
                <p>{activeAlert.areas?.join(', ')}</p>
                {isUserInDanger && (
                    <div style={styles.dangerContent}>
                        <p><strong>אתה נמצא באזור סכנה!</strong></p>
                        <button onClick={stopAlert} style={styles.btn}>הבנתי, הפסק סירנה</button>
                    </div>
                )}
                {!isUserInDanger && <button onClick={() => setActiveAlert(null)}>סגור</button>}
            </div>
        </div>
    );
};

const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '20px' },
    dangerBox: { pointerEvents: 'auto', background: '#e11d48', color: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '4px solid white' },
    infoBox: { pointerEvents: 'auto', background: '#f59e0b', color: 'black', padding: '15px', borderRadius: '8px', textAlign: 'center' },
    btn: { marginTop: '15px', padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer', border: 'none', borderRadius: '4px' }
};

export default AlertListener;