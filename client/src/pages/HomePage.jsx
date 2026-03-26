import { Link } from "react-router";

function HomePage() {
    const isAlertActive = true;

    return (
        <div>
            {!isAlertActive &&
                <div className="alertDiv noAlert">
                    <h1 className="notActive">אין כרגע התרעות באיזורך</h1>
                </div>
            }
            {isAlertActive &&
                <div className="alertDiv alert">
                    <h1 className="active">יש התרעות באזורך, נא להיכנס למרחב מוגן</h1>
                    <Link to={"/map"} className="findShelterButton">מצא מרחב מוגן קרוב</Link>
                </div>
            }
            <p>©כל הזכויות שמורות לsafeZoneAi</p>
        </div>
    )
}

export default HomePage