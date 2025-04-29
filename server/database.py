import psycopg2
from psycopg2.extras import RealDictCursor
import json

def load_db_config():
    with open('config.json', 'r') as f:
        return json.load(f)

def get_db_connection():
    config = load_db_config()
    return psycopg2.connect(
        dbname=config["dbname"],
        user=config["user"],
        password=config["password"],
        host=config["host"],
        port=config["port"],
        cursor_factory=RealDictCursor
    )
