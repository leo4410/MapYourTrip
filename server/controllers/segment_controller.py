import httpx
from pydantic import BaseModel
from app.logger import logger
from fastapi import APIRouter, HTTPException
from functions.location_functions import get_location
from functions.segment_functions import get_segment, update_segment

router = APIRouter()

class RouteRequest(BaseModel):
    profile: str

@router.get("/segment/{segment_id}", tags=["segments"])
async def get_one(segment_id):
    segment = get_segment(segment_id)
    if segment is None:
        raise HTTPException(status_code=404, detail="Segment not found")
    return segment

ORS_BASE_URL = "https://api.openrouteservice.org"
ORS_API_KEY = "5b3ce3597851110001cf62480bd839bf8084480dac4bf416bd48a88a"  

@router.post("/segment/{segment_id}/route", tags=["segments"])
async def get_route(segment_id: str, request: RouteRequest):
    
    api_key: str = ORS_API_KEY  
    segment = get_segment(segment_id)
    
    # load start and end location from database
    start_loc_id = segment["fk_location_id_a"]
    end_loc_id=segment["fk_location_id_b"]
    
    start_loc=get_location(start_loc_id)
    end_loc=get_location(end_loc_id)
    
    url = f"{ORS_BASE_URL}/v2/directions/{request.profile}"
    params = {
        "api_key": api_key,
        "start": str(start_loc["lon"]) + "," + str(start_loc["lat"]),
        "end": str(end_loc["lon"]) + "," + str(end_loc["lat"])
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)
    
    # extract points on route
    route_points = response.json()["features"][0]["geometry"]["coordinates"]
    
    # insert to line over the passed points into db
    inserted_segment_id = update_segment(segment_id, route_points, 4326)
    logger.info(f"Insert segment with {inserted_segment_id}")

    return inserted_segment_id