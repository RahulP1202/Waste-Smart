# -*- coding: utf-8 -*-
"""
Smart Waste Analyzer - Groq Vision for image analysis.
"""
import os
import json
import base64
import random
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"

with open(DATA_DIR / "waste_categories.json", "r", encoding="utf-8") as f:
    WASTE_CATEGORIES = json.load(f)["categories"]

with open(DATA_DIR / "districts.json", "r", encoding="utf-8") as f:
    DISTRICTS = json.load(f)

DISTRICT_MAP = {d["id"]: d for d in DISTRICTS}

ANALYSIS_PROMPT = """You are an expert waste identification and environmental impact analyst for Karnataka, India.
Look at this image and identify waste items visible.
RULES:
- Organic food items = wet bin
- Plastic, paper, metal, glass, cloth, cardboard = dry bin
- Batteries, electronics, chemicals, medicines = hazardous bin
Return ONLY valid JSON, no markdown:
{
  "items": [
    {
      "waste_type": "Organic|Plastic|Metal|Glass|Paper|Cloth|E-Waste|Rubber|Medical|Sanitary|Ceramic|Wood|Mixed",
      "waste_subtype": "Exact specific name",
      "bin": "wet|dry|hazardous",
      "bin_label": {"en": "Wet Waste", "kn": "\u0cb9\u0cb8\u0cbf \u0ca4\u0ccd\u0caf\u0cbe\u0c9c\u0ccd\u0caf"},
      "decomposition_time": "realistic time",
      "recyclability": 3,
      "compostable": true,
      "reuse_potential": 2,
      "can_sell": false,
      "sell_price": "",
      "disposal_steps": {
        "en": ["Step 1", "Step 2", "Step 3"],
        "kn": ["\u0cb9\u0c82\u0ca4 1", "\u0cb9\u0c82\u0ca4 2", "\u0cb9\u0c82\u0ca4 3"]
      },
      "where_to_dispose": {
        "en": "Specific disposal location in Karnataka",
        "kn": "\u0c95\u0cb0\u0ccd\u0ca8\u0cbe\u0c9f\u0c95\u0ca6\u0cb2\u0ccd\u0cb2\u0cbf \u0cb5\u0cbf\u0cb2\u0cc7\u0cb5\u0cbe\u0cb0\u0cbf \u0cb8\u0ccd\u0ca5\u0cb3"
      },
      "diy_ideas": {
        "en": ["Creative reuse idea", "Another DIY idea"],
        "kn": ["\u0cae\u0cb0\u0cc1\u0cac\u0cb3\u0c95\u0cc6 \u0c86\u0cb2\u0ccb\u0c9a\u0ca8\u0cc6", "\u0c87\u0ca8\u0ccd\u0ca8\u0ccb\u0c82\u0ca6\u0cc1 DIY \u0c86\u0cb2\u0ccb\u0c9a\u0ca8\u0cc6"]
      },
      "carbon_footprint_kg": 0.05,
      "carbon_if_disposed_wrong_kg": 0.18,
      "carbon_saved_if_recycled_kg": 0.12,
      "description": {
        "en": "Description of item and environmental impact",
        "kn": "\u0cb5\u0cb8\u0ccd\u0ca4\u0cc1 \u0cae\u0ca4\u0ccd\u0ca4\u0cc1 \u0caa\u0cb0\u0cbf\u0cb8\u0cb0 \u0caa\u0ccd\u0cb0\u0cad\u0cbe\u0cb5\u0ca6 \u0cb5\u0cbf\u0cb5\u0cb0\u0ca3\u0cc6"
      }
    }
  ],
  "overall_summary": {
    "en": "Summary of image and disposal recommendation",
    "kn": "\u0c9a\u0cbf\u0ca4\u0ccd\u0cb0\u0ca6 \u0cb8\u0cbe\u0cb0\u0cbe\u0c82\u0cb6 \u0cae\u0ca4\u0ccd\u0ca4\u0cc1 \u0cb5\u0cbf\u0cb2\u0cc7\u0cb5\u0cbe\u0cb0\u0cbf \u0cb6\u0cbf\u0cab\u0cbe\u0cb0\u0cb8\u0cc1"
  },
  "total_carbon_footprint_kg": 0.05,
  "eco_tips": {
    "en": ["Tip 1", "Tip 2", "Tip 3"],
    "kn": ["\u0cb8\u0cb2\u0cb9\u0cc6 1", "\u0cb8\u0cb2\u0cb9\u0cc6 2", "\u0cb8\u0cb2\u0cb9\u0cc6 3"]
  }
}"""


