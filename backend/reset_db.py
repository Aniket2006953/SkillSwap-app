from pymongo import MongoClient
import sys

def reset_mongodb():
    try:
        # Connect to local MongoDB
        client = MongoClient('mongodb://localhost:27017/')
        db_name = 'backend_db'
        
        print(f"Connecting to MongoDB and dropping database: {db_name}...")
        client.drop_database(db_name)
        print(f"Database '{db_name}' dropped successfully.")
        client.close()
    except Exception as e:
        print(f"Error resetting database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    reset_mongodb()
