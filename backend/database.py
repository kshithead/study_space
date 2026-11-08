import os
import sqlite3
from datetime import datetime
from typing import Optional, Dict, Any

DB_PATH = os.path.join(os.path.dirname(__file__), "studyspace.db")

# Default neutral avatar SVG as a clean, universal data URL
DEFAULT_AVATAR = (
    "data:image/svg+xml;utf8,"
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'>"
    "<defs>"
    "<linearGradient id='bg' x1='0%' y1='0%' x2='100%' y2='100%'>"
    "<stop offset='0%' stop-color='%236366f1'/>"
    "<stop offset='100%' stop-color='%238b5cf6'/>"
    "</linearGradient>"
    "</defs>"
    "<circle cx='64' cy='64' r='64' fill='url(%23bg)'/>"
    "<circle cx='64' cy='50' r='24' fill='%23ffffff' opacity='0.95'/>"
    "<path d='M24 108 c0 -22 18 -40 40 -40 s40 18 40 40 Z' fill='%23ffffff' opacity='0.95'/>"
    "</svg>"
)

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            full_name TEXT NOT NULL,
            avatar TEXT NOT NULL,
            bio TEXT DEFAULT '',
            learning_track TEXT DEFAULT 'General Studies',
            streak INTEGER DEFAULT 1,
            level INTEGER DEFAULT 1,
            level_name TEXT DEFAULT 'Explorer',
            xp INTEGER DEFAULT 150,
            xp_to_next INTEGER DEFAULT 1000,
            auth_provider TEXT DEFAULT 'local',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
    conn.close()

def create_user(
    user_id: str,
    email: str,
    hashed_password: str,
    full_name: str,
    avatar: Optional[str] = None,
    auth_provider: str = "local",
    learning_track: str = "General Studies"
) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    avatar_url = avatar.strip() if avatar and avatar.strip() else DEFAULT_AVATAR
    now = datetime.utcnow().isoformat()
    
    cursor.execute("""
        INSERT INTO users (
            id, email, hashed_password, full_name, avatar, auth_provider, learning_track, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (user_id, email.lower(), hashed_password, full_name, avatar_url, auth_provider, learning_track, now, now))
    
    conn.commit()
    conn.close()
    return get_user_by_id(user_id)

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email.lower().strip(),))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def update_user_profile(
    user_id: str,
    full_name: Optional[str] = None,
    avatar: Optional[str] = None,
    bio: Optional[str] = None,
    learning_track: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    
    fields = []
    values = []
    
    if full_name is not None:
        fields.append("full_name = ?")
        values.append(full_name.strip())
    if avatar is not None:
        fields.append("avatar = ?")
        values.append(avatar.strip() if avatar.strip() else DEFAULT_AVATAR)
    if bio is not None:
        fields.append("bio = ?")
        values.append(bio.strip())
    if learning_track is not None:
        fields.append("learning_track = ?")
        values.append(learning_track.strip())
        
    if not fields:
        conn.close()
        return get_user_by_id(user_id)
        
    fields.append("updated_at = ?")
    values.append(now)
    values.append(user_id)
    
    query = f"UPDATE users SET {', '.join(fields)} WHERE id = ?"
    cursor.execute(query, tuple(values))
    conn.commit()
    conn.close()
    return get_user_by_id(user_id)

# Initialize database on module load
init_db()

