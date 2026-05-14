from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PyPDF2 import PdfReader
import requests
import os
import json

app = FastAPI()

# Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔥 OpenAI config (using export method)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
AI_URL = "https://api.openai.com/v1/chat/completions"

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY not found. Use export command.")

# 🔥 Main API
@app.post("/api/parse-pdf")
async def parse_pdf(file: UploadFile = File(...)):
    try:
        # 🔷 1. Read PDF
        reader = PdfReader(file.file)
        text_content = ""

        for page in reader.pages:
            text_content += page.extract_text() or ""

        if not text_content:
            raise HTTPException(status_code=400, detail="Empty PDF")

        # 🔷 2. Limit text (VERY IMPORTANT)
        text_content = text_content[:4000]

        # 🔷 3. Prompt
        prompt = f"""
        You are a strict assistant. Output only valid JSON. No markdown.
        Generate professional presentation slides.

        Rules:
        - Create 10 slides only.
        - Each slide must contain:
            - a clear title
            - 3-5 explanatory bullet points
        - Bullet points must be descriptive and meaningful.
        - Avoid single-word bullets.
        - Avoid subheadings-only content.
        - Use simple educational language.
        - Output only valid JSON.

        Each quiz question must have four options, and one must be correct. Set "correct" to 0, 1, 2, or 3 based on the position of the correct option in the array (0-based index).
Return:

{{
  "summary": {{
    "mainPoints": [
    "point 1",
    "point 2",
    "point 3",
    "point 4",
    "point 5"
  ],
  "keyInsights": "...",
  "recommendations": [
    {{ "statement": "..." }},
    {{ "statement": "..." }},
    {{ "statement": "..." }},
    {{ "statement": "..." }},
    {{ "statement": "..." }}
  ]
  }},
  "quiz": [
    {{
      "question": "...",
      "options": ["option 1", "option 2", "option 3", "option 4"],
      "correct": 0
    }},
    {{
      "question": "...",
      "options": ["option 1", "option 2", "option 3", "option 4"],
      "correct": 2
    }},
    {{
      "question": "...",
      "options": ["option 1", "option 2", "option 3", "option 4"],
      "correct": 1
    }},
    {{
      "question": "...",
      "options": ["option 1", "option 2", "option 3", "option 4"],
      "correct": 3
    }},
    {{
      "question": "...",
      "options": ["option 1", "option 2", "option 3", "option 4"],
      "correct": 1
    }},
    {{
      "question": "...",
      "options": ["option 1", "option 2", "option 3", "option 4"],
      "correct": 0
    }},
    {{
      "question": "...",
      "options": ["option 1", "option 2", "option 3", "option 4"],
      "correct": 2
    }},
    {{
      "question": "...",
      "options": ["option 1", "option 2", "option 3", "option 4"],
      "correct": 0
    }},
    {{
      "question": "...",
      "options": ["option 1", "option 2", "option 3", "option 4"],
      "correct": 3
    }},
    {{
      "question": "...",
      "options": ["option 1", "option 2", "option 3", "option 4"],
      "correct": 1
    }}
  ],
  "notes": [
  {{
    "title": "...",
    "content": [ 
      "Detailed explanation point 1",
      "Detailed explanation point 2",
      "Detailed explanation point 3",
      "Detailed explanation point 4"
      ]
  }},
  {{
    "title": "...",
    "content": [
      "Detailed explanation point 1",
      "Detailed explanation point 2",
      "Detailed explanation point 3",
      "Detailed explanation point 4"]
  }},
  {{
    "title": "...",
    "content": [
      "Detailed explanation point 1",
      "Detailed explanation point 2",
      "Detailed explanation point 3",
      "Detailed explanation point 4"
    ]
  }},
  {{
    "title": "...",
    "content": [
      "Detailed explanation point 1",
      "Detailed explanation point 2",
      "Detailed explanation point 3",
      "Detailed explanation point 4"
    ]
  }},
  {{
    "title": "...",
    "content": [
      "Detailed explanation point 1",
      "Detailed explanation point 2",
      "Detailed explanation point 3",
      "Detailed explanation point 4"
    ]
  }},
  {{
    "title": "...",
    "content": [
      "Detailed explanation point 1",
      "Detailed explanation point 2",
      "Detailed explanation point 3",
      "Detailed explanation point 4"
    ]
  }},
  {{
    "title": "...",
    "content": [
      "Detailed explanation point 1",
      "Detailed explanation point 2",
      "Detailed explanation point 3",
      "Detailed explanation point 4"
    ]
  }},
  {{
    "title": "...",
    "content": [
      "Detailed explanation point 1",
      "Detailed explanation point 2",
      "Detailed explanation point 3",
      "Detailed explanation point 4"
    ]
  }},
  {{
    "title": "...",
    "content": [
      "Detailed explanation point 1",
      "Detailed explanation point 2",
      "Detailed explanation point 3",
      "Detailed explanation point 4"
    ]
  }},
  {{
    "title": "...",
    "content": [
      "Detailed explanation point 1",
      "Detailed explanation point 2",
      "Detailed explanation point 3",
      "Detailed explanation point 4"
    ]
  }}
  ]
}}

TEXT:
{text_content}
"""

        # 🔷 4. OpenAI API call
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": "You are a strict JSON generator."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.7,
        }

        response = requests.post(
            AI_URL,
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
        )

        data = response.json()

        # 🔷 5. Extract content
        content = data.get("choices", [{}])[0].get("message", {}).get("content", "")

        # 🔷 6. Try parsing JSON safely
        try:
            parsed = json.loads(content)
            return {
                "status": "success",
                "data": parsed
            }
        except:
            return {
                "status": "partial",
                "raw": content
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))