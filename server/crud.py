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
    
def insert_waypoints(value_list, logger):
    try:
        insert_query = """
        INSERT INTO waypoint("name", "description", "weather_condition", "weather_temperature", "uuid", "location_geom") 
        VALUES(%s, %s, %s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), %s));
        """
        conn = get_db_connection()
        cur = conn.cursor()
        cur.executemany(insert_query, value_list)
        conn.commit()
        cur.close()
        conn.close()
        logger.info(f"Add waypoint to database")
    except Exception as e:
        logger.error(f"Fehler beim Einfügen des Waypoint: {e}")
        logger.error(f"Fehler bei Zeile: ")  
        raise e  
    
def insert_location(row, logger):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO location("location_geom") 
            VALUES(ST_SetSRID(ST_MakePoint(%s, %s), %s));
            """,
            (float(row["lon"]), float(row["lat"]), 4326)
        )
        conn.commit()
        cur.close()
        conn.close()
        logger.info(f"Add location {row["lat"]}/{row["lon"]} to database")
    except Exception as e:
        logger.error(f"Fehler beim Einfügen der Location: {e}")
        logger.error(f"Fehler bei Zeile: {row}")  
        raise e  

def insert_locations(location_list, logger):
    try:
        insert_query = """
        INSERT INTO location("location_geom") 
        VALUES(ST_SetSRID(ST_MakePoint(%s, %s), %s));
        """
        conn = get_db_connection()
        cur = conn.cursor()
        cur.executemany(insert_query, location_list)
        conn.commit()
        cur.close()
        conn.close()
        logger.info(f"Add location")
    except Exception as e:
        logger.error(f"Fehler beim Einfügen der Location: {e}")
        logger.error(f"Fehler bei Zeile: ")  
        raise e  
    