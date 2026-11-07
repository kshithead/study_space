import os
import uuid
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pypdf import PdfReader
import chromadb
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))
from backend.ai_service import ai_service

app = FastAPI(title="StudySpace AI Assistant API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
DB_DIR = os.path.join(os.path.dirname(__file__), "chroma_db")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(DB_DIR, exist_ok=True)

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

@app.get("/")
def read_root():
    return {"status": "ok", "message": "StudySpace AI Backend Engine Running"}

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

    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]

    sources = []
    context_passages = []
    for doc, meta in zip(documents, metadatas):
        context_passages.append(doc)
        sources.append({
            "title": meta.get("title"),
            "page": meta.get("page"),
            "filename": meta.get("filename")
        })

    if not context_passages:
        return {
            "answer": "I couldn't find any relevant topics in your uploaded notes matching that question.",
            "sources": [],
            "grounded": False,
            "provider": "None"
        }

    return ai_service.generate_grounded_answer(
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
