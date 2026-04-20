"""
Tyajyadinda Tejassige Analyzer â€” Groq Vision (llama-4-scout) for image analysis.
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

Look at this image carefully and identify EVERYTHING visible that could be classified as waste or has disposal implications.

IMPORTANT: You can analyze ANY type of image:
- Food items (fruits, vegetables, cooked food, peels, shells) â†’ organic/wet waste
- Packaging (bottles, cans, wrappers, boxes, bags) â†’ dry/recyclable waste
- Electronics, batteries, cables â†’ e-waste/hazardous
- Household items, clothing, furniture â†’ dry waste
- Chemicals, medicines, syringes â†’ hazardous
- Mixed scenes (kitchen, room, outdoor) â†’ identify each item separately
- If the image shows a person, animal, or landscape with no waste â†’ still identify any waste-related items visible

STRICT RULES:
- Identify ONLY what you actually see. Do NOT invent items.
- Be specific: not just "plastic" but "PET plastic bottle" or "HDPE container"
- Organic food items (vegetables, fruits, peels, shells, cooked food, leftovers) = wet bin
- Plastic, paper, metal, glass, cloth, cardboard = dry bin
- Batteries, electronics, chemicals, syringes, medicines = hazardous bin
- If you see a non-waste image (person, landscape, animal only), return 1 item describing what you see and suggest "dry" bin as default

Return ONLY valid JSON, no markdown:
{
  "items": [
    {
      "waste_type": "Organic|Plastic|Metal|Glass|Paper|Cloth|E-Waste|Rubber|Medical|Sanitary|Ceramic|Wood|Mixed",
      "waste_subtype": "Exact specific name (e.g. Egg Shell, Carrot, PET Water Bottle, Cardboard Box, AA Battery)",
      "bin": "wet|dry|hazardous",
      "bin_label": {"en": "Wet Waste", "kn": "à²¹à²¸à²¿ à²¤à³à²¯à²¾à²œà³à²¯"},
      "decomposition_time": "realistic time (e.g. 2-4 weeks, 450 years)",
      "recyclability": 3,
      "compostable": true,
      "reuse_potential": 2,
      "can_sell": false,
      "sell_price": "",
      "disposal_steps": {
        "en": ["Specific step for this exact item", "Step 2", "Step 3"],
        "kn": ["à²ˆ à²µà²¸à³à²¤à³à²µà²¿à²—à³† à²¨à²¿à²°à³à²¦à²¿à²·à³à²Ÿ à²¹à²‚à²¤", "à²¹à²‚à²¤ 2", "à²¹à²‚à²¤ 3"]
      },
      "where_to_dispose": {
        "en": "Specific disposal location in Karnataka (e.g. BBMP green bin, dry waste collection center, e-waste drop-off)",
        "kn": "à²•à²°à³à²¨à²¾à²Ÿà²•à²¦à²²à³à²²à²¿ à²¨à²¿à²°à³à²¦à²¿à²·à³à²Ÿ à²µà²¿à²²à³‡à²µà²¾à²°à²¿ à²¸à³à²¥à²³"
      },
      "diy_ideas": {
        "en": ["Creative reuse idea specific to this item", "Another practical DIY idea"],
        "kn": ["à²ˆ à²µà²¸à³à²¤à³à²µà²¿à²—à³† à²¨à²¿à²°à³à²¦à²¿à²·à³à²Ÿ à²®à²°à³à²¬à²³à²•à³† à²†à²²à³‹à²šà²¨à³†", "à²‡à²¨à³à²¨à³Šà²‚à²¦à³ à²ªà³à²°à²¾à²¯à³‹à²—à²¿à²• DIY à²†à²²à³‹à²šà²¨à³†"]
      },
      "carbon_footprint_kg": 0.05,
      "carbon_if_disposed_wrong_kg": 0.18,
      "carbon_saved_if_recycled_kg": 0.12,
      "description": {
        "en": "Accurate description of this item, its material, and environmental impact",
        "kn": "à²ˆ à²µà²¸à³à²¤à³, à²…à²¦à²° à²µà²¸à³à²¤à³ à²®à²¤à³à²¤à³ à²ªà²°à²¿à²¸à²° à²ªà³à²°à²­à²¾à²µà²¦ à²¨à²¿à²–à²° à²µà²¿à²µà²°à²£à³†"
      }
    }
  ],
  "overall_summary": {
    "en": "Brief accurate summary of what is in the image and the main disposal recommendation",
    "kn": "à²šà²¿à²¤à³à²°à²¦à²²à³à²²à²¿ à²à²¨à²¿à²¦à³† à²®à²¤à³à²¤à³ à²®à³à²–à³à²¯ à²µà²¿à²²à³‡à²µà²¾à²°à²¿ à²¶à²¿à²«à²¾à²°à²¸à²¿à²¨ à²¸à²‚à²•à³à²·à²¿à²ªà³à²¤ à²¨à²¿à²–à²° à²¸à²¾à²°à²¾à²‚à²¶"
  },
  "total_carbon_footprint_kg": 0.05,
  "eco_tips": {
    "en": ["Actionable tip specific to items found", "Tip 2", "Tip 3"],
    "kn": ["à²•à²‚à²¡à³à²¬à²‚à²¦ à²µà²¸à³à²¤à³à²—à²³à²¿à²—à³† à²¨à²¿à²°à³à²¦à²¿à²·à³à²Ÿ à²•à³à²°à²¿à²¯à²¾à²¶à³€à²² à²¸à²²à²¹à³†", "à²¸à²²à²¹à³† 2", "à²¸à²²à²¹à³† 3"]
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

    if groq_key:
        try:
            from groq import Groq
            client = Groq(api_key=groq_key)

            # Encode image to base64
            image_b64 = base64.b64encode(image_bytes).decode("utf-8")
            data_url = f"data:{mime_type};base64,{image_b64}"

            response = client.chat.completions.create(
                model="meta-llama/llama-4-scout-17b-16e-instruct",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image_url",
                                "image_url": {"url": data_url}
                            },
                            {
                                "type": "text",
                                "text": ANALYSIS_PROMPT
                            }
                        ]
                    }
                ],
                max_tokens=4096,
                temperature=0.1,
            )

            text = response.choices[0].message.content.strip()

            # Strip markdown fences if present
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
            parsed = None
            use_ai = False
        except Exception as e:
            print(f"Groq vision error: {e}. Trying Gemini fallback.")
            parsed = None
            use_ai = False
    else:
        parsed = None
        use_ai = False

    # Gemini fallback if Groq failed or not configured
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
            parsed = None
            use_ai = False

    if not parsed:
        # Demo fallback â€” single item
        cat = random.choice(WASTE_CATEGORIES)
        bin_labels = {
            "wet": {"en": "Wet Waste", "kn": "à²¹à²¸à²¿ à²¤à³à²¯à²¾à²œà³à²¯"},
            "dry": {"en": "Dry Waste", "kn": "à²’à²£ à²¤à³à²¯à²¾à²œà³à²¯"},
            "hazardous": {"en": "Hazardous Waste", "kn": "à²…à²ªà²¾à²¯à²•à²¾à²°à²¿ à²¤à³à²¯à²¾à²œà³à²¯"},
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
                "kn": ["à²‡à²¤à²° à²¤à³à²¯à²¾à²œà³à²¯à²¦à²¿à²‚à²¦ à²¬à³‡à²°à³à²ªà²¡à²¿à²¸à²¿", "à²¸à²°à²¿à²¯à²¾à²¦ à²¬à²¿à²¨à³â€Œà²¨à²²à³à²²à²¿ à²¹à²¾à²•à²¿", "à²¸à²‚à²—à³à²°à²¹à²•à³à²•à³† à²’à²ªà³à²ªà²¿à²¸à²¿"]
            },
            "where_to_dispose": {
                "en": "Nearest BBMP collection center",
                "kn": "à²¹à²¤à³à²¤à²¿à²°à²¦ BBMP à²¸à²‚à²—à³à²°à²¹ à²•à³‡à²‚à²¦à³à²°"
            },
            "diy_ideas": {
                "en": ["Repurpose creatively", "Use for home projects"],
                "kn": ["à²¸à³ƒà²œà²¨à²¶à³€à²²à²µà²¾à²—à²¿ à²®à²°à³à²¬à²³à²¸à²¿", "à²®à²¨à³† à²¯à³‹à²œà²¨à³†à²—à²³à²¿à²—à³† à²¬à²³à²¸à²¿"]
            },
            "carbon_footprint_kg": carbon,
            "carbon_if_disposed_wrong_kg": round(carbon * 3.2, 3),
            "carbon_saved_if_recycled_kg": round(carbon * 2.1, 3),
            "description": {
                "en": f"Demo mode â€” add GROQ_API_KEY to enable real AI analysis.",
                "kn": "à²¡à³†à²®à³Š à²®à³‹à²¡à³ â€” à²¨à²¿à²œà²µà²¾à²¦ AI à²µà²¿à²¶à³à²²à³‡à²·à²£à³†à²—à²¾à²—à²¿ GROQ_API_KEY à²¸à³‡à²°à²¿à²¸à²¿."
            }
        }
        parsed = {
            "items": [item],
            "overall_summary": {
                "en": "Demo mode â€” showing sample result. Add GROQ_API_KEY for real analysis.",
                "kn": "à²¡à³†à²®à³Š à²®à³‹à²¡à³ â€” à²®à²¾à²¦à²°à²¿ à²«à²²à²¿à²¤à²¾à²‚à²¶ à²¤à³‹à²°à²¿à²¸à²²à²¾à²—à³à²¤à³à²¤à²¿à²¦à³†."
            },
            "total_carbon_footprint_kg": carbon,
            "eco_tips": {
                "en": ["Separate waste at source", "Compost organic waste", "Recycle dry waste"],
                "kn": ["à²®à³‚à²²à²¦à²²à³à²²à³‡ à²¤à³à²¯à²¾à²œà³à²¯ à²¬à³‡à²°à³à²ªà²¡à²¿à²¸à²¿", "à²¸à²¾à²µà²¯à²µ à²¤à³à²¯à²¾à²œà³à²¯ à²•à²¾à²‚à²ªà³‹à²¸à³à²Ÿà³ à²®à²¾à²¡à²¿", "à²’à²£ à²¤à³à²¯à²¾à²œà³à²¯ à²®à²°à³à²¬à²³à²•à³† à²®à²¾à²¡à²¿"]
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

