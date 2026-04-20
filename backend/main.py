"""
Tyajyadinda Tejassige â€” FastAPI Backend
"""
import os
import json
import base64
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Optional

load_dotenv()

from waste_analyzer import analyze_waste, DISTRICTS

app = FastAPI(title="Tyajyadinda Tejassige API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Vercel URL will be allowed via wildcard
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "Tyajyadinda Tejassige"}


@app.post("/api/analyze")
async def analyze(
    image: UploadFile = File(...),
    language: str = Form("en"),
    district: str = Form(""),
):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload a valid image file.")
    image_bytes = await image.read()
    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large. Max 10MB.")
    result = await analyze_waste(
        image_bytes=image_bytes,
        mime_type=image.content_type,
        district_id=district or "",
        language=language,
    )
    return result


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    language: str = "en"
    image_base64: Optional[str] = None
    image_mime: Optional[str] = None


@app.post("/api/chat")
async def chat(req: ChatRequest):
    """Groq-powered chatbot with optional image input."""
    groq_key = os.getenv("GROQ_API_KEY", "")
    gemini_key = os.getenv("GEMINI_API_KEY", "")

    is_kannada = req.language == "kn"

    # Detect if user message contains Kannada script (Unicode range à²…-à³ž)
    last_user_msg = ""
    for m in reversed(req.messages):
        if m.role == "user":
            last_user_msg = m.content
            break
    has_kannada_script = any('\u0C80' <= c <= '\u0CFF' for c in last_user_msg)
    use_kannada = is_kannada or has_kannada_script

    if use_kannada:
        lang_instruction = """CRITICAL INSTRUCTION: You MUST respond ONLY in Kannada (à²•à²¨à³à²¨à²¡) language.
Do NOT use English at all in your response.
Write everything in Kannada script (à²•à²¨à³à²¨à²¡ à²²à²¿à²ªà²¿).
Use simple, clear, everyday Kannada that anyone can understand.
If you don't know a technical term in Kannada, use the Kannada transliteration."""
    else:
        lang_instruction = "Respond in clear, simple English."

    system_prompt = f"""You are SmartWaste Assistant (SmartWaste à²¸à²¹à²¾à²¯à²•), an expert AI for waste management, recycling, composting, and environmental sustainability in Karnataka, India.

{lang_instruction}

Your expertise includes:
- Identifying waste types from descriptions or images
- Disposal methods: wet bin (à²¹à²¸à²¿ à²¤à³à²¯à²¾à²œà³à²¯), dry bin (à²’à²£ à²¤à³à²¯à²¾à²œà³à²¯), hazardous bin (à²…à²ªà²¾à²¯à²•à²¾à²°à²¿ à²¤à³à²¯à²¾à²œà³à²¯)
- DIY upcycling and reuse ideas
- Carbon footprint impact of waste
- Composting at home (à²®à²¨à³†à²¯à²²à³à²²à²¿ à²•à²¾à²‚à²ªà³‹à²¸à³à²Ÿà²¿à²‚à²—à³)
- Where to dispose specific waste in Karnataka (BBMP, KSPCB collection centers)
- Environmental impact education

Be concise, helpful, and practical. Give actionable advice."""

    # Image + text: use Groq vision first, then Gemini fallback
    if req.image_base64:
        image_bytes_decoded = base64.b64decode(req.image_base64)
        last_msg = last_user_msg or ("à²ˆ à²šà²¿à²¤à³à²°à²µà²¨à³à²¨à³ à²µà²¿à²¶à³à²²à³‡à²·à²¿à²¸à²¿" if use_kannada else "Analyze this image")

        if groq_key:
            try:
                from groq import Groq
                client = Groq(api_key=groq_key)
                data_url = f"data:{req.image_mime or 'image/jpeg'};base64,{req.image_base64}"
                completion = client.chat.completions.create(
                    model="meta-llama/llama-4-scout-17b-16e-instruct",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": [
                            {"type": "image_url", "image_url": {"url": data_url}},
                            {"type": "text", "text": last_msg}
                        ]}
                    ],
                    max_tokens=1024,
                    temperature=0.7,
                )
                return {"reply": completion.choices[0].message.content.strip()}
            except Exception as e:
                print(f"Groq vision chat error: {e}")

        if gemini_key:
            try:
                from google import genai
                from google.genai import types
                client = genai.Client(api_key=gemini_key)
                response = client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=[
                        types.Part.from_bytes(data=image_bytes_decoded, mime_type=req.image_mime or "image/jpeg"),
                        f"{system_prompt}\n\nUser: {last_msg}"
                    ]
                )
                return {"reply": response.text.strip()}
            except Exception as e:
                return {"reply": f"Image analysis error: {str(e)}"}

    # Text chat: Groq with full conversation history
    if groq_key:
        try:
            from groq import Groq
            client = Groq(api_key=groq_key)
            messages = [{"role": "system", "content": system_prompt}]
            for m in req.messages[-10:]:
                messages.append({"role": m.role, "content": m.content})
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                max_tokens=1024,
                temperature=0.7,
            )
            return {"reply": completion.choices[0].message.content.strip()}
        except Exception as e:
            return {"reply": f"Chat error: {str(e)}"}

    # Gemini fallback for text
    if gemini_key:
        try:
            from google import genai
            client = genai.Client(api_key=gemini_key)
            history = "\n".join([f"{m.role}: {m.content}" for m in req.messages[-6:]])
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=[f"{system_prompt}\n\nConversation:\n{history}\n\nassistant:"]
            )
            return {"reply": response.text.strip()}
        except Exception as e:
            return {"reply": f"Chat error: {str(e)}"}

    # Demo fallback
    demo = {
        "en": "I'm Tyajyadinda Tejassige Assistant. Please add GROQ_API_KEY to the backend .env file to enable real AI chat.",
        "kn": "à²¨à²¾à²¨à³ SmartWaste à²¸à²¹à²¾à²¯à²•. à²¨à²¿à²œà²µà²¾à²¦ AI à²šà²¾à²Ÿà³ à²¸à²•à³à²°à²¿à²¯à²—à³Šà²³à²¿à²¸à²²à³ à²¬à³à²¯à²¾à²•à³†à²‚à²¡à³ .env à²«à³ˆà²²à³â€Œà²—à³† GROQ_API_KEY à²¸à³‡à²°à²¿à²¸à²¿."
    }
    return {"reply": demo.get(req.language, demo["en"])}


