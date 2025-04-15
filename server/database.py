import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(
        dbname="db_test",
        user="postgres",
        password="postgres",
        host="localhost",
        port="5432",
        cursor_factory=RealDictCursor
    )