import os, sys
sys.path.insert(0, 'wastesmart-main/backend')
from dotenv import load_dotenv
load_dotenv('wastesmart-main/backend/.env')
from groq import Groq

key = os.getenv('GROQ_API_KEY', '')
print('Key:', key[:15])

client = Groq(api_key=key)
prompt = 'Barcode 9780143441922 is a book ISBN. Identify it and return ONLY valid JSON with keys: product_name, brand, packaging_materials (array), waste_category, bin (dry/wet/hazardous), bin_label (object with en and kn), recyclable (bool), disposal_steps (object with en array and kn array), environmental_impact (object with en and kn), eco_tips (object with en array and kn array), carbon_footprint_kg (number), decomposition_time (string)'

r = client.chat.completions.create(
    model='llama-3.3-70b-versatile',
    messages=[{'role': 'user', 'content': prompt}],
    max_tokens=600,
    temperature=0.1
)
print('Response:', r.choices[0].message.content[:300])
