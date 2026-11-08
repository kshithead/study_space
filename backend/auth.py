import os
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import bcrypt
import jwt
from fastapi import HTTPException, Security, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))
from backend import database

JWT_SECRET = os.getenv("JWT_SECRET", "studyspace_super_secure_jwt_secret_key_2026_xyz")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

security = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_access_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
        
    payload = {
        "sub": user_id,
        "exp": expire,
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_access_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("sub")
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None

def serialize_user(user: Dict[str, Any]) -> Dict[str, Any]:
    """Strip sensitive fields like hashed_password and return safe profile object."""
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["full_name"],
        "firstName": user["full_name"].split()[0] if user["full_name"] else "Student",
        "avatar": user["avatar"] or database.DEFAULT_AVATAR,
        "bio": user.get("bio", ""),
        "learningTrack": user.get("learning_track", "General Studies"),
        "handle": f"@{user['full_name'].split()[0].lower() if user['full_name'] else 'student'}.learns",
        "streak": user.get("streak", 1),
        "level": user.get("level", 1),
        "levelName": user.get("level_name", "Explorer"),
        "xp": user.get("xp", 150),
        "xpToNext": user.get("xp_to_next", 1000),
        "hoursThisWeek": 3.5,
        "joined": user.get("created_at", datetime.utcnow().strftime("%B %Y")),
        "interests": [user.get("learning_track", "General Studies"), "Learning Science", "Problem Solving"],
        "authProvider": user.get("auth_provider", "local")
    }

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Security(security)) -> Dict[str, Any]:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = decode_access_token(credentials.credentials)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    user = database.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    return user

