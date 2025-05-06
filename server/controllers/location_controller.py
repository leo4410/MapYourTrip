from fastapi import APIRouter, HTTPException
from functions.location_functions import get_location

router = APIRouter()

@router.get("/location/{location_id}", tags=["locations"])
async def get_one(location_id):
    location = get_location(location_id)
    if location is None:
        raise HTTPException(status_code=404, detail="Location not found")
    return location
