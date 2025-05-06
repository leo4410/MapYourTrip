from database import get_db_connection
from psycopg2.extras import execute_values

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
        # query for database insert with one argument (required for execute_values)
        insert_query = """
        INSERT INTO location("location_geom") 
        VALUES %s
        RETURNING id;
        """
        
        # template with arguments to pass for database insert
        template = "(ST_SetSRID(ST_MakePoint(%s, %s), %s))"

        # set up db connection
        conn = get_db_connection()
        cur = conn.cursor()

        # insert multiple locations
        location_ids_dict = execute_values(cur, insert_query, location_list, template=template, fetch=True)
    
        # get inserted location ids in the correct order
        location_ids = [row['id'] for row in location_ids_dict]
        
        # close db connection
        conn.commit()
        cur.close()
        conn.close()
        
        logger.info(f"Add locations")
        return location_ids
    
    except Exception as e:
        logger.error(f"Fehler beim Einfügen der Locations: {e}")
        raise e  
    
       
def insert_segments(segment_list, logger):
    try:
        # query for database insert with one argument (required for execute_values)
        insert_query = """
        INSERT INTO segment("fk_trip_id", "fk_location_id_a", "fk_location_id_b", "segment_geom") 
        VALUES %s
        RETURNING id;
        """
        
        # template with arguments to pass for database insert
        template = "(%s,%s,%s,ST_MakeLine((SELECT location_geom FROM location WHERE id=%s), (SELECT location_geom FROM location WHERE id=%s)))"

        # set up db connection
        conn = get_db_connection()
        cur = conn.cursor()

        # insert multiple segments
        execute_values(cur, insert_query, segment_list, template=template)

        # get inserted segment ids in the correct order
        segment_ids = [row['id'] for row in cur.fetchall()]
        
        # close db connection
        conn.commit()
        cur.close()
        conn.close()
        
        logger.info(f"Add segments")
        return segment_ids
    
    except Exception as e:
        logger.error(f"Fehler beim Einfügen der Segments: {e}")
        raise e  
    