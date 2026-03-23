function HomePage() {
    const isAlertActive = falsegit;

    return (
        <div>
            {!isAlertActive &&
                <div className="alertDiv">
                    <h1 className="notActive">אין כרגע התרעות באיזורך</h1>
                </div>
            }
            {isAlertActive &&
                <div className="alertDiv">
                    <h1 className="active">יש התרעות באזורך, נא להיכנס למרחב מוגן</h1>
                    <button className="findShelterButton">מצא מרחב מוגן קרוב</button>
                </div>
            }
            <p>©כל הזכויות שמורות לsafeZoneAi</p>
        </div>
    )
}

export default HomePage