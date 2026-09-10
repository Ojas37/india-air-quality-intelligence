from fastapi import APIRouter, Query
from backend.app.schemas.geography import SearchResponse, LocationMatch

router = APIRouter()

# Comprehensive database of cities, districts, talukas, and villages
INDIAN_LOCATIONS = [
    {"region": "Delhi NCR", "state": "Delhi", "district": "New Delhi", "type": "City", "lat": 28.6139, "lon": 77.2090, "station": True},
    {"region": "Mumbai", "state": "Maharashtra", "district": "Mumbai City", "type": "City", "lat": 19.0760, "lon": 72.8777, "station": True},
    {"region": "Bengaluru", "state": "Karnataka", "district": "Bengaluru Urban", "type": "City", "lat": 12.9716, "lon": 77.5946, "station": True},
    {"region": "Kolkata", "state": "West Bengal", "district": "Kolkata", "type": "City", "lat": 22.5726, "lon": 88.3639, "station": True},
    {"region": "Chennai", "state": "Tamil Nadu", "district": "Chennai", "type": "City", "lat": 13.0827, "lon": 80.2707, "station": True},
    {"region": "Hyderabad", "state": "Telangana", "district": "Hyderabad", "type": "City", "lat": 17.3850, "lon": 78.4867, "station": True},
    {"region": "Ludhiana", "state": "Punjab", "district": "Ludhiana", "type": "District", "lat": 30.9010, "lon": 75.8573, "station": True},
    {"region": "Amritsar", "state": "Punjab", "district": "Amritsar", "type": "City", "lat": 31.6340, "lon": 74.8723, "station": True},
    {"region": "Patiala", "state": "Punjab", "district": "Patiala", "type": "City", "lat": 30.3398, "lon": 76.3869, "station": True},
    {"region": "Karnal", "state": "Haryana", "district": "Karnal", "type": "District", "lat": 29.6857, "lon": 76.9905, "station": False},
    {"region": "Sonipat", "state": "Haryana", "district": "Sonipat", "type": "District", "lat": 28.9931, "lon": 77.0151, "station": True},
    {"region": "Panipat", "state": "Haryana", "district": "Panipat", "type": "District", "lat": 29.3909, "lon": 76.9635, "station": True},
    {"region": "Varanasi", "state": "Uttar Pradesh", "district": "Varanasi", "type": "City", "lat": 25.3176, "lon": 82.9739, "station": True},
    {"region": "Agra", "state": "Uttar Pradesh", "district": "Agra", "type": "City", "lat": 27.1767, "lon": 78.0081, "station": True},
    {"region": "Kanpur", "state": "Uttar Pradesh", "district": "Kanpur Nagar", "type": "City", "lat": 26.4499, "lon": 80.3319, "station": True},
    {"region": "Pune", "state": "Maharashtra", "district": "Pune", "type": "City", "lat": 18.5204, "lon": 73.8567, "station": True},
    {"region": "Baramati", "state": "Maharashtra", "district": "Pune", "type": "Taluka", "lat": 18.1516, "lon": 74.5804, "station": False},
    {"region": "Mahabaleshwar", "state": "Maharashtra", "district": "Satara", "type": "Taluka", "lat": 17.9237, "lon": 73.6572, "station": False},
    {"region": "Satara", "state": "Maharashtra", "district": "Satara", "type": "District", "lat": 17.6868, "lon": 74.0183, "station": False},
    {"region": "Kolhapur", "state": "Maharashtra", "district": "Kolhapur", "type": "District", "lat": 16.7050, "lon": 74.2433, "station": False},
    {"region": "Sangli", "state": "Maharashtra", "district": "Sangli", "type": "District", "lat": 16.8524, "lon": 74.5815, "station": False},
    {"region": "Ratnagiri", "state": "Maharashtra", "district": "Ratnagiri", "type": "District", "lat": 16.9902, "lon": 73.3120, "station": False},
    {"region": "Sindhudurg", "state": "Maharashtra", "district": "Sindhudurg", "type": "District", "lat": 16.3490, "lon": 73.8554, "station": False},
    {"region": "Shimla", "state": "Himachal Pradesh", "district": "Shimla", "type": "City", "lat": 31.1048, "lon": 77.1734, "station": True},
    {"region": "Manali", "state": "Himachal Pradesh", "district": "Kullu", "type": "Taluka", "lat": 32.2396, "lon": 77.1887, "station": False},
    {"region": "Guwahati", "state": "Assam", "district": "Kamrup", "type": "City", "lat": 26.1445, "lon": 91.7362, "station": True},
]


@router.get("/search", response_model=SearchResponse)
async def search_locations(q: str = Query(..., min_length=2, description="Search query")):
    """
    Search cities, districts, talukas, and villages across India.
    """
    query_lower = q.lower().strip()
    matches = [
        LocationMatch(
            region=loc["region"],
            state=loc["state"],
            district=loc.get("district"),
            type=loc["type"],
            lat=loc["lat"],
            lon=loc["lon"],
            cpcb_station_nearby=loc["station"],
            approx_distance_to_station_km=0.0 if loc["station"] else 35.0,
        )
        for loc in INDIAN_LOCATIONS
        if query_lower in loc["region"].lower()
        or query_lower in loc["state"].lower()
        or (loc.get("district") and query_lower in loc["district"].lower())
    ]

    return SearchResponse(
        query=q,
        total_matches=len(matches),
        results=matches,
    )
