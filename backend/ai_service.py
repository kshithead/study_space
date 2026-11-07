import os
import urllib.request
import json
from typing import List, Dict, Any, Optional

class HybridAIService:
    """
    Multi-tier Hybrid AI Inference Engine:
    1. Primary: Google Gemini Cloud API (Fast, comprehensive, free tier)
    2. Secondary: Local Ollama Model (e.g. llama3 / qwen2.5 / mistral) for offline privacy
    3. Fallback: Context-extractive synthesis (Zero API key / offline baseline)
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

    def _query_gemini(self, prompt: str, api_key: str) -> Optional[str]:
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            return response.text
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
        mode: "auto" | "cloud" | "local"
        """
        joined_context = "\n---\n".join(context_passages)
        prompt = f"""You are the AI Personal Learning Assistant for a student.
Answer the student's question using ONLY the provided course notes below.
If the notes do not have enough information to answer, politely explain that the concept isn't covered in their uploaded notes.
Be clear, academic, and cite key principles.

Context from Student Notes:
{joined_context}

Student Question:
{query}
"""

        gemini_key = os.getenv("GEMINI_API_KEY")

        # 1. Try Gemini Cloud if allowed and configured
        if mode in ("auto", "cloud") and gemini_key:
            ans = self._query_gemini(prompt, gemini_key)
            if ans:
                return {
                    "answer": ans,
                    "provider": "Cloud (Google Gemini 2.5 Flash)",
                    "mode": "cloud",
                    "sources": sources,
                    "grounded": True
                }

        # 2. Try Local Ollama if available
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
            "answer": f"Here is the relevant excerpt from your notes{page_ref}:\n\n\"{first_pass.strip()}\"\n\n(Tip: Add a free GEMINI_API_KEY or launch Ollama locally to enable full conversational explanations!)",
            "provider": "Local Extractive Fallback",
            "mode": "fallback",
            "sources": sources,
            "grounded": True
        }

ai_service = HybridAIService()

