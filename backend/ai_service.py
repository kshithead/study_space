import os
import urllib.request
import json
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

class HybridAIService:
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
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return None
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            embeddings = []
            for t in texts:
                res = client.models.embed_content(
                    model='gemini-embedding-001',
                    contents=t[:2000]
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

    def answer_query(
        self,
        query: str,
        context_passages: List[str],
        sources: List[Dict[str, Any]],
        mode: str = "auto",
        history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Handles document-grounded queries, persona modes, and conversational memory.
        """
        has_context = len(context_passages) > 0 and bool(sources)

        history_text = ""
        if history:
            h_lines = []
            for h in history[-6:]:
                role = "Student" if h.get("role") in ("user", "student") else "Socrates (AI Tutor)"
                content = h.get("content", "").strip()
                if content:
                    h_lines.append(f"{role}: {content}")
            if h_lines:
                history_text = "\nConversation Context:\n" + "\n".join(h_lines) + "\n"

        # Persona instructions based on mode
        mode_instruction = "Provide a balanced, clear, and encouraging educational response."
        if mode == "socratic":
            mode_instruction = (
                "Adopt the classic Socratic method: do not just lecture or blurt out the answer. "
                "Guide the student through thoughtful questions, intuitive prompts, and hints to help them discover the answer themselves."
            )
        elif mode == "exam":
            mode_instruction = (
                "Act as a university professor running an exam prep drill: highlight common traps, test the student with "
                "high-yield conceptual questions, and provide clear scoring criteria and exam tips."
            )
        elif mode == "eli5":
            mode_instruction = (
                "Explain Like I'm 5: explain this concept using simple language, visual metaphors, and fun real-world everyday analogies. Avoid jargon."
            )
        elif mode == "deepdive":
            mode_instruction = (
                "Conduct a rigorous deep dive: provide architectural details, mathematical/algorithmic formulation, "
                "trade-offs, edge cases, and clean, runnable code examples where applicable."
            )

        if has_context:
            joined_context = "\n---\n".join(context_passages)
            prompt = f"""You are Socrates, a world-class AI Personal Learning Assistant.
{mode_instruction}
{history_text}
Student's latest query: "{query}"

Relevant excerpts from their uploaded study notes:
{joined_context}

Instructions:
1. Answer their question engagingly, clearly, and conversationally.
2. Ground your explanation primarily in their notes whenever relevant, citing key ideas.
3. Use clean markdown formatting (bolding, lists, code fences where appropriate).
"""
        else:
            prompt = f"""You are Socrates, a world-class, empathetic, and brilliant AI Personal Learning Assistant.
{mode_instruction}
{history_text}
Student said/asked: "{query}"

Instructions:
1. Answer naturally, intelligently, and conversationally — just like modern advanced AI models (ChatGPT, Claude, Gemini).
2. For academic, engineering, science, or computer science queries, provide structured, illuminating explanations with intuitive examples and code if helpful.
3. If they are making small talk or greeting you, respond warmly as their personal study companion.
4. Use clean markdown formatting (bolding, bullet points, headers, code blocks).
"""

        gemini_key = os.getenv("GEMINI_API_KEY")

        if mode in ("auto", "cloud") and gemini_key:
            ans = self._query_gemini(prompt, gemini_key)
            if ans:
                return {
                    "answer": ans,
                    "provider": "Google Gemini Cloud (gemini-3.5-flash-lite)",
                    "mode": "cloud",
                    "sources": sources if has_context else [],
                    "grounded": has_context
                }

        if mode in ("auto", "local") and self._is_ollama_alive():
            ans = self._query_ollama(prompt)
            if ans:
                return {
                    "answer": ans,
                    "provider": f"Local AI ({self.local_model} via Ollama)",
                    "mode": "local",
                    "sources": sources if has_context else [],
                    "grounded": has_context
                }

        # Fallback for offline mode without keys
        if has_context:
            return {
                "answer": f"Here is the relevant excerpt from your notes:\n\n\"{context_passages[0].strip()}\"",
                "provider": "Extractive Fallback",
                "mode": "fallback",
                "sources": sources,
                "grounded": True
            }
        else:
            return {
                "answer": "Hello! I am Socrates, your AI Learning Assistant. You can chat with me, ask questions about your studies, or upload course lecture PDFs in the Study Materials section so I can tutor you directly from your class notes!",
                "provider": "Extractive Fallback",
                "mode": "fallback",
                "sources": [],
                "grounded": False
            }

ai_service = HybridAIService()