class BarcodeRequest(BaseModel):
    barcode: str
    image_base64: Optional[str] = None
    image_mime: Optional[str] = None
    language: str = "en"


@app.post("/api/barcode")
async def analyze_barcode(req: BarcodeRequest):
    """Analyze a barcode or product image using Groq vision."""
    groq_key = os.getenv("GROQ_API_KEY", "")
    gemini_key = os.getenv("GEMINI_API_KEY", "")

    lang_instruction = "Respond in Kannada only." if req.language == "kn" else "Respond in English."

    if req.image_base64:
        # Use Groq vision to read barcode from image and analyze product
        prompt = f"""You are an expert product identification and waste disposal analyst.

Look at this image carefully. It may show a product, its packaging, a barcode, or a label.

{lang_instruction}

Your tasks:
1. Identify the product as specifically as possible (brand, product name, variant).
2. Read any barcode or text visible on the packaging.
3. Identify all packaging materials (plastic type, glass, metal, paper, etc.).
4. Determine the correct waste disposal bin.

DISPOSAL RULES:
- Plastic bottles, wrappers, containers â†’ dry bin (recyclable)
- Glass bottles/jars â†’ dry bin (recyclable)
- Metal cans, aluminium â†’ dry bin (recyclable)
- Food waste, organic â†’ wet bin
- Batteries, electronics, chemicals, medicines â†’ hazardous bin
- Mixed/contaminated packaging â†’ dry bin

Return ONLY valid JSON, no markdown, no explanation:
{{
  "product_name": "Exact product name (e.g. Parle-G Biscuits 100g, Coca-Cola 500ml PET)",
  "barcode": "barcode number if visible, else empty string",
  "brand": "brand name",
  "packaging_materials": ["Primary material", "Secondary material if any"],
  "waste_category": "Plastic|Glass|Metal|Paper|Organic|Mixed|E-Waste|Hazardous",
  "bin": "dry|wet|hazardous",
  "bin_label": {{"en": "Dry Waste", "kn": "à²’à²£ à²¤à³à²¯à²¾à²œà³à²¯"}},
  "recyclable": true,
  "disposal_steps": {{
    "en": ["Remove cap and rinse", "Crush to save space", "Place in blue/dry bin"],
    "kn": ["à²®à³à²šà³à²šà²³ à²¤à³†à²—à³†à²¦à³ à²¤à³Šà²³à³†à²¯à²¿à²°à²¿", "à²œà²¾à²— à²‰à²³à²¿à²¸à²²à³ à²¹à²¿à²¸à³à²•à²¿", "à²¨à³€à²²à²¿/à²’à²£ à²¬à²¿à²¨à³â€Œà²¨à²²à³à²²à²¿ à²¹à²¾à²•à²¿"]
  }},
  "environmental_impact": {{
    "en": "Specific environmental impact of this product's packaging",
    "kn": "à²ˆ à²‰à²¤à³à²ªà²¨à³à²¨à²¦ à²ªà³à²¯à²¾à²•à³‡à²œà²¿à²‚à²—à³â€Œà²¨ à²¨à²¿à²°à³à²¦à²¿à²·à³à²Ÿ à²ªà²°à²¿à²¸à²° à²ªà³à²°à²­à²¾à²µ"
  }},
  "eco_tips": {{
    "en": ["Specific tip for this product type", "Another actionable tip"],
    "kn": ["à²ˆ à²‰à²¤à³à²ªà²¨à³à²¨ à²µà²¿à²§à²•à³à²•à³† à²¨à²¿à²°à³à²¦à²¿à²·à³à²Ÿ à²¸à²²à²¹à³†", "à²‡à²¨à³à²¨à³Šà²‚à²¦à³ à²•à³à²°à²¿à²¯à²¾à²¶à³€à²² à²¸à²²à²¹à³†"]
  }},
  "carbon_footprint_kg": 0.15,
  "decomposition_time": "450 years"
}}"""

        try:
            if groq_key:
                from groq import Groq
                client = Groq(api_key=groq_key)
                data_url = f"data:{req.image_mime or 'image/jpeg'};base64,{req.image_base64}"
                response = client.chat.completions.create(
                    model="meta-llama/llama-4-scout-17b-16e-instruct",
                    messages=[{"role": "user", "content": [
                        {"type": "image_url", "image_url": {"url": data_url}},
                        {"type": "text", "text": prompt}
                    ]}],
                    max_tokens=1500,
                    temperature=0.1,
                )
                text = response.choices[0].message.content.strip()
                if "```" in text:
                    start = text.find("```")
                    end = text.rfind("```")
                    if start != end:
                        text = text[start+3:end].strip()
                        if text.startswith("json"):
                            text = text[4:].strip()
                result = json.loads(text)
                result["demo_mode"] = False
                return result
            elif gemini_key:
                from google import genai
                from google.genai import types
                client = genai.Client(api_key=gemini_key)
                image_bytes = base64.b64decode(req.image_base64)
                response = client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=[
                        types.Part.from_bytes(data=image_bytes, mime_type=req.image_mime or "image/jpeg"),
                        prompt
                    ]
                )
                text = response.text.strip()
                if "```" in text:
                    start = text.find("```")
                    end = text.rfind("```")
                    if start != end:
                        text = text[start+3:end].strip()
                        if text.startswith("json"):
                            text = text[4:].strip()
                result = json.loads(text)
                result["demo_mode"] = False
                return result
        except Exception as e:
            print(f"Barcode vision error: {e}")

    # Text barcode lookup â€” use Open Food Facts API first, then Groq for analysis
    if req.barcode and (groq_key or gemini_key):
        try:
            import httpx

            product_name = None
            brand = None
            packaging_info = None

            # Step 1: Try Open Food Facts (works for many global products)
            try:
                resp = httpx.get(
                    f"https://world.openfoodfacts.org/api/v0/product/{req.barcode}.json",
                    timeout=6
                )
                if resp.status_code == 200:
                    food_data = resp.json()
                    if food_data.get("status") == 1:
                        p = food_data.get("product", {})
                        product_name = p.get("product_name") or p.get("product_name_en")
                        brand = p.get("brands")
                        packaging_info = p.get("packaging") or p.get("packaging_tags")
            except Exception:
                pass

            # Step 2: Try UPC Item DB (free tier, works for many products)
            if not product_name:
                try:
                    resp2 = httpx.get(
                        f"https://api.upcitemdb.com/prod/trial/lookup?upc={req.barcode}",
                        timeout=6,
                        headers={"Accept": "application/json"}
                    )
                    if resp2.status_code == 200:
                        upc_data = resp2.json()
                        items = upc_data.get("items", [])
                        if items:
                            product_name = items[0].get("title")
                            brand = items[0].get("brand")
                except Exception:
                    pass

            # Step 3: AI analyzes the product for waste disposal
            bc = req.barcode.strip()
            if bc.startswith(("978", "979")):
                bc_type = "book ISBN"
            elif bc.startswith("890"):
                bc_type = "Indian retail product (890 = India GS1 prefix)"
            elif bc.startswith("400") or bc.startswith("401"):
                bc_type = "German product"
            else:
                bc_type = "retail product"

            if product_name:
                context = f"Product identified: '{product_name}' by brand '{brand or 'unknown'}'. Packaging info: {packaging_info or 'not available'}."
            else:
                context = f"Barcode: {bc} ({bc_type}). Try to identify this product if you know it."

            prompt = f"""{context}

{lang_instruction}

Provide accurate waste disposal guidance for this product. Return ONLY valid JSON:
{{
  "product_name": "Full product name",
  "brand": "Brand name",
  "packaging_materials": ["Primary packaging material", "Secondary if any"],
  "waste_category": "Plastic|Glass|Metal|Paper|Organic|Mixed|E-Waste|Hazardous",
  "bin": "dry|wet|hazardous",
  "recyclable": true,
  "disposal_steps_en": ["Step 1 specific to this product", "Step 2", "Step 3"],
  "environmental_impact_en": "Specific environmental impact of this product's packaging",
  "eco_tips_en": ["Specific tip for this product", "Another actionable tip"],
  "carbon_footprint_kg": 0.1,
  "decomposition_time": "realistic time for main packaging material"
}}"""

            reply_text = None
            if groq_key:
                from groq import Groq
                client = Groq(api_key=groq_key)
                response = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=600,
                    temperature=0.1,
                )
                reply_text = response.choices[0].message.content.strip()
            elif gemini_key:
                from google import genai
                client = genai.Client(api_key=gemini_key)
                response = client.models.generate_content(model="gemini-2.0-flash", contents=[prompt])
                reply_text = response.text.strip()

            if reply_text:
                if "```" in reply_text:
                    start = reply_text.find("```")
                    end = reply_text.rfind("```")
                    if start != end:
                        reply_text = reply_text[start+3:end].strip()
                        if reply_text.startswith("json"):
                            reply_text = reply_text[4:].strip()
                raw = json.loads(reply_text)

                bin_labels = {
                    "wet": {"en": "Wet Waste", "kn": "à²¹à²¸à²¿ à²¤à³à²¯à²¾à²œà³à²¯"},
                    "dry": {"en": "Dry Waste", "kn": "à²’à²£ à²¤à³à²¯à²¾à²œà³à²¯"},
                    "hazardous": {"en": "Hazardous Waste", "kn": "à²…à²ªà²¾à²¯à²•à²¾à²°à²¿ à²¤à³à²¯à²¾à²œà³à²¯"}
                }
                bin_val = raw.get("bin", "dry")
                steps_en = raw.get("disposal_steps_en", ["Dispose in appropriate bin"])
                impact_en = raw.get("environmental_impact_en", "")
                tips_en = raw.get("eco_tips_en", ["Recycle properly"])

                return {
                    "product_name": raw.get("product_name", product_name or "Consumer Product"),
                    "brand": raw.get("brand", brand or "Unknown"),
                    "barcode": req.barcode,
                    "packaging_materials": raw.get("packaging_materials", ["Unknown"]),
                    "waste_category": raw.get("waste_category", "Mixed"),
                    "bin": bin_val,
                    "bin_label": bin_labels.get(bin_val, bin_labels["dry"]),
                    "recyclable": raw.get("recyclable", True),
                    "disposal_steps": {"en": steps_en, "kn": steps_en},
                    "environmental_impact": {"en": impact_en, "kn": impact_en},
                    "eco_tips": {"en": tips_en, "kn": tips_en},
                    "carbon_footprint_kg": raw.get("carbon_footprint_kg", 0.1),
                    "decomposition_time": raw.get("decomposition_time", "Varies"),
                    "demo_mode": False
                }
        except Exception as e:
            print(f"Barcode lookup error: {e}")

    # Demo fallback
    return {
        "product_name": "Could not identify product",
        "barcode": req.barcode or "N/A",
        "brand": "Unknown",
        "packaging_materials": ["Unknown"],
        "waste_category": "Mixed",
        "bin": "dry",
        "bin_label": {"en": "Dry Waste", "kn": "à²’à²£ à²¤à³à²¯à²¾à²œà³à²¯"},
        "recyclable": True,
        "disposal_steps": {
            "en": ["Check the product label for material type", "Clean the packaging", "Place in appropriate bin based on material"],
            "kn": ["à²µà²¸à³à²¤à³ à²µà²¿à²§à²•à³à²•à²¾à²—à²¿ à²‰à²¤à³à²ªà²¨à³à²¨ à²²à³‡à²¬à²²à³ à²ªà²°à²¿à²¶à³€à²²à²¿à²¸à²¿", "à²ªà³à²¯à²¾à²•à³‡à²œà²¿à²‚à²—à³ à²¸à³à²µà²šà³à²› à²®à²¾à²¡à²¿", "à²µà²¸à³à²¤à³à²µà²¿à²¨ à²†à²§à²¾à²°à²¦ à²®à³‡à²²à³† à²¸à³‚à²•à³à²¤ à²¬à²¿à²¨à³â€Œà²¨à²²à³à²²à²¿ à²¹à²¾à²•à²¿"]
        },
        "environmental_impact": {
            "en": "Please upload a clearer image of the barcode or enter the barcode number manually for accurate identification.",
            "kn": "à²¨à²¿à²–à²° à²—à³à²°à³à²¤à²¿à²¸à²²à³ à²¬à²¾à²°à³â€Œà²•à³‹à²¡à³â€Œà²¨ à²¸à³à²ªà²·à³à²Ÿ à²šà²¿à²¤à³à²° à²…à²ªà³â€Œà²²à³‹à²¡à³ à²®à²¾à²¡à²¿ à²…à²¥à²µà²¾ à²¬à²¾à²°à³â€Œà²•à³‹à²¡à³ à²¸à²‚à²–à³à²¯à³† à²¨à²®à³‚à²¦à²¿à²¸à²¿."
        },
        "eco_tips": {
            "en": ["Always check product labels for recycling symbols", "When in doubt, place in dry waste bin"],
            "kn": ["à²¯à²¾à²µà²¾à²—à²²à³‚ à²®à²°à³à²¬à²³à²•à³† à²šà²¿à²¹à³à²¨à³†à²—à²³à²¿à²—à²¾à²—à²¿ à²‰à²¤à³à²ªà²¨à³à²¨ à²²à³‡à²¬à²²à³ à²ªà²°à²¿à²¶à³€à²²à²¿à²¸à²¿", "à²¸à²‚à²¦à³‡à²¹à²µà²¿à²¦à³à²¦à²¾à²— à²’à²£ à²¤à³à²¯à²¾à²œà³à²¯ à²¬à²¿à²¨à³â€Œà²¨à²²à³à²²à²¿ à²¹à²¾à²•à²¿"]
        },
        "carbon_footprint_kg": 0.1,
        "decomposition_time": "Varies by material",
        "demo_mode": True
    }
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=int(os.getenv("PORT", "8000")), reload=True)
