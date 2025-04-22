from database import get_db_connection

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
      