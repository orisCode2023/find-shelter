import requests
import time
import json
from datetime import datetime

API_URL = "https://api.rocketil.live/api/alerts"

def listen_and_return_alerts():
    last_check_time = int(time.time() * 1000)
    seen_ids = set()

    while True:
        try:
            params = {'since': last_check_time}
            response = requests.get(API_URL, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()
            alerts = data.get('alerts', [])

            if alerts:
                for alert in alerts:
                    alert_id = alert.get('id')
                    if alert_id in seen_ids:
                        continue
                    seen_ids.add(alert_id)

                    try:
                        payload = json.loads(alert.get('payload_json', '{}'))
                    except json.JSONDecodeError:
                        payload = {}

                    alert_data = {
                        "id": alert_id,
                        "timestamp": alert.get('timestamp'),
                        "time": datetime.fromtimestamp(
                            alert.get('timestamp', 0) / 1000
                        ).strftime('%H:%M:%S'),
                        "title": payload.get('oref_title', 'התראה'),
                        "description": payload.get('oref_desc', ''),
                        "location": alert.get('region_name', 'לא ידוע'),
                        "lat": payload.get('lat'),
                        "lng": payload.get('lng')
                    }

                    yield alert_data

                last_check_time = max(
                    alert.get('timestamp', 0) for alert in alerts
                ) + 1

        except Exception:
            pass

        time.sleep(1)
