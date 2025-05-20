#!/bin/bash
source {working_directory}/MapYourTrip/server/mapyourtrip_env/bin/activate
exec {working_directory}/MapYourTrip/server/mapyourtrip_env/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000