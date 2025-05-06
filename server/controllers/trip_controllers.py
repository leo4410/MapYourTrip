from fastapi import APIRouter
from fastapi import HTTPException
from functions.trip_functions import get_trips

router = APIRouter()

@router.get("/trips")
async def get_trips_controller():
    trips = get_trips()
    if trips is None:
        raise HTTPException(status_code=404, detail="Trips not found")
    return trips