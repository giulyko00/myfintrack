import os
import time
import sys
import psycopg2
from psycopg2 import OperationalError

def wait_for_db():
    max_retries = 30
    count = 0
    
    while count < max_retries:
        try:
            conn = psycopg2.connect(
                dbname=os.environ.get("SQL_DATABASE"),
                user=os.environ.get("SQL_USER"),
                password=os.environ.get("SQL_PASSWORD"),
                host=os.environ.get("SQL_HOST", "db"),
                port=os.environ.get("SQL_PORT", 5432)
            )
            conn.close()
            print("Database is ready!")
            return True
        except OperationalError as e:
            count += 1
            print(f"Waiting for database... (Attempt {count}/{max_retries})")
            time.sleep(2)
    
    print("Failed to connect to database after maximum retries")
    return False

if __name__ == "__main__":
    sys.exit(0 if wait_for_db() else 1)
