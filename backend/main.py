from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from Pypdf import PdfReader
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

def clean_json_response(content: str) -> str:
    """
    OpenAI kabhi kabhi ```json ... ``` markdown wrap karta hai.
    Yeh function usse hata deta hai.
    """
    content = content.strip()
    if content.startswith("```"):
        # pehli line hata do (```json ya ```)
        lines = content.split("\n")
        # pehli aur aakhri line hato agar backtick hai
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        content = "\n".join(lines).strip()
    return content


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

        QUIZ RULES:
        - Generate exactly 10 MCQ questions
        - Each question must contain:
            - question
            - options (4 options only)
            - correct

        - "correct" must contain the index position of the correct answer inside the options array.
        - The index must be generated dynamically based on the actual correct option.
        - Use 0-based indexing.

        Example:
        If options are:
        [
          "HTML",
          "Python",
          "Car",
          "Tree"
        ]

        and "Python" is correct, then:
        "correct": 1
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

        # ✅ OpenAI error check
        if response.status_code != 200:
            raise HTTPException(
                status_code=502,
                detail=f"OpenAI API error: {response.status_code} — {response.text}"
            )

        data = response.json()

        # 🔷 5. Extract content
        content = data.get("choices", [{}])[0].get("message", {}).get("content", "")

        if not content:
            raise HTTPException(status_code=502, detail="OpenAI ka response empty hai.")

        # 🔷 6. Try parsing JSON safely
        try:
          clean_content = clean_json_response(content)
          parsed = json.loads(clean_content)
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