import requests
import json
from pyproj import Transformer

def fetch_and_convert_shelters():
    url = "https://raw.githubusercontent.com/KaplanOpenSource/shelters/main/shelters.geojson"
    
    try:
        response = requests.get(url)
        if response.status_code != 200:
            return

        data = response.json()
        features = data.get('features', [])

        transformer = Transformer.from_crs("epsg:2039", "epsg:4326")

        final_coords_only = []
        seen_locations = set()

        for item in features:
            geom = item.get('geometry', {})
            coords = geom.get('coordinates', [None, None])
            
            if coords[0] and coords[1]:
                try:
                    lat_wgs84, lon_wgs84 = transformer.transform(coords[0], coords[1])
                    
                    lat_rounded = round(lat_wgs84, 6)
                    lon_rounded = round(lon_wgs84, 6)
                    
                    loc_id = (lat_rounded, lon_rounded)
                    
                    if loc_id not in seen_locations:
                        final_coords_only.append({
                            "lat": lat_rounded,
                            "lon": lon_rounded
                        })
                        seen_locations.add(loc_id)
                        
                except Exception:
                    continue

        output_file = "shelters.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(final_coords_only, f, ensure_ascii=False, indent=2)

    except Exception:
        pass

if __name__ == "__main__":
    fetch_and_convert_shelters()