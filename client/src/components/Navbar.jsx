import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();

    const sendTestAlert = () => {
        // יצירת אירוע מותאם אישית שניתן להקשיב לו בכל מקום באפליקציה
        const testData = {
            areas: ["אזור בדיקה (סימולציה)"],
            polygon: [
                { lat: 32.1, lon: 34.7 },
                { lat: 32.1, lon: 34.9 },
                { lat: 31.9, lon: 34.9 },
                { lat: 31.9, lon: 34.7 }
            ]
        };

        const event = new CustomEvent('manual_test_alert', { detail: testData });
        window.dispatchEvent(event);
        console.log("הופעלה התראת בדיקה מקומית");
    };

    return (
        <nav style={styles.nav}>
            <div style={styles.logoContainer} onClick={() => navigate('/')}>
                <span style={styles.logoIcon}>🛡️</span>
                <span style={styles.logoText}>התראה ולמקלט</span>
            </div>

            <div style={styles.actions}>
                <button 
                    onClick={() => navigate('/map')} 
                    style={{...styles.btn, ...styles.shelterBtn}}
                >
                    🔍 מצא מקלט קרוב
                </button>
                
                <button 
                    onClick={sendTestAlert} 
                    style={{...styles.btn, ...styles.testBtn}}
                >
                    בחינת התראה (Test)
                </button>
            </div>
        </nav>
    );
};

const styles = {
    nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: '#1f2937', color: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.3)', direction: 'rtl' },
    logoContainer: { display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '10px' },
    logoIcon: { fontSize: '24px' },
    logoText: { fontWeight: 'bold', fontSize: '20px' },
    actions: { display: 'flex', gap: '10px' },
    btn: { padding: '8px 15px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'opacity 0.2s' },
    shelterBtn: { backgroundColor: '#3b82f6', color: 'white' },
    testBtn: { backgroundColor: '#4b5563', color: 'white', fontSize: '12px' }
};

export default Navbar;