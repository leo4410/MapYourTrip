from fastapi import FastAPI, File, UploadFile
from io import BytesIO
import json
import logging
import os
import pandas as pd
import shutil
import uuid
import zipfile
from crud import insert_waypoint

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
        df = pd.json_normalize(steps, sep='_')  

        # select relevant columns
        auswahl = df[["id", "display_name", "description", "weather_condition", "weather_temperature", "uuid", "location_lon", "location_lat"]]
                
        for index, row in auswahl.iterrows():
            insert_waypoint(row, logger)
        
        # delete created directory
        shutil.rmtree(extract_dir)

        # good message   
        return {"message": f"ZIP-Datei erfolgreich entpackt nach {extract_dir}"}

    except Exception as e:
        # bad message
        return {"error": str(e)}