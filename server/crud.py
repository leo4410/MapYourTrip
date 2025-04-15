from database import get_db_connection

def insert_waypoint(row, logger):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO waypoint("name", "description", "weather_condition", "weather_temperature", "uuid", "location_geom") 
            VALUES(%s, %s, %s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), %s));
            """,
            (row["display_name"], row["description"], row["weather_condition"], row["weather_temperature"], row["uuid"], row["location_lon"], row["location_lat"], 4326)
        )
        conn.commit()
        cur.close()
        conn.close()
        logger.info(f"Add waypoint {row["display_name"]} to database")
    except Exception as e:
        logger.error(f"Fehler beim Einfügen des Waypoint: {e}")
        logger.error(f"Fehler bei Zeile: {row}")  
        raise e  