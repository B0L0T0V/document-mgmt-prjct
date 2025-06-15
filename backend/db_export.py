# --- Скрипт для экспорта базы данных ---
# Экспортирует данные из PostgreSQL в SQLite, копирует структуру и данные таблиц
import os
import subprocess
import sys
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker
import json
import sqlite3

# Try to determine the actual database URL from config
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from config import Config

def export_database():
    db_url = Config.SQLALCHEMY_DATABASE_URI
    print(f"Database URL: {db_url}")
    
    if 'postgresql' in db_url:
        # For PostgreSQL, we'll create a SQLite file with the same schema and data
        try:
            # Extract connection details
            if '://' in db_url:
                _, connection_string = db_url.split('://', 1)
                if '@' in connection_string:
                    auth, location = connection_string.split('@', 1)
                    if ':' in auth:
                        username, password = auth.split(':', 1)
                    else:
                        username, password = auth, ''
                    
                    if '/' in location:
                        host_port, dbname = location.split('/', 1)
                        if ':' in host_port:
                            host, port = host_port.split(':', 1)
                        else:
                            host, port = host_port, '5432'
                    else:
                        host, port, dbname = location, '5432', ''
            
            # Create SQLAlchemy engine to connect to PostgreSQL
            engine = create_engine(db_url)
            inspector = inspect(engine)
            
            # Create a new SQLite database file
            sqlite_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'document_management.db')
            if os.path.exists(sqlite_path):
                os.remove(sqlite_path)
            
            sqlite_conn = sqlite3.connect(sqlite_path)
            sqlite_cursor = sqlite_conn.cursor()
            
            # Get all tables from PostgreSQL
            tables = inspector.get_table_names()
            print(f"Tables found: {tables}")
            
            # For each table, create it in SQLite and copy data
            for table_name in tables:
                # Get table columns
                columns = inspector.get_columns(table_name)
                column_defs = []
                
                for column in columns:
                    name = column['name']
                    type_name = str(column['type'])
                    if 'INT' in type_name.upper():
                        type_name = 'INTEGER'
                    elif 'VARCHAR' in type_name.upper() or 'TEXT' in type_name.upper():
                        type_name = 'TEXT'
                    elif 'FLOAT' in type_name.upper() or 'DOUBLE' in type_name.upper() or 'NUMERIC' in type_name.upper():
                        type_name = 'REAL'
                    elif 'BOOLEAN' in type_name.upper():
                        type_name = 'INTEGER'
                    elif 'DATETIME' in type_name.upper() or 'TIMESTAMP' in type_name.upper():
                        type_name = 'TEXT'
                    else:
                        type_name = 'TEXT'
                    
                    nullable = "" if column.get('nullable', True) else "NOT NULL"
                    default = f"DEFAULT {column.get('default')}" if column.get('default') is not None else ""
                    
                    # Special case for primary key
                    if column.get('primary_key', False):
                        column_def = f"{name} {type_name} PRIMARY KEY"
                    else:
                        column_def = f"{name} {type_name} {nullable} {default}".strip()
                    
                    column_defs.append(column_def)
                
                # Create table in SQLite
                create_table_sql = f"CREATE TABLE {table_name} ({', '.join(column_defs)})"
                try:
                    sqlite_cursor.execute(create_table_sql)
                    print(f"Created table {table_name}")
                except sqlite3.Error as e:
                    print(f"Error creating table {table_name}: {e}")
                
                # Copy data
                try:
                    # Get data from PostgreSQL
                    with engine.connect() as conn:
                        result = conn.execute(f"SELECT * FROM {table_name}")
                        rows = result.fetchall()
                        
                    if rows:
                        # Get column names
                        col_names = [col['name'] for col in columns]
                        placeholders = ', '.join(['?' for _ in col_names])
                        
                        # Insert data into SQLite
                        insert_sql = f"INSERT INTO {table_name} ({', '.join(col_names)}) VALUES ({placeholders})"
                        for row in rows:
                            # Convert row to list
                            row_data = [str(item) if item is not None else None for item in row]
                            sqlite_cursor.execute(insert_sql, row_data)
                        
                        print(f"Copied {len(rows)} rows to table {table_name}")
                except Exception as e:
                    print(f"Error copying data for table {table_name}: {e}")
            
            # Commit changes and close connections
            sqlite_conn.commit()
            sqlite_conn.close()
            
            print(f"Database exported to {sqlite_path}")
            
        except Exception as e:
            print(f"Error exporting database: {e}")
            raise
    else:
        print("The database is not PostgreSQL. It may already be a file-based database.")

# --- Основная функция экспорта ---
if __name__ == "__main__":
    export_database()

# --- Запуск скрипта --- 