from database import get_db_connection

def get_location(id):
    try:
        # query for database select
        query = "SELECT id, ST_Y(location_geom) AS lat, ST_X(location_geom) AS lon FROM location WHERE id = %s;"
        
        # set up db connection
        conn = get_db_connection()
        cur = conn.cursor()

        # get object from database
        cur.execute(query, (id,))
        location = cur.fetchone()
        
        # close db connection
        conn.commit()
        cur.close()
        conn.close()

        return location
    
    except Exception as exception:
        raise exception
      