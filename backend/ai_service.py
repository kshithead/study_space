import os
import urllib.request
import json
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

# Load .env file automatically
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

class HybridAIService:
    """
    Multi-tier Hybrid AI Inference Engine:
    1. Primary: Google Gemini Cloud API (gemini-3.5-flash-lite / gemini-3.8-flash)
    2. Embeddings: gemini-embedding-001
    3. Secondary: Local Ollama Model for offline privacy
    4. Fallback: Context-extractive synthesis
    """

    def __init__(self):
        self.ollama_base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.local_model = os.getenv("OLLAMA_MODEL", "llama3")

    def _is_ollama_alive(self) -> bool:
        try:
            req = urllib.request.Request(f"{self.ollama_base_url}/api/tags", headers={"User-Agent": "StudySpace"})
            with urllib.request.urlopen(req, timeout=1.5) as resp:
                return resp.status == 200
        except Exception:
            return False

    def get_embeddings(self, texts: List[str]) -> Optional[List[List[float]]]:
        """Compute embeddings using gemini-embedding-001 (fast cloud vectorization)."""
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return None
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            embeddings = []
            # Batch or iterate
            for t in texts:
                res = client.models.embed_content(
                    model='gemini-embedding-001',
                    contents=t[:2000] # clamp chunk length
                )
                embeddings.append(res.embeddings[0].values)
            return embeddings
        except Exception as e:
            print(f"[Gemini Embeddings Error] {e}")
            return None

    def _query_gemini(self, prompt: str, api_key: str) -> Optional[str]:
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            # Try 3.5-flash-lite first, fallback to 3.8-flash
            for m in ['gemini-3.5-flash-lite', 'gemini-3.8-flash']:
                try:
                    response = client.models.generate_content(
                        model=m,
                        contents=prompt
                    )
                    return response.text
                except Exception as model_err:
                    print(f"Model {m} error: {model_err}")
            return None
        except Exception as e:
            print(f"[Gemini Cloud Error] {e}")
            return None

    def _query_ollama(self, prompt: str) -> Optional[str]:
        try:
            payload = json.dumps({
                "model": self.local_model,
                "prompt": prompt,
                "stream": False
            }).encode("utf-8")
            req = urllib.request.Request(
                f"{self.ollama_base_url}/api/generate",
                data=payload,
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=30) as resp:
                res = json.loads(resp.read().decode())
                return res.get("response")
        except Exception as e:
            print(f"[Ollama Local Error] {e}")
            return None

    def generate_grounded_answer(
        self,
        query: str,
        context_passages: List[str],
        sources: List[Dict[str, Any]],
        mode: str = "auto"
    ) -> Dict[str, Any]:
        """
        Synthesizes an answer grounded strictly in retrieved document passages.
        """
        joined_context = "\n---\n".join(context_passages)
        prompt = f"""You are the AI Personal Learning Assistant for a college engineering student.
Answer the student's question using the provided course notes below.
Be clear, comprehensive, and helpful. Mention relevant definitions and steps if applicable.
If the notes do not have enough information to answer, state what is mentioned in the notes and politely clarify that further details are not in the uploaded material.

Context from Student Notes:
{joined_context}

Student Question:
{query}
"""

        gemini_key = os.getenv("GEMINI_API_KEY")

        # 1. Try Gemini Cloud
        if mode in ("auto", "cloud") and gemini_key:
            ans = self._query_gemini(prompt, gemini_key)
            if ans:
                return {
                    "answer": ans,
                    "provider": "Google Gemini Cloud (gemini-3.5-flash-lite)",
                    "mode": "cloud",
                    "sources": sources,
                    "grounded": True
                }

        # 2. Try Local Ollama
        if mode in ("auto", "local") and self._is_ollama_alive():
            ans = self._query_ollama(prompt)
            if ans:
                return {
                    "answer": ans,
                    "provider": f"Local AI ({self.local_model} via Ollama)",
                    "mode": "local",
                    "sources": sources,
                    "grounded": True
                }

        # 3. Fallback: Extractive Grounding
        top_src = sources[0] if sources else {}
        page_ref = f" (Page {top_src.get('page')})" if top_src.get('page') else ""
        first_pass = context_passages[0] if context_passages else ""

        return {
            "answer": f"Excerpt from your notes{page_ref}:\n\n{first_pass.strip()}",
            "provider": "Extractive Fallback",
            "mode": "fallback",
            "sources": sources,
            "grounded": True
        }

ai_service = HybridAIService()
