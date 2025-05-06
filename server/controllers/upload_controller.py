from fastapi import APIRouter, File, HTTPException, UploadFile
from io import BytesIO
import json
import numpy as np
import os
import pandas as pd
import shutil
import uuid
import zipfile
from functions.trip_functions import insert_trip
from functions.location_functions import insert_locations
from functions.segment_functions import insert_segments
from app.logger import logger

router = APIRouter()

@router.post("/upload-zip/", tags=["upload"])
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
                df2["fk_trip_id"] = inserted_trip_id
                
                location_list_raw = df2.values.tolist()
                location_list = [(float(lon), float(lat), int(system), int(fk_trip_id)) for lon, lat, system, fk_trip_id in location_list_raw]

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