import os
import sqlite3

def create_sample_database():
    # Create SQLite database in the backend directory
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'document_management.db')
    
    # Connect to database (will create it if it doesn't exist)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Create documents table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        file_path TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    ''')
    
    # Create categories table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Create document_categories table (many-to-many relationship)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS document_categories (
        document_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        PRIMARY KEY (document_id, category_id),
        FOREIGN KEY (document_id) REFERENCES documents(id),
        FOREIGN KEY (category_id) REFERENCES categories(id)
    )
    ''')
    
    # Create messages/comments table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        document_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (document_id) REFERENCES documents(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    ''')
    
    # Add sample data - Users
    cursor.execute('''
    INSERT INTO users (username, email, password_hash, first_name, last_name, role)
    VALUES 
    ('admin', 'admin@example.com', 'pbkdf2:sha256:150000$ENCRYPTEDHASH', 'Admin', 'User', 'admin'),
    ('user1', 'user1@example.com', 'pbkdf2:sha256:150000$ENCRYPTEDHASH', 'John', 'Doe', 'user'),
    ('user2', 'user2@example.com', 'pbkdf2:sha256:150000$ENCRYPTEDHASH', 'Jane', 'Smith', 'user')
    ''')
    
    # Add sample data - Categories
    cursor.execute('''
    INSERT INTO categories (name, description)
    VALUES 
    ('Reports', 'Financial and project reports'),
    ('Contracts', 'Legal agreements and contracts'),
    ('Presentations', 'Slides and presentation materials'),
    ('Invoices', 'Bills and payment records')
    ''')
    
    # Add sample data - Documents
    cursor.execute('''
    INSERT INTO documents (title, description, file_path, file_type, file_size, user_id, status)
    VALUES 
    ('Q1 Financial Report', 'Financial summary for Q1 2023', '/uploads/q1_report.pdf', 'pdf', 1024000, 1, 'active'),
    ('Client Contract', 'Service agreement with Client X', '/uploads/contract_x.docx', 'docx', 512000, 2, 'active'),
    ('Project Proposal', 'New project proposal for review', '/uploads/proposal.pptx', 'pptx', 2048000, 2, 'pending'),
    ('Invoice #1001', 'Invoice for services rendered', '/uploads/invoice1001.pdf', 'pdf', 307200, 3, 'active')
    ''')
    
    # Add sample data - Document Categories
    cursor.execute('''
    INSERT INTO document_categories (document_id, category_id)
    VALUES 
    (1, 1), -- Q1 Report in Reports category
    (2, 2), -- Client Contract in Contracts category
    (3, 3), -- Project Proposal in Presentations category
    (4, 4)  -- Invoice in Invoices category
    ''')
    
    # Add sample data - Messages
    cursor.execute('''
    INSERT INTO messages (content, document_id, user_id)
    VALUES 
    ('Please review this report by end of week', 1, 1),
    ('I have some questions about section 3.2', 1, 2),
    ('Contract looks good, ready for signatures', 2, 3),
    ('Updated the proposal with new pricing', 3, 2)
    ''')
    
    # Commit changes and close connection
    conn.commit()
    conn.close()
    
    print(f"Sample database created at {db_path}")

if __name__ == "__main__":
    create_sample_database() 