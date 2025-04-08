from fastapi import FastAPI, File, UploadFile
from io import BytesIO
import os
import shutil
import uuid
import zipfile

app = FastAPI()

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
            # delete created directory
            shutil.rmtree(extract_dir)
        
        # good message   
        return {"message": f"ZIP-Datei erfolgreich entpackt nach {extract_dir}"}

    except Exception as e:
        # bad message
        return {"error": str(e)}