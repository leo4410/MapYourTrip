from fastapi import FastAPI, File, UploadFile
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

app = FastAPI()

# add logger
logging.basicConfig(level=logging.INFO)  
logger = logging.getLogger(__name__)

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
        
        # open trip and extract data (need to us for loop later)
        with open(f"{extract_dir}/trip/marokko_14732894/trip.json", "r", encoding="utf-8") as f:
            daten = json.load(f)
            steps = daten["all_steps"]
                    
        # normalize json to extraxt nested fields
        df1 = pd.json_normalize(steps, sep='_')  

        # select relevant columns
        df1 = df1[["display_name", "description", "weather_condition", "weather_temperature", "uuid", "location_lon", "location_lat"]]
        df1["system"] = 4326
        
        waypoint_list_raw = df1.values.tolist()
        waypoint_list = waypoint_list_raw
                
        insert_waypoints(waypoint_list, logger)
            
        # open trip and extract data (need to us for loop later)
        with open(f"{extract_dir}/trip/marokko_14732894/locations.json", "r", encoding="utf-8") as f:
            daten = json.load(f)
            locations = daten["locations"]
            
        # normalize json to extraxt nested fields
        df2_from_json = pd.json_normalize(locations)  
        df2_from_json_sorted = df2_from_json.sort_values(by="time", ascending=True)
            
        df2 = df2_from_json_sorted[["lon", "lat"]]
        df2["system"] = 4326
        
        location_list_raw = df2.values.tolist()
        location_list = [(float(lon), float(lat), int(system)) for lat, lon, system in location_list_raw]

        # insert locations and store the ids
        inserted_location_ids = insert_locations(location_list, logger)
        inserted_locations_ids_array = np.array(inserted_location_ids)

        # create segment list and populate with values
        segments_list = []
        for i in range(inserted_locations_ids_array.size):
            if i < inserted_locations_ids_array.size-1:
                segments_list.append((1, int(inserted_locations_ids_array[i]), int(inserted_locations_ids_array[i+1]), int(inserted_locations_ids_array[i]), int(inserted_locations_ids_array[i+1])))
        
        # insert segments and store the ids
        inserted_segment_ids = insert_segments(segments_list, logger)
        
        # delete created directory
        shutil.rmtree(extract_dir)

        # good message   
        return {"message": f"ZIP-Datei erfolgreich entpackt nach {extract_dir}"}

    except Exception as e:
        # delete created directory
        shutil.rmtree(extract_dir)
        # bad message
        return {"error": str(e)}