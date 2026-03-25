import json
import redis
from get_alerts import listen_and_return_alerts

def run_producer():
    r = redis.Redis(host='localhost', port=6379, decode_responses=True)

    for alert in listen_and_return_alerts():
        r.publish("alerts_channel", json.dumps(alert, ensure_ascii=False))

if __name__ == "__main__":
    run_producer()