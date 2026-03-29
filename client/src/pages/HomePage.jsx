import React from 'react';
import { Link } from "react-router";
import '../styles/HomePage.css';

function HomePage() {
    // ניתן בעתיד למשוך את הסטטוס הזה מה-Global State של האפליקציה
    const isAlertActive = false; 

    // פונקציית עזר ליצירת כפתור חיוג
    const EmergencyButton = ({ label, number }) => (
        <a href={`tel:${number}`} className="contact-card dial-button">
            <strong>{label}:</strong> {number}
        </a>
    );

    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1 className="main-title">התראה ולמקלט 🙌</h1>
                    <p className="hero-subtitle">
                        טכנולוגיה מצילת חיים. מערכת התראות בזמן אמת וניווט חכם למרחב המוגן הקרוב ביותר.
                    </p>
                    
                    <div className="status-box">
                        {isAlertActive ? (
                            <div className="alert-active">
                                <span className="pulse-icon">⚠️</span>
                                <h2>יש התרעות באזורך!</h2>
                                <p>נא להיכנס למרחב מוגן באופן מיידי.</p>
                                <Link to="/map" className="cta-button danger">מצא מרחב מוגן עכשיו</Link>
                            </div>
                        ) : (
                            <div className="alert-none">
                                <span className="check-icon">🛡️</span>
                                <h2>האזור שלך שקט כרגע</h2>
                                <p>המערכת סורקת את האזור בחיפוש אחר איומים 24/7.</p>
                                <Link to="/map" className="cta-button secondary">צפה במפת המקלטים</Link>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="features">
                <div className="feature-card">
                    <div className="icon">📡</div>
                    <h3>זמן אמת</h3>
                    <p>קישור ישיר למערכות ההתראה עם מינימום שיהוי.</p>
                </div>
                <div className="feature-card">
                    <div className="icon">📍</div>
                    <h3>17,000+ מקלטים</h3>
                    <p>מאגר הנתונים הגדול והעדכני ביותר בישראל לניווט למחסה.</p>
                </div>
                <div className="feature-card">
                    <div className="icon">🚶‍♂️</div>
                    <h3>ניתוב מהיר</h3>
                    <p>חישוב מסלול הגעה רגלי אופטימלי כדי שלא תבזבזו זמן יקר.</p>
                </div>
            </section>

            <section className="emergency-info">
                <h2>מוקדי חירום וסיוע</h2>
                <div className="emergency-grid">
                    <EmergencyButton label="משטרה" number="100" />
                    <EmergencyButton label="מד''א" number="101" />
                    <EmergencyButton label="כיבוי אש" number="102" />
                    <EmergencyButton label="פיקוד העורף" number="104" />
                </div>
            </section>

            <footer className="home-footer">
                <p>© כל הזכויות שמורות ל-safeZoneAi 2026</p>
                <p className="disclaimer">המערכת הינה כלי עזר ואינה מחליפה את הנחיות פיקוד העורף.</p>
            </footer>
        </div>
    );
}

export default HomePage;