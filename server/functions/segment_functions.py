from database import get_db_connection
from psycopg2.extensions import AsIs

def get_segment(id):
    try:
        # query for database select
        query = "SELECT * FROM segment WHERE id = %s;"
        
        # set up db connection
        conn = get_db_connection()
        cur = conn.cursor()

        # get object from database
        cur.execute(query, (id,))
        segment = dict(cur.fetchone())
        
        # close db connection
        conn.commit()
        cur.close()
        conn.close()

        return segment
    
    except Exception as exception:
        raise exception


def insert_segment(start_location, end_location, points, epsg):
    try:
        # query for database insert with one argument (required for execute_values)
        insert_query = """
        INSERT INTO segment("fk_trip_id", "fk_location_id_a", "fk_location_id_b", "segment_geom") 
        VALUES (%s,%s,%s,ST_MakeLine(ARRAY[%s]))
        RETURNING id;
        """
        
        # sql string with points to insert 
        points_sql = ','.join(f'ST_SetSRID(ST_MakePoint({p[0]}, {p[1]}), {int(epsg)})' for p in points)
        
        # set up db connection
        conn = get_db_connection()
        cur = conn.cursor()

        # insert segment into db
        cur.execute(insert_query, (1,start_location,end_location,AsIs(points_sql)))
        segment_id = dict(cur.fetchone())

        # close db connection
        conn.commit()
        cur.close()
        conn.close()
        
        return segment_id
    
    except Exception as e:
        raise e  