def _compute_score(item: dict) -> int:
    r = item.get("recyclability", 0) * 10
    c = 20 if item.get("compostable") else 0
    u = item.get("reuse_potential", 0) * 8
    s = 10 if item.get("can_sell") else 0
    return min(100, r + c + u + s)


async def analyze_waste(image_bytes: bytes, mime_type: str, district_id: str, language: str = "en") -> dict:
    groq_key = os.getenv("GROQ_API_KEY", "")
    gemini_key = os.getenv("GEMINI_API_KEY", "")

    parsed = None
    use_ai = False

    if groq_key:
        try:
            from groq import Groq
            client = Groq(api_key=groq_key)
            image_b64 = base64.b64encode(image_bytes).decode("utf-8")
            data_url = f"data:{mime_type};base64,{image_b64}"
            response = client.chat.completions.create(
                model="meta-llama/llama-4-scout-17b-16e-instruct",
                messages=[{"role": "user", "content": [
                    {"type": "image_url", "image_url": {"url": data_url}},
                    {"type": "text", "text": ANALYSIS_PROMPT}
                ]}],
                max_tokens=4096,
                temperature=0.1,
            )
            text = response.choices[0].message.content.strip()
            if "```" in text:
                parts = text.split("```")
                for part in parts:
                    part = part.strip()
                    if part.startswith("json"):
                        part = part[4:].strip()
                    if part.startswith("{"):
                        text = part
                        break
            parsed = json.loads(text)
            use_ai = True
        except json.JSONDecodeError as e:
            print(f"Groq JSON parse error: {e}. Trying Gemini fallback.")
        except Exception as e:
            print(f"Groq vision error: {e}. Trying Gemini fallback.")

    if not parsed and gemini_key:
        try:
            from google import genai
            from google.genai import types
            client = genai.Client(api_key=gemini_key)
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=[
                    types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                    ANALYSIS_PROMPT
                ]
            )
            text = response.text.strip()
            if "```" in text:
                parts = text.split("```")
                for part in parts:
                    part = part.strip()
                    if part.startswith("json"):
                        part = part[4:].strip()
                    if part.startswith("{"):
                        text = part
                        break
            parsed = json.loads(text)
            use_ai = True
        except Exception as e:
            print(f"Gemini vision error: {e}")

    if not parsed:
        cat = random.choice(WASTE_CATEGORIES)
        bin_labels = {
            "wet":       {"en": "Wet Waste",       "kn": "\u0cb9\u0cb8\u0cbf \u0ca4\u0ccd\u0caf\u0cbe\u0c9c\u0ccd\u0caf"},
            "dry":       {"en": "Dry Waste",       "kn": "\u0c92\u0ca3 \u0ca4\u0ccd\u0caf\u0cbe\u0c9c\u0ccd\u0caf"},
            "hazardous": {"en": "Hazardous Waste", "kn": "\u0c85\u0caa\u0cbe\u0caf\u0c95\u0cbe\u0cb0\u0cbf \u0ca4\u0ccd\u0caf\u0cbe\u0c9c\u0ccd\u0caf"},
        }
        carbon = round(random.uniform(0.05, 0.5), 3)
        item = {
            "waste_type": cat["type"],
            "waste_subtype": cat["subtype"],
            "bin": cat["bin"],
            "bin_label": bin_labels[cat["bin"]],
            "decomposition_time": cat["decomposition"],
            "recyclability": cat["recyclability"],
            "compostable": cat["compostable"],
            "reuse_potential": cat["reuse"],
            "can_sell": cat["can_sell"],
            "sell_price": cat.get("sell_price", ""),
            "disposal_steps": {
                "en": ["Separate from other waste", "Place in correct bin", "Hand over to collection"],
                "kn": ["\u0c87\u0ca4\u0cb0 \u0ca4\u0ccd\u0caf\u0cbe\u0c9c\u0ccd\u0caf\u0ca6\u0cbf\u0c82\u0ca6 \u0cac\u0cc7\u0cb0\u0ccd\u0caa\u0ca1\u0cbf\u0cb8\u0cbf", "\u0cb8\u0cb0\u0cbf\u0caf\u0cbe\u0ca6 \u0cac\u0cbf\u0ca8\u0ccd\u200c\u0ca8\u0cb2\u0ccd\u0cb2\u0cbf \u0cb9\u0cbe\u0c95\u0cbf", "\u0cb8\u0c82\u0c97\u0ccd\u0cb0\u0cb9\u0c95\u0ccd\u0c95\u0cc6 \u0c92\u0caa\u0ccd\u0caa\u0cbf\u0cb8\u0cbf"]
            },
            "where_to_dispose": {
                "en": "Nearest BBMP collection center",
                "kn": "\u0cb9\u0ca4\u0ccd\u0ca4\u0cbf\u0cb0\u0ca6 BBMP \u0cb8\u0c82\u0c97\u0ccd\u0cb0\u0cb9 \u0c95\u0cc7\u0c82\u0ca6\u0ccd\u0cb0"
            },
            "diy_ideas": {
                "en": ["Repurpose creatively", "Use for home projects"],
                "kn": ["\u0cb8\u0cc3\u0c9c\u0ca8\u0cb6\u0cc0\u0cb2\u0cb5\u0cbe\u0c97\u0cbf \u0cae\u0cb0\u0cc1\u0cac\u0cb3\u0cb8\u0cbf", "\u0cae\u0ca8\u0cc6 \u0caf\u0ccb\u0c9c\u0ca8\u0cc6\u0c97\u0cb3\u0cbf\u0c97\u0cc6 \u0cac\u0cb3\u0cb8\u0cbf"]
            },
            "carbon_footprint_kg": carbon,
            "carbon_if_disposed_wrong_kg": round(carbon * 3.2, 3),
            "carbon_saved_if_recycled_kg": round(carbon * 2.1, 3),
            "description": {
                "en": "Demo mode - add GROQ_API_KEY to enable real AI analysis.",
                "kn": "\u0ca1\u0cc6\u0cae\u0ccb \u0cae\u0ccb\u0ca1\u0ccd - \u0ca8\u0cbf\u0c9c\u0cb5\u0cbe\u0ca6 AI \u0cb5\u0cbf\u0cb6\u0ccd\u0cb2\u0cc7\u0cb7\u0ca3\u0cc6\u0c97\u0cbe\u0c97\u0cbf GROQ_API_KEY \u0cb8\u0cc7\u0cb0\u0cbf\u0cb8\u0cbf."
            }
        }
        parsed = {
            "items": [item],
            "overall_summary": {
                "en": "Demo mode - showing sample result. Add GROQ_API_KEY for real analysis.",
                "kn": "\u0ca1\u0cc6\u0cae\u0ccb \u0cae\u0ccb\u0ca1\u0ccd - \u0cae\u0cbe\u0ca6\u0cb0\u0cbf \u0cab\u0cb2\u0cbf\u0ca4\u0cbe\u0c82\u0cb6 \u0ca4\u0ccb\u0cb0\u0cbf\u0cb8\u0cb2\u0cbe\u0c97\u0cc1\u0ca4\u0ccd\u0ca4\u0cbf\u0ca6\u0cc6."
            },
            "total_carbon_footprint_kg": carbon,
            "eco_tips": {
                "en": ["Separate waste at source", "Compost organic waste", "Recycle dry waste"],
                "kn": ["\u0cae\u0cc2\u0cb2\u0ca6\u0cb2\u0ccd\u0cb2\u0cc7 \u0ca4\u0ccd\u0caf\u0cbe\u0c9c\u0ccd\u0caf \u0cac\u0cc7\u0cb0\u0ccd\u0caa\u0ca1\u0cbf\u0cb8\u0cbf", "\u0cb8\u0cbe\u0cb5\u0caf\u0cb5 \u0ca4\u0ccd\u0caf\u0cbe\u0c9c\u0ccd\u0caf \u0c95\u0cbe\u0c82\u0caa\u0ccb\u0cb8\u0ccd\u0c9f\u0ccd \u0cae\u0cbe\u0ca1\u0cbf", "\u0c92\u0ca3 \u0ca4\u0ccd\u0caf\u0cbe\u0c9c\u0ccd\u0caf \u0cae\u0cb0\u0cc1\u0cac\u0cb3\u0c95\u0cc6 \u0cae\u0cbe\u0ca1\u0cbf"]
            }
        }

    for item in parsed.get("items", []):
        item["sustainability_score"] = _compute_score(item)

    district = DISTRICT_MAP.get(district_id)
    parsed["district_info"] = {
        "name": district["name"] if district else None,
        "schedule": district["schedule"] if district else None,
        "dropoff": district["dropoff"] if district else None,
    } if district else None

    parsed["demo_mode"] = not use_ai
    parsed["points_earned"] = 10 * max(1, len(parsed.get("items", [])))
    return parsed