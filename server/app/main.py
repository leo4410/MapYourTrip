import httpx
from fastapi import FastAPI, File, UploadFile, Query, Path, HTTPException
from io import BytesIO
import json
import logging
import numpy as np
import os
import pandas as pd
import shutil
import uuid
import zipfile
from crud import insert_waypoints, insert_locations, insert_segments
from functions.trip_functions import insert_trip
from functions.location_functions import get_location
from functions.segment_functions import get_segment, insert_segment, update_segment
from controllers import trip_controllers
from app.logger import logger
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.include_router(trip_controllers.router)

origins = [
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info("Application started!")

ORS_BASE_URL = "https://api.openrouteservice.org"
api_key_default = "5b3ce3597851110001cf62480bd839bf8084480dac4bf416bd48a88a"  # Optional, wenn du api_key nicht immer mitgeben willst


app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:3000"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)


@app.get("/route")
async def get_route(profile: str, segment_id: str):
    
    api_key: str = api_key_default  
    segment = get_segment(segment_id)
    
    # load start and end location from database
    start_loc_id = segment["fk_location_id_a"]
    end_loc_id=segment["fk_location_id_b"]
    
    start_loc=get_location(start_loc_id)
    end_loc=get_location(end_loc_id)
    print(start_loc)
    
    url = f"{ORS_BASE_URL}/v2/directions/{profile}"
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

# OpenElevationService
@app.get("v2/elevation/point/")
async def get_elevation_point(
    geometry: str, # geometry=13.349762,38.11295
    api_key: str = api_key_default
):
    url = f"{ORS_BASE_URL}/elevation/point"
    params = {
        "api_key": api_key,
        "geometry": geometry
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()

@app.get("/location/{location_id}")
async def get_location_api(location_id):
    location = get_location(location_id)
    if location is None:
        raise HTTPException(status_code=404, detail="Location not found")
    return location

@app.get("/segment/{segment_id}")
async def get_segment_api(segment_id):
    segment = get_segment(segment_id)
    if segment is None:
        raise HTTPException(status_code=404, detail="Segment not found")
    return segment

@app.post("/upload-zip/")
async def upload_zip(file: UploadFile = File(...)):
    try: 
        # read uploaded file
        file_content = await file.read()
        # convert to bytesio to use as zip file
        zip_file = BytesIO(file_content)

        with zipfile.ZipFile(zip_file, 'r') as zip_ref:
            # generate unique name and directory to unzip file
            extract_dir = str(uuid.uuid4())
            os.makedirs(extract_dir, exist_ok=True)
            # unzip file
            zip_ref.extractall(extract_dir)
            
        logger.info(f"Unpacked zip file.")    
        
        for trip_directory in os.listdir(f"{extract_dir}/trip/"):
            
            # open trip and extract data (need to us for loop later)
            with open(f"{extract_dir}/trip/{trip_directory}/trip.json", "r", encoding="utf-8") as f:
                daten = json.load(f)  
                # normalize json to extraxt nested steps
                steps =  daten["all_steps"]            

            # extract data from current trip
            trip_df_raw = pd.json_normalize(daten)
            step_df_raw = pd.json_normalize(steps, sep='_')
            
            if not step_df_raw.empty:
                
                logger.info(f"Start of trip: {trip_directory}")
                
                # select relevant columns from trip
                trip_df = trip_df_raw[["uuid", "name"]].copy()
                trip_df["fk_profile_id"] = 1
                
                trip_list = trip_df.to_numpy().tolist()[0]
                
                inserted_trip = insert_trip(trip_list, logger)
                inserted_trip_id = inserted_trip["id"]

                # select relevant columns from steps
                step_df = step_df_raw[["display_name", "description", "weather_condition", "weather_temperature", "uuid", "location_lon", "location_lat"]].copy()
                step_df["system"] = 4326
                
                # waypoint_list_raw = step_df.values.tolist()
                # waypoint_list = waypoint_list_raw
                        
                # insert_waypoints(waypoint_list, logger)
                    
                # open trip and extract data (need to us for loop later)
                with open(f"{extract_dir}/trip/{trip_directory}/locations.json", "r", encoding="utf-8") as f:
                    daten = json.load(f)
                    locations = daten["locations"]
                    
                # normalize json to extraxt nested fields
                df2_from_json = pd.json_normalize(locations)  
                df2_from_json_sorted = df2_from_json.sort_values(by="time", ascending=True)
                    
                df2 = df2_from_json_sorted[["lon", "lat"]]
                df2["system"] = 4326
                
                location_list_raw = df2.values.tolist()
                location_list = [(float(lon), float(lat), int(system)) for lon, lat, system in location_list_raw]

                # insert locations and store the ids
                inserted_location_ids = insert_locations(location_list, logger)
                inserted_locations_ids_array = np.array(inserted_location_ids)

                # create segment list and populate with values
                segments_list = []
                for i in range(inserted_locations_ids_array.size):
                    if i < inserted_locations_ids_array.size-1:
                        segments_list.append((inserted_trip_id, int(inserted_locations_ids_array[i]), int(inserted_locations_ids_array[i+1]), int(inserted_locations_ids_array[i]), int(inserted_locations_ids_array[i+1])))
                
                # insert segments and store the ids
                inserted_segment_ids = insert_segments(segments_list, logger)
            
                logger.info(f"End of trip: {trip_directory}")
            
            else:
                logger.info(f"Skip of trip: {trip_directory}. No locations provided!")
        
        # delete created directory
        shutil.rmtree(extract_dir)

        # good message   
        return {"message": f"ZIP-Datei erfolgreich entpackt nach {extract_dir}"}

    except Exception as e:
        # delete created directory
        shutil.rmtree(extract_dir)
        # bad message
        return {"error": str(e)}