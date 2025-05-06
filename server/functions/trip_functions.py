from database import get_db_connection

def get_trips():
    try:
        # query for database select
        query = "SELECT * FROM trip;"
        
        # set up db connection
        conn = get_db_connection()
        cur = conn.cursor()

        # get object from database
        cur.execute(query)
        trips = cur.fetchall()
        
        # close db connection
        conn.commit()
        cur.close()
        conn.close()

        return trips
    
    except Exception as exception:
        raise exception
    
    
def insert_trip(trip, logger):
    #try:
    # query for database insert with one argument (required for execute_values)
    insert_query = """
    INSERT INTO Trip ("uuid", "name", "fk_profile_id") 
    VALUES (%s,%s,%s)
    RETURNING id;
    """
    #"fk_cover_id", "summary","start_date", "end_date", "creation_time","fk_timezone_id"
    
    # set up db connection
    conn = get_db_connection()
    cur = conn.cursor()

    # insert trip into db
    cur.execute(insert_query, trip)
    trip_id = dict(cur.fetchone())

    # close db connection
    conn.commit()
    cur.close()
    conn.close()
    
    return trip_id
    
    # except Exception as e:
    #     logger.error(e)
    #     raise e  