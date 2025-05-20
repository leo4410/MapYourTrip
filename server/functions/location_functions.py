from database import get_db_connection
from psycopg2.extras import execute_values

def get_location(id):
    try:
        # query for database select
        query = "SELECT id, ST_Y(location_geom) AS lat, ST_X(location_geom) AS lon, fk_trip_id FROM location WHERE id = %s;"
        
        # set up db connection
        conn = get_db_connection()
        cur = conn.cursor()

        # get object from database
        cur.execute(query, (id,))
        location =  dict(cur.fetchone())
        
        # close db connection
        conn.commit()
        cur.close()
        conn.close()

        return location
    
    except Exception as exception:
        raise exception
    
    
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
        logger.info(f'Add location {row["lat"]}/{row["lon"]} to database')
    except Exception as e:
        logger.error(f"Fehler beim Einfügen der Location: {e}")
        logger.error(f"Fehler bei Zeile: {row}")  
        raise e  
    
    
def insert_locations(location_list, logger):
    try:
        # query for database insert with one argument (required for execute_values)
        insert_query = """
        INSERT INTO location("location_geom", "fk_trip_id") 
        VALUES %s
        RETURNING id;
        """
        
        # template with arguments to pass for database insert
        template = "((ST_SetSRID(ST_MakePoint(%s, %s), %s)), %s)"

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
      