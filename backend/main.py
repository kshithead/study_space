import os
import uuid
import re
import shutil
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr
from pypdf import PdfReader
import chromadb
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))
from backend.ai_service import ai_service
from backend import database, auth
from backend.auth import (
    get_current_user,
    serialize_user,
    hash_password,
    verify_password,
    create_access_token
)

app = FastAPI(title="StudySpace AI Assistant API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
AVATARS_DIR = os.path.join(UPLOAD_DIR, "avatars")
DB_DIR = os.path.join(os.path.dirname(__file__), "chroma_db")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(AVATARS_DIR, exist_ok=True)
os.makedirs(DB_DIR, exist_ok=True)

# Mount uploads directory for static access (profile pictures, materials)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Seed default demo student if not present
def seed_demo_user():
    demo_email = "alex.carter@studyspace.app"
    if not database.get_user_by_email(demo_email):
        database.create_user(
            user_id="usr_demo_alex",
            email=demo_email,
            hashed_password=hash_password("studyspace2026"),
            full_name="Alex Carter",
            avatar=database.DEFAULT_AVATAR,
            auth_provider="local",
            learning_track="Artificial Intelligence & ML"
        )
seed_demo_user()

# Use Chroma client without default ONNX embedding function to prevent slow 80MB downloads
chroma_client = chromadb.PersistentClient(path=DB_DIR)
collection = chroma_client.get_or_create_collection(
    name="course_materials_v2",
    metadata={"hnsw:space": "cosine"}
)

class ChatRequest(BaseModel):
    query: str
    doc_id: Optional[str] = None
    mode: Optional[str] = "auto"

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    avatar: Optional[str] = None
    learning_track: Optional[str] = "General Studies"

class LoginRequest(BaseModel):
    email: str
    password: str

class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None
    learning_track: Optional[str] = None

class OAuthVerifyRequest(BaseModel):
    provider: str
    code: Optional[str] = None
    token: Optional[str] = None

@app.get("/")
def read_root():
    return {"status": "ok", "message": "StudySpace AI Backend Engine Running"}

@app.get("/api/health")
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "studyspace-api"}

# ── Authentication Endpoints ──────────────────────────────────────────────────

@app.post("/api/auth/register")
async def register(req: RegisterRequest):
    email = req.email.strip().lower()
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")
    
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
        
    if not req.full_name or len(req.full_name.strip()) < 2:
        raise HTTPException(status_code=400, detail="Please provide your full name.")

    existing = database.get_user_by_email(email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please sign in instead."
        )

    user_id = f"usr_{uuid.uuid4().hex[:10]}"
    hashed_pw = hash_password(req.password)
    new_user = database.create_user(
        user_id=user_id,
        email=email,
        hashed_password=hashed_pw,
        full_name=req.full_name.strip(),
        avatar=req.avatar,
        auth_provider="local",
        learning_track=req.learning_track or "General Studies"
    )

    access_token = create_access_token(user_id=user_id)
    return {
        "status": "success",
        "message": "Account created successfully.",
        "access_token": access_token,
        "token": access_token,
        "token_type": "bearer",
        "user": serialize_user(new_user)
    }

@app.post("/api/auth/login")
async def login(req: LoginRequest):
    email = req.email.strip().lower()
    user = database.get_user_by_email(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials."
        )

    if not verify_password(req.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials."
        )

    access_token = create_access_token(user_id=user["id"])
    return {
        "status": "success",
        "message": "Signed in successfully.",
        "access_token": access_token,
        "token": access_token,
        "token_type": "bearer",
        "user": serialize_user(user)
    }

@app.get("/api/auth/me")
async def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    return {
        "status": "success",
        "user": serialize_user(current_user)
    }

@app.put("/api/auth/profile")
async def update_profile(
    req: ProfileUpdateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    updated = database.update_user_profile(
        user_id=current_user["id"],
        full_name=req.full_name,
        avatar=req.avatar,
        bio=req.bio,
        learning_track=req.learning_track
    )
    if not updated:
        raise HTTPException(status_code=404, detail="User account not found.")

    return {
        "status": "success",
        "message": "Profile updated successfully.",
        "user": serialize_user(updated)
    }

@app.post("/api/auth/avatar/upload")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Please upload a JPG, PNG, WebP, or SVG image."
        )

    ext = os.path.splitext(file.filename)[1].lower() or ".jpg"
    filename = f"avatar_{current_user['id']}_{uuid.uuid4().hex[:6]}{ext}"
    file_path = os.path.join(AVATARS_DIR, filename)

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Return the static relative path or data URL
    avatar_url = f"http://127.0.0.1:8000/uploads/avatars/{filename}"
    
    # Automatically update the user profile with new avatar
    updated = database.update_user_profile(
        user_id=current_user["id"],
        avatar=avatar_url
    )

    return {
        "status": "success",
        "avatar_url": avatar_url,
        "user": serialize_user(updated)
    }

@app.get("/api/auth/oauth/{provider}/url")
async def get_oauth_url(provider: str):
    provider = provider.lower()
    if provider == "google":
        client_id = os.getenv("GOOGLE_CLIENT_ID")
        if not client_id:
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="Google OAuth is not configured on this server. Please use Email/Password sign in, or set GOOGLE_CLIENT_ID in the backend environment."
            )
        redirect_uri = os.getenv("OAUTH_REDIRECT_URI", "http://localhost:5173/login?oauth=google")
        url = (
            f"https://accounts.google.com/o/oauth2/v2/auth?"
            f"client_id={client_id}&response_type=code&scope=openid%20email%20profile&"
            f"redirect_uri={redirect_uri}&access_type=offline"
        )
        return {"provider": "google", "auth_url": url}

    elif provider == "github":
        client_id = os.getenv("GITHUB_CLIENT_ID")
        if not client_id:
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="GitHub OAuth is not configured on this server. Please use Email/Password sign in, or set GITHUB_CLIENT_ID in the backend environment."
            )
        redirect_uri = os.getenv("OAUTH_REDIRECT_URI", "http://localhost:5173/login?oauth=github")
        url = f"https://github.com/login/oauth/authorize?client_id={client_id}&scope=user:email&redirect_uri={redirect_uri}"
        return {"provider": "github", "auth_url": url}

    elif provider == "apple":
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Apple Sign-In requires an active Apple Developer Team ID and configured Service ID. Please use Email/Password sign in."
        )
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported OAuth provider: {provider}")

