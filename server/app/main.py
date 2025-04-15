from fastapi import FastAPI, File, UploadFile, Query, Path, HTTPException
from io import BytesIO
import json
import logging
import os
import pandas as pd
import shutil
import uuid
import zipfile
from crud import insert_waypoint, insert_location
import httpx

app = FastAPI()

# add logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

ORS_BASE_URL = "https://api.openrouteservice.org"
api_key_default = "5b3ce3597851110001cf62480bd839bf8084480dac4bf416bd48a88a"  # Optional, wenn du api_key nicht immer mitgeben willst

@app.get("/v2/route/")
async def get_route(
    profile: str,
    start: str,
    end: str,
    api_key: str = api_key_default  # falls kein api_key mitgegeben wird
):
    print(f"Transportprofil: {profile}")

    url = f"{ORS_BASE_URL}/v2/directions/{profile}"
    params = {
        "api_key": api_key,
        "start": start,
        "end": end
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()

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
        auswahl = df1[["id", "display_name", "description", "weather_condition", "weather_temperature", "uuid", "location_lon", "location_lat"]]

        for index, row in auswahl.iterrows():
            insert_waypoint(row, logger)

        # open trip and extract data (need to us for loop later)
        with open(f"{extract_dir}/trip/marokko_14732894/locations.json", "r", encoding="utf-8") as f:
            daten = json.load(f)
            locations = daten["locations"]

        # normalize json to extraxt nested fields
        df2 = pd.json_normalize(locations)

        for index, row in df2.iterrows():
            insert_location(row, logger)

        # delete created directory
        shutil.rmtree(extract_dir)

        # good message  
        return {"message": f"ZIP-Datei erfolgreich entpackt nach {extract_dir}"}

    except Exception as e:
        # bad message
        return {"error": str(e)}