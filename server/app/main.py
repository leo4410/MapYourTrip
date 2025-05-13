from app.logger import logger
from controllers import location_controller, segment_controller, trip_controller,  upload_controller
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# tags for fastapi documentation
documentation_tags = [
    {
        "name": "locations",
        "description": "Operations with locations.",
    }, 
    {
        "name": "segments",
        "description": "Operations with segments. The **routing** logic is also here.",
    }, 
    {
        "name": "trips",
        "description": "Operations with trips.",
    }, 

        {
        "name": "upload",
        "description": "Operations to upload data.",
    }
]

# set up application and include all controllers
app = FastAPI(openapi_tags=documentation_tags)
app.include_router(location_controller.router)
app.include_router(segment_controller.router)
app.include_router(trip_controller.router)
app.include_router(upload_controller.router)

ORS_BASE_URL = "https://api.openrouteservice.org"
api_key_default = "5b3ce3597851110001cf62480bd839bf8084480dac4bf416bd48a88a"  # Optional, wenn du api_key nicht immer mitgeben willst

# define cors allowed origins
origins = [
    "http://localhost:3000"
]

# set further cors settings and allow defined origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