@app.post("/api/auth/oauth/{provider}/verify")
async def verify_oauth_login(provider: str, req: OAuthVerifyRequest):
    provider = provider.lower()
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"Direct verification for {provider.capitalize()} requires server-side OAuth secret keys configured in .env."
    )

@app.get("/api/ai/status")
def get_ai_status():
    has_gemini = bool(os.getenv("GEMINI_API_KEY"))
    ollama_ready = ai_service._is_ollama_alive()
    return {
        "gemini_cloud": {
            "available": has_gemini,
            "configured": has_gemini,
            "model": "gemini-3.5-flash-lite",
            "name": "Google Gemini (gemini-3.5-flash-lite)"
        },
        "ollama_local": {
            "available": ollama_ready,
            "model": ai_service.local_model,
            "name": f"Local Ollama ({ai_service.local_model})"
        },
        "active_mode": "gemini" if has_gemini else ("ollama" if ollama_ready else "extractive_fallback")
    }

@app.post("/api/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    course: Optional[str] = Form("General Studies")
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are currently supported")

    doc_id = f"doc_{uuid.uuid4().hex[:8]}"
    file_path = os.path.join(UPLOAD_DIR, f"{doc_id}_{file.filename}")
    
    with open(file_path, "wb") as f:
        f.write(await file.read())

    try:
        reader = PdfReader(file_path)
        chunks = []
        metadatas = []
        ids = []

        chunk_counter = 0
        for page_idx, page in enumerate(reader.pages):
            text = page.extract_text()
            if not text:
                continue
            words = text.split()
            current_chunk = []
            current_len = 0
            for w in words:
                current_chunk.append(w)
                current_len += len(w) + 1
                if current_len >= 600:
                    chunk_text = " ".join(current_chunk)
                    chunk_id = f"{doc_id}_p{page_idx+1}_c{chunk_counter}"
                    chunks.append(chunk_text)
                    metadatas.append({
                        "doc_id": doc_id,
                        "filename": file.filename,
                        "title": title or file.filename,
                        "course": course,
                        "page": page_idx + 1
                    })
                    ids.append(chunk_id)
                    chunk_counter += 1
                    current_chunk = []
                    current_len = 0
            
            if current_chunk:
                chunk_text = " ".join(current_chunk)
                chunk_id = f"{doc_id}_p{page_idx+1}_c{chunk_counter}"
                chunks.append(chunk_text)
                metadatas.append({
                    "doc_id": doc_id,
                    "filename": file.filename,
                    "title": title or file.filename,
                    "course": course,
                    "page": page_idx + 1
                })
                ids.append(chunk_id)
                chunk_counter += 1

        if not chunks:
            raise HTTPException(status_code=400, detail="No readable text found in document.")

        # Compute embeddings via Gemini
        embeddings = ai_service.get_embeddings(chunks)

        if embeddings:
            collection.add(
                documents=chunks,
                embeddings=embeddings,
                metadatas=metadatas,
                ids=ids
            )
        else:
            # Fallback: store documents directly
            collection.add(
                documents=chunks,
                metadatas=metadatas,
                ids=ids
            )

        return {
            "status": "success",
            "doc_id": doc_id,
            "filename": file.filename,
            "title": title or file.filename,
            "total_pages": len(reader.pages),
            "chunks_indexed": len(chunks)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")

@app.post("/api/study/chat")
async def study_chat(req: ChatRequest):
    where_filter = {"doc_id": req.doc_id} if req.doc_id else None

    # Embed query using Gemini
    query_embeddings = ai_service.get_embeddings([req.query])

    results = {}
    try:
        if query_embeddings:
            results = collection.query(
                query_embeddings=query_embeddings,
                n_results=3,
                where=where_filter
            )
        else:
            results = collection.query(
                query_texts=[req.query],
                n_results=3,
                where=where_filter
            )
    except Exception as e:
        # If collection is empty, proceed with general conversation
        results = {}

    documents = results.get("documents", [[]])[0] if results.get("documents") else []
    metadatas = results.get("metadatas", [[]])[0] if results.get("metadatas") else []

    sources = []
    context_passages = []
    for doc, meta in zip(documents, metadatas):
        if doc and meta:
            context_passages.append(doc)
            sources.append({
                "title": meta.get("title"),
                "page": meta.get("page"),
                "filename": meta.get("filename")
            })

    # Call AI service with or without context — it handles both!
    return ai_service.answer_query(
        query=req.query,
        context_passages=context_passages,
        sources=sources,
        mode=req.mode or "auto"
    )

@app.get("/api/documents")
def list_documents():
    all_data = collection.get()
    unique_docs = {}
    for meta in all_data.get("metadatas", []):
        if not meta:
            continue
        did = meta.get("doc_id")
        if did and did not in unique_docs:
            unique_docs[did] = {
                "doc_id": did,
                "title": meta.get("title"),
                "filename": meta.get("filename"),
                "course": meta.get("course"),
                "chunks": 0
            }
        if did in unique_docs:
            unique_docs[did]["chunks"] += 1

    return list(unique_docs.values())
