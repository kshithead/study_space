# StudySpace — AI-Powered Personal Learning Assistant

A document-grounded learning platform combining **RAG**, **AI-generated practice**, **learning analytics**, and **personalized study planning**.

---

## 🌟 Key Features

1. **Document-Grounded RAG Tutor**: Upload course lecture notes (PDFs), ask questions, and receive grounded answers backed by specific page references and citations.
2. **AI Practice (Quizzes & Flashcards)**: Generate contextual practice questions (MCQs) and active recall flashcards straight from lecture contents.
3. **Weak-Topic Learning Analytics**: Automatically track question accuracy across topics to identify concepts needing revision.
4. **Personalized Study Planner**: Generate structured study schedules based on exam dates, daily available study hours, and weak topics.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Base UI, Recharts, Lucide Icons
- **Backend API**: Python 3.14, FastAPI, Uvicorn, Pydantic
- **Document Processing & RAG**: PyPDF, ChromaDB (Vector Store), Google Gemini API
- **State Management**: React Context with LocalStorage persistence

---

## 🚀 Running the Project Locally

### 1. Frontend Setup
```bash
# Navigate to the root directory
npm install
npm run dev
```
The React application will be available at `http://localhost:5173/`.

### 2. Backend Setup
```bash
# Activate python virtual environment
./venv/Scripts/activate

# Run FastAPI server
uvicorn backend.main:app --reload --port 8000
```
The interactive API documentation (Swagger UI) is accessible at `http://localhost:8000/docs`.

---

## 👥 Authors
Major Project — Department of Computer Engineering, Vishwakarma University, Pune.
