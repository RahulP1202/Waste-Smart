import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import RecycleLogo from '../components/RecycleLogo'
import { supabase, supabaseConfigured } from '../lib/supabase'
import './Find.css'

// ── Kabadiwala / Recycling Centers ──────────────────────────────────────────
const KABADIWALAS = [
  { id:1, name:'Hasiru Dala Innovations', area:'Bengaluru', address:'80 Feet Road, Koramangala 4th Block, Bengaluru 560034', phone:'080-41255555', verified:true, rating:4.8, reviews:124, materials:['Paper','Plastic','Metal','Glass','E-Waste'], hours:'Mon–Sat 9AM–6PM', mapUrl:'https://maps.google.com/?q=Hasiru+Dala+Koramangala+Bengaluru' },
  { id:2, name:'Saahas Zero Waste', area:'Bengaluru', address:'27th Main, HSR Layout Sector 2, Bengaluru 560102', phone:'080-41500500', verified:true, rating:4.7, reviews:89, materials:['Paper','Plastic','Metal','E-Waste','Cloth'], hours:'Mon–Sat 8AM–7PM', mapUrl:'https://maps.google.com/?q=Saahas+Zero+Waste+HSR+Layout+Bengaluru' },
  { id:3, name:'E-Parisaraa Pvt Ltd', area:'Bengaluru', address:'Doddaballapur Industrial Area, Bengaluru 562149', phone:'080-28460434', verified:true, rating:4.6, reviews:67, materials:['E-Waste','Batteries','Electronics'], hours:'Mon–Fri 9AM–5PM', mapUrl:'https://maps.google.com/?q=E-Parisaraa+Bengaluru' },
  { id:4, name:'BBMP Dry Waste Collection Centre', area:'Bengaluru', address:'11th Main, Jayanagar 4th Block, Bengaluru 560041', phone:'080-22975555', verified:true, rating:4.3, reviews:45, materials:['Paper','Plastic','Metal','Glass','Cloth'], hours:'Mon–Sat 7AM–2PM', mapUrl:'https://maps.google.com/?q=Jayanagar+4th+Block+Bengaluru' },
  { id:5, name:'Attero Recycling Drop Point', area:'Bengaluru', address:'ITPL Main Road, Whitefield, Bengaluru 560066', phone:'1800-200-5551', verified:true, rating:4.6, reviews:78, materials:['E-Waste','Batteries','Mobile Phones'], hours:'Mon–Sat 10AM–6PM', mapUrl:'https://maps.google.com/?q=Whitefield+ITPL+Bengaluru' },
  { id:6, name:'Green Worms Recycling', area:'Bengaluru', address:'8th Cross, Malleshwaram, Bengaluru 560003', phone:'9880123456', verified:true, rating:4.4, reviews:56, materials:['Paper','Cardboard','Plastic','Metal'], hours:'Mon–Sat 9AM–5PM', mapUrl:'https://maps.google.com/?q=Malleshwaram+8th+Cross+Bengaluru' },
  { id:7, name:'Recykal Collection Hub', area:'Bengaluru', address:'Phase 1, Electronic City, Bengaluru 560100', phone:'080-67650000', verified:true, rating:4.5, reviews:91, materials:['Paper','Plastic','Metal','E-Waste'], hours:'Mon–Fri 9AM–6PM', mapUrl:'https://maps.google.com/?q=Electronic+City+Phase+1+Bengaluru' },
  { id:8, name:'MCC Waste Processing Unit', area:'Mysuru', address:'Vidyaranyapuram, Mysuru 570008', phone:'0821-2548000', verified:true, rating:4.4, reviews:38, materials:['Paper','Plastic','Metal','Glass'], hours:'Mon–Sat 8AM–5PM', mapUrl:'https://maps.google.com/?q=Vidyaranyapuram+Mysuru' },
  { id:9, name:'Mysuru Kabadiwala Centre', area:'Mysuru', address:'Kuvempunagar Main Road, Mysuru 570023', phone:'9845112233', verified:false, rating:4.1, reviews:22, materials:['Paper','Plastic','Metal'], hours:'Daily 9AM–7PM', mapUrl:'https://maps.google.com/?q=Kuvempunagar+Mysuru' },
  { id:10, name:'Green Earth Recyclers Mysuru', area:'Mysuru', address:'Hebbal Industrial Area, Mysuru 570016', phone:'9741234567', verified:true, rating:4.3, reviews:31, materials:['Paper','Plastic','Metal','E-Waste'], hours:'Mon–Sat 9AM–6PM', mapUrl:'https://maps.google.com/?q=Hebbal+Industrial+Area+Mysuru' },
  { id:11, name:'MCC Waste Processing Unit Mangaluru', area:'Mangaluru', address:'Padil, Mangaluru 575007', phone:'0824-2220000', verified:true, rating:4.5, reviews:44, materials:['Paper','Plastic','Metal','Glass'], hours:'Mon–Sat 8AM–5PM', mapUrl:'https://maps.google.com/?q=Padil+Mangaluru' },
  { id:12, name:'Mangaluru Scrap Dealers', area:'Mangaluru', address:'Bejai Main Road, Mangaluru 575004', phone:'9900445566', verified:false, rating:4.0, reviews:18, materials:['Metal','Paper','Plastic'], hours:'Daily 8AM–7PM', mapUrl:'https://maps.google.com/?q=Bejai+Mangaluru' },
  { id:13, name:'HDMC Waste Centre Hubballi', area:'Hubballi', address:'Vidyanagar, Hubballi 580031', phone:'0836-2362000', verified:true, rating:4.2, reviews:29, materials:['Paper','Plastic','Metal','Glass'], hours:'Mon–Sat 8AM–5PM', mapUrl:'https://maps.google.com/?q=Vidyanagar+Hubballi' },
  { id:14, name:'Dharwad Recycling Point', area:'Dharwad', address:'PB Road, Dharwad 580001', phone:'9632001122', verified:false, rating:4.0, reviews:15, materials:['Paper','Metal','Plastic'], hours:'Mon–Sat 9AM–6PM', mapUrl:'https://maps.google.com/?q=PB+Road+Dharwad' },
  { id:15, name:'BCC Waste Processing Center', area:'Belagavi', address:'Tilakwadi, Belagavi 590006', phone:'0831-2420000', verified:true, rating:4.3, reviews:33, materials:['Paper','Plastic','Metal','Glass'], hours:'Mon–Sat 8AM–5PM', mapUrl:'https://maps.google.com/?q=Tilakwadi+Belagavi' },
  { id:16, name:'GUDA Waste Center Kalaburagi', area:'Kalaburagi', address:'Super Market Area, Kalaburagi 585101', phone:'08472-263000', verified:true, rating:4.1, reviews:21, materials:['Paper','Plastic','Metal'], hours:'Mon–Sat 9AM–5PM', mapUrl:'https://maps.google.com/?q=Super+Market+Kalaburagi' },
  { id:17, name:'City Corporation Waste Center Ballari', area:'Ballari', address:'Gandhi Nagar, Ballari 583101', phone:'08392-255000', verified:true, rating:4.2, reviews:26, materials:['Paper','Plastic','Metal','Glass'], hours:'Mon–Sat 8AM–5PM', mapUrl:'https://maps.google.com/?q=Gandhi+Nagar+Ballari' },
  { id:18, name:'City Corporation Waste Center Shivamogga', area:'Shivamogga', address:'Kuvempu Road, Shivamogga 577201', phone:'08182-222000', verified:true, rating:4.3, reviews:28, materials:['Paper','Plastic','Metal'], hours:'Mon–Sat 8AM–5PM', mapUrl:'https://maps.google.com/?q=Kuvempu+Road+Shivamogga' },
  { id:19, name:'CMC Waste Center Davanagere', area:'Davanagere', address:'PJ Extension, Davanagere 577002', phone:'08192-231000', verified:true, rating:4.1, reviews:19, materials:['Paper','Plastic','Metal'], hours:'Mon–Sat 8AM–5PM', mapUrl:'https://maps.google.com/?q=PJ+Extension+Davanagere' },
  { id:20, name:'CMC Waste Center Tumakuru', area:'Tumakuru', address:'B.H. Road, Tumakuru 572101', phone:'0816-2272000', verified:true, rating:4.0, reviews:17, materials:['Paper','Plastic','Metal'], hours:'Mon–Sat 8AM–5PM', mapUrl:'https://maps.google.com/?q=BH+Road+Tumakuru' },
  { id:21, name:'Hassan CMC Waste Collection', area:'Hassan', address:'BM Road, Hassan 573201', phone:'08172-268000', verified:true, rating:4.2, reviews:23, materials:['Paper','Plastic','Metal','Glass'], hours:'Mon–Sat 8AM–5PM', mapUrl:'https://maps.google.com/?q=BM+Road+Hassan' },
  { id:22, name:'CMC Waste Center Udupi', area:'Udupi', address:'Court Road, Udupi 576101', phone:'0820-2520000', verified:true, rating:4.4, reviews:31, materials:['Paper','Plastic','Metal','Glass'], hours:'Mon–Sat 8AM–5PM', mapUrl:'https://maps.google.com/?q=Court+Road+Udupi' },
  { id:23, name:'CMC Waste Center Vijayapura', area:'Vijayapura', address:'Station Road, Vijayapura 586101', phone:'08352-250000', verified:true, rating:4.0, reviews:14, materials:['Paper','Plastic','Metal'], hours:'Mon–Sat 8AM–5PM', mapUrl:'https://maps.google.com/?q=Station+Road+Vijayapura' },
  { id:24, name:'CMC Waste Center Bidar', area:'Bidar', address:'Udgir Road, Bidar 585401', phone:'08482-226000', verified:true, rating:4.0, reviews:12, materials:['Paper','Plastic','Metal'], hours:'Mon–Sat 8AM–5PM', mapUrl:'https://maps.google.com/?q=Udgir+Road+Bidar' },
  { id:25, name:'CMC Waste Center Raichur', area:'Raichur', address:'Station Road, Raichur 584101', phone:'08532-220000', verified:true, rating:4.1, reviews:16, materials:['Paper','Plastic','Metal'], hours:'Mon–Sat 8AM–5PM', mapUrl:'https://maps.google.com/?q=Station+Road+Raichur' },
  { id:26, name:'CMC Waste Center Chitradurga', area:'Chitradurga', address:'Fort Road, Chitradurga 577501', phone:'08194-222000', verified:true, rating:4.0, reviews:13, materials:['Paper','Plastic','Metal'], hours:'Mon–Sat 8AM–5PM', mapUrl:'https://maps.google.com/?q=Fort+Road+Chitradurga' },
  { id:27, name:'CMC Waste Center Chikkamagaluru', area:'Chikkamagaluru', address:'MG Road, Chikkamagaluru 577101', phone:'08262-220000', verified:true, rating:4.2, reviews:18, materials:['Paper','Plastic','Metal','Glass'], hours:'Mon–Sat 8AM–5PM', mapUrl:'https://maps.google.com/?q=MG+Road+Chikkamagaluru' },
  { id:28, name:'ZP Waste Center Madikeri', area:'Kodagu', address:'School Road, Madikeri 571201', phone:'08272-228000', verified:true, rating:4.3, reviews:20, materials:['Paper','Plastic','Metal'], hours:'Mon–Sat 8AM–5PM', mapUrl:'https://maps.google.com/?q=School+Road+Madikeri' },
  { id:29, name:'City Municipal Council Waste Center Mandya', area:'Mandya', address:'Bangalore-Mysore Road, Mandya 571401', phone:'08232-222000', verified:true, rating:4.1, reviews:15, materials:['Paper','Plastic','Metal'], hours:'Mon–Sat 8AM–5PM', mapUrl:'https://maps.google.com/?q=Bangalore+Mysore+Road+Mandya' },
  { id:30, name:'CMC Waste Center Ramanagara', area:'Ramanagara', address:'Bangalore Road, Ramanagara 562159', phone:'08027-272000', verified:true, rating:4.0, reviews:11, materials:['Paper','Plastic','Metal'], hours:'Mon–Sat 8AM–5PM', mapUrl:'https://maps.google.com/?q=Bangalore+Road+Ramanagara' },
  { id:31, name:'CMC Waste Center Kolar', area:'Kolar', address:'Bangalore Road, Kolar 563101', phone:'08152-222000', verified:true, rating:4.0, reviews:13, materials:['Paper','Plastic','Metal'], hours:'Mon–Sat 8AM–5PM', mapUrl:'https://maps.google.com/?q=Bangalore+Road+Kolar' },
  { id:32, name:'CMC Waste Center Bagalkot', area:'Bagalkot', address:'Station Road, Bagalkot 587101', phone:'08354-220000', verified:true, rating:4.0, reviews:10, materials:['Paper','Plastic','Metal'], hours:'Mon–Sat 8AM–5PM', mapUrl:'https://maps.google.com/?q=Station+Road+Bagalkot' },
  { id:33, name:'CMC Waste Center Gadag', area:'Gadag', address:'Station Road, Gadag 582101', phone:'08372-230000', verified:true, rating:4.0, reviews:9, materials:['Paper','Plastic','Metal'], hours:'Mon–Sat 8AM–5PM', mapUrl:'https://maps.google.com/?q=Station+Road+Gadag' },
  { id:34, name:'CMC Waste Center Haveri', area:'Haveri', address:'MG Road, Haveri 581110', phone:'08375-234000', verified:true, rating:4.1, reviews:11, materials:['Paper','Plastic','Metal'], hours:'Mon–Sat 8AM–5PM', mapUrl:'https://maps.google.com/?q=MG+Road+Haveri' },
  { id:35, name:'CMC Waste Center Karwar', area:'Uttara Kannada', address:'Port Road, Karwar 581301', phone:'08382-226000', verified:true, rating:4.2, reviews:14, materials:['Paper','Plastic','Metal','Glass'], hours:'Mon–Sat 8AM–5PM', mapUrl:'https://maps.google.com/?q=Port+Road+Karwar' },
  { id:36, name:'CMC Waste Center Koppal', area:'Koppal', address:'Station Road, Koppal 583231', phone:'08539-220000', verified:true, rating:4.0, reviews:8, materials:['Paper','Plastic','Metal'], hours:'Mon–Sat 8AM–5PM', mapUrl:'https://maps.google.com/?q=Station+Road+Koppal' },
  { id:37, name:'CMC Waste Center Hosapete', area:'Vijayanagara', address:'Hampi Road, Hosapete 583201', phone:'08394-228000', verified:true, rating:4.1, reviews:12, materials:['Paper','Plastic','Metal'], hours:'Mon–Sat 8AM–5PM', mapUrl:'https://maps.google.com/?q=Hampi+Road+Hosapete' },
  { id:38, name:'CMC Waste Center Yadgir', area:'Yadgir', address:'Main Road, Yadgir 585201', phone:'08473-252000', verified:true, rating:4.0, reviews:7, materials:['Paper','Plastic','Metal'], hours:'Mon–Sat 8AM–5PM', mapUrl:'https://maps.google.com/?q=Main+Road+Yadgir' },
  { id:39, name:'CMC Waste Center Chamarajanagar', area:'Chamarajanagar', address:'BM Road, Chamarajanagar 571313', phone:'08226-222000', verified:true, rating:4.0, reviews:9, materials:['Paper','Plastic','Metal'], hours:'Mon–Sat 8AM–5PM', mapUrl:'https://maps.google.com/?q=BM+Road+Chamarajanagar' },
  { id:40, name:'CMC Waste Center Chikkaballapur', area:'Chikkaballapur', address:'Bangalore Road, Chikkaballapur 562101', phone:'08156-272000', verified:true, rating:4.0, reviews:8, materials:['Paper','Plastic','Metal'], hours:'Mon–Sat 8AM–5PM', mapUrl:'https://maps.google.com/?q=Bangalore+Road+Chikkaballapur' },
]

// ── Scrap Prices ─────────────────────────────────────────────────────────────
const SCRAP_PRICES = [
  { material:'Newspaper', material_kn:'ಪತ್ರಿಕೆ', price:'Rs 12–15/kg', trend:'up', color:'#f59e0b', tip:'Bundle neatly for best price', tip_kn:'ಉತ್ತಮ ಬೆಲೆಗೆ ಚೊಕ್ಕಟವಾಗಿ ಕಟ್ಟಿ' },
  { material:'Cardboard', material_kn:'ಕಾರ್ಡ್‌ಬೋರ್ಡ್', price:'Rs 8–12/kg', trend:'stable', color:'#f59e0b', tip:'Flatten and keep dry', tip_kn:'ಚಪ್ಪಟೆ ಮಾಡಿ ಒಣಗಿಸಿ ಇಡಿ' },
  { material:'White Paper', material_kn:'ಬಿಳಿ ಕಾಗದ', price:'Rs 14–18/kg', trend:'up', color:'#f59e0b', tip:'Remove staples and clips', tip_kn:'ಸ್ಟೇಪಲ್ ಮತ್ತು ಕ್ಲಿಪ್ ತೆಗೆಯಿರಿ' },
  { material:'PET Bottles', material_kn:'PET ಬಾಟಲಿ', price:'Rs 5–10/kg', trend:'stable', color:'#3b82f6', tip:'Crush and remove caps', tip_kn:'ಹಿಸುಕಿ ಮುಚ್ಚಳ ತೆಗೆಯಿರಿ' },
  { material:'HDPE Plastic', material_kn:'HDPE ಪ್ಲಾಸ್ಟಿಕ್', price:'Rs 8–12/kg', trend:'stable', color:'#3b82f6', tip:'Clean before selling', tip_kn:'ಮಾರುವ ಮೊದಲು ತೊಳೆಯಿರಿ' },
  { material:'Mixed Plastic', material_kn:'ಮಿಶ್ರ ಪ್ಲಾಸ್ಟಿಕ್', price:'Rs 2–5/kg', trend:'down', color:'#3b82f6', tip:'Separate by type for better price', tip_kn:'ಉತ್ತಮ ಬೆಲೆಗೆ ವಿಧ ಪ್ರಕಾರ ಬೇರ್ಪಡಿಸಿ' },
  { material:'Aluminium Cans', material_kn:'ಅಲ್ಯೂಮಿನಿಯಂ ಕ್ಯಾನ್', price:'Rs 80–120/kg', trend:'up', color:'#6366f1', tip:'Crush to save space', tip_kn:'ಜಾಗ ಉಳಿಸಲು ಹಿಸುಕಿ' },
  { material:'Copper Wire', material_kn:'ತಾಮ್ರದ ತಂತಿ', price:'Rs 400–500/kg', trend:'up', color:'#6366f1', tip:'Strip insulation for higher price', tip_kn:'ಹೆಚ್ಚಿನ ಬೆಲೆಗೆ ಇನ್ಸುಲೇಷನ್ ತೆಗೆಯಿರಿ' },
  { material:'Steel/Iron', material_kn:'ಉಕ್ಕು/ಕಬ್ಬಿಣ', price:'Rs 20–30/kg', trend:'stable', color:'#6366f1', tip:'Remove non-metal parts', tip_kn:'ಲೋಹೇತರ ಭಾಗಗಳನ್ನು ತೆಗೆಯಿರಿ' },
  { material:'Brass', material_kn:'ಹಿತ್ತಾಳೆ', price:'Rs 280–320/kg', trend:'up', color:'#6366f1', tip:'Clean and separate grades', tip_kn:'ಸ್ವಚ್ಛಗೊಳಿಸಿ ದರ್ಜೆ ಪ್ರಕಾರ ಬೇರ್ಪಡಿಸಿ' },
  { material:'Glass Bottles', material_kn:'ಗಾಜಿನ ಬಾಟಲಿ', price:'Rs 2–5/piece', trend:'stable', color:'#10b981', tip:'Keep intact, no broken glass', tip_kn:'ಒಡೆಯದಂತೆ ಸಂಪೂರ್ಣ ಇಡಿ' },
  { material:'Mobile Phones', material_kn:'ಮೊಬೈಲ್ ಫೋನ್', price:'Rs 50–500/piece', trend:'up', color:'#ef4444', tip:'Factory reset before selling', tip_kn:'ಮಾರುವ ಮೊದಲು ಫ್ಯಾಕ್ಟರಿ ರೀಸೆಟ್ ಮಾಡಿ' },
  { material:'Laptop/Computer', material_kn:'ಲ್ಯಾಪ್‌ಟಾಪ್/ಕಂಪ್ಯೂಟರ್', price:'Rs 500–3000/piece', trend:'up', color:'#ef4444', tip:'Remove personal data first', tip_kn:'ಮೊದಲು ವೈಯಕ್ತಿಕ ಡೇಟಾ ಅಳಿಸಿ' },
  { material:'Batteries', material_kn:'ಬ್ಯಾಟರಿ', price:'Rs 10–50/kg', trend:'stable', color:'#ef4444', tip:'Only at certified e-waste centers', tip_kn:'ಪ್ರಮಾಣೀಕೃತ ಇ-ತ್ಯಾಜ್ಯ ಕೇಂದ್ರದಲ್ಲಿ ಮಾತ್ರ' },
  { material:'Cotton Cloth', material_kn:'ಹತ್ತಿ ಬಟ್ಟೆ', price:'Rs 5–15/kg', trend:'stable', color:'#8b5cf6', tip:'Clean and dry before selling', tip_kn:'ಮಾರುವ ಮೊದಲು ತೊಳೆದು ಒಣಗಿಸಿ' },
  { material:'Rubber/Tyres', material_kn:'ರಬ್ಬರ್/ಟೈರ್', price:'Rs 5–10/kg', trend:'stable', color:'#8b5cf6', tip:'Cut into pieces for better price', tip_kn:'ಉತ್ತಮ ಬೆಲೆಗೆ ತುಂಡು ಮಾಡಿ' },
]

// ── Marketplace constants ─────────────────────────────────────────────────────
const MP_MATERIALS = ['All','Paper','Plastic','Metal','Glass','E-Waste','Cloth','Rubber','Cardboard','Copper','Aluminium','Steel']
const MP_MATERIALS_KN = { All:'ಎಲ್ಲಾ', Paper:'ಕಾಗದ', Plastic:'ಪ್ಲಾಸ್ಟಿಕ್', Metal:'ಲೋಹ', Glass:'ಗಾಜು', 'E-Waste':'ಇ-ತ್ಯಾಜ್ಯ', Cloth:'ಬಟ್ಟೆ', Rubber:'ರಬ್ಬರ್', Cardboard:'ಕಾರ್ಡ್‌ಬೋರ್ಡ್', Copper:'ತಾಮ್ರ', Aluminium:'ಅಲ್ಯೂಮಿನಿಯಂ', Steel:'ಉಕ್ಕು' }
const KAB_MATERIALS_KN = { Paper:'ಕಾಗದ', Plastic:'ಪ್ಲಾಸ್ಟಿಕ್', Metal:'ಲೋಹ', Glass:'ಗಾಜು', 'E-Waste':'ಇ-ತ್ಯಾಜ್ಯ', Cloth:'ಬಟ್ಟೆ', Cardboard:'ಕಾರ್ಡ್‌ಬೋರ್ಡ್', Batteries:'ಬ್ಯಾಟರಿ', Electronics:'ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್', 'Mobile Phones':'ಮೊಬೈಲ್ ಫೋನ್', Rubber:'ರಬ್ಬರ್', Copper:'ತಾಮ್ರ', Aluminium:'ಅಲ್ಯೂಮಿನಿಯಂ', Steel:'ಉಕ್ಕು' }
const MP_AREAS = ['All','Koramangala','Indiranagar','HSR Layout','Whitefield','Jayanagar','Malleshwaram','BTM Layout','Electronic City','Rajajinagar','Hebbal','Yelahanka','Banashankari','JP Nagar','Marathahalli','Bellandur','Sarjapur','Bommanahalli','Basavanagudi','Shivajinagar','Yeshwanthpur','Mysuru City','Vijayanagar Mysuru','Kuvempunagar','Hebbal Mysuru','Nazarbad','Mangaluru City','Kadri','Bejai','Kankanady','Urwa','Hubballi','Dharwad','Vidyanagar Hubballi','Keshwapur','Belagavi City','Tilakwadi','Shahapur Belagavi','Kalaburagi City','Aland Road','Ballari City','Toranagallu','Shivamogga City','Sagar','Davanagere City','Harihara','Tumakuru City','Tiptur','Hassan City','Arsikere','Udupi City','Manipal','Kundapur','Vijayapura City','Bidar City','Raichur City','Sindhanur','Chitradurga City','Challakere','Chikkamagaluru City','Kadur','Madikeri','Kushalnagar','Mandya City','Maddur','Chamarajanagar City','Kollegal','Ramanagara City','Channapatna','Kolar City','KGF','Chikkaballapur City','Gauribidanur','Bagalkot City','Badami','Gadag City','Ron','Haveri City','Ranebennur','Karwar','Sirsi','Kumta','Koppal City','Gangavathi','Yadgir City','Shorapur','Hosapete','Kampli']
const MAT_COLORS = { Paper:'#f59e0b', Plastic:'#3b82f6', Metal:'#6366f1', Glass:'#10b981', 'E-Waste':'#ef4444', Cloth:'#8b5cf6', Rubber:'#64748b', Cardboard:'#f59e0b', Copper:'#f97316', Aluminium:'#6366f1', Steel:'#475569' }
const MAT_IMGS = {
  Paper:'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80',
  Plastic:'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=400&q=80',
  Metal:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  Glass:'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&q=80',
  'E-Waste':'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&q=80',
  Cloth:'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&q=80',
  Cardboard:'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80',
  Copper:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  Aluminium:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  Steel:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
}
const MATERIAL_FILTER = ['All', 'Paper', 'Plastic', 'Metal', 'E-Waste', 'Glass', 'Cloth']

const DEMO_LISTINGS = [
  { id:'d1', seller_name:'Ravi Kumar', title:'Old Newspapers Bundle', material_type:'Paper', quantity_kg:25, price_per_kg:13, total_price:325, negotiable:true, condition:'good', description:'Clean dry newspapers collected over 3 months. Ready for pickup.', location_area:'Koramangala', location_city:'Bengaluru', contact_phone:'9880123456', contact_whatsapp:'9880123456', image_url:'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80', views:34, created_at: new Date(Date.now()-2*86400000).toISOString() },
  { id:'d2', seller_name:'Priya S', title:'PET Bottles — Crushed', material_type:'Plastic', quantity_kg:15, price_per_kg:8, total_price:120, negotiable:true, condition:'good', description:'Crushed PET bottles, caps removed. Collected from apartment complex.', location_area:'HSR Layout', location_city:'Bengaluru', contact_phone:'9900112233', contact_whatsapp:'9900112233', image_url:'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=400&q=80', views:21, created_at: new Date(Date.now()-1*86400000).toISOString() },
  { id:'d3', seller_name:'Mohammed A', title:'Aluminium Cans — 8kg', material_type:'Aluminium', quantity_kg:8, price_per_kg:90, total_price:720, negotiable:false, condition:'good', description:'Clean aluminium beverage cans. Crushed and ready.', location_area:'Indiranagar', location_city:'Bengaluru', contact_phone:'9845001122', contact_whatsapp:'9845001122', image_url:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', views:56, created_at: new Date(Date.now()-3*86400000).toISOString() },
  { id:'d4', seller_name:'Sunita R', title:'Old Clothes & Fabric', material_type:'Cloth', quantity_kg:12, price_per_kg:10, total_price:120, negotiable:true, condition:'fair', description:'Mixed cotton and synthetic clothes. Washed and sorted.', location_area:'Jayanagar', location_city:'Bengaluru', contact_phone:'9741234567', contact_whatsapp:'9741234567', image_url:'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&q=80', views:18, created_at: new Date(Date.now()-4*86400000).toISOString() },
  { id:'d5', seller_name:'Kiran B', title:'Copper Wire Scrap', material_type:'Copper', quantity_kg:3, price_per_kg:420, total_price:1260, negotiable:true, condition:'good', description:'Stripped copper wire from old electrical work. High purity.', location_area:'Whitefield', location_city:'Bengaluru', contact_phone:'9632145678', contact_whatsapp:'9632145678', image_url:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', views:89, created_at: new Date(Date.now()-5*86400000).toISOString() },
  { id:'d6', seller_name:'Ananya M', title:'Cardboard Boxes — Flat', material_type:'Cardboard', quantity_kg:30, price_per_kg:9, total_price:270, negotiable:true, condition:'good', description:'Flattened cardboard from online deliveries. Dry and clean.', location_area:'BTM Layout', location_city:'Bengaluru', contact_phone:'9876543210', contact_whatsapp:'9876543210', image_url:'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80', views:42, created_at: new Date(Date.now()-6*86400000).toISOString() },
]

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff/3600000), d = Math.floor(diff/86400000)
  if (d > 0) return `${d}d ago`
  if (h > 0) return `${h}h ago`
  return 'Just now'
}

function TrendIcon({ trend }) {
  if (trend === 'up') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
  if (trend === 'down') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
}

function ListingCard({ listing, lang, onContact, onView }) {
  const color = MAT_COLORS[listing.material_type] || '#10b981'
  const img = listing.image_url || MAT_IMGS[listing.material_type] || MAT_IMGS.Paper
  return (
    <div className="mp-card" onClick={() => onView(listing)}>
      <div className="mp-card-img-wrap">
        <img src={img} alt={listing.title} className="mp-card-img" loading="lazy"/>
        <div className="mp-card-img-overlay"/>
        <div className="mp-mat-badge" style={{background:color}}>{lang==='kn' ? MP_MATERIALS_KN[listing.material_type]||listing.material_type : listing.material_type}</div>
        {listing.negotiable && <div className="mp-neg-badge">{lang==='kn'?'ಮಾತುಕತೆ':'Negotiable'}</div>}
        <div className="mp-views">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          {listing.views || 0}
        </div>
      </div>
      <div className="mp-card-body">
        <h3 className="mp-card-title">{listing.title}</h3>
        <div className="mp-card-price">
          <span className="mp-price-big">₹{listing.total_price}</span>
          {listing.quantity_kg && <span className="mp-price-sub">({listing.quantity_kg}kg @ ₹{listing.price_per_kg}/kg)</span>}
        </div>
        <div className="mp-card-meta">
          <span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {listing.location_area}, {listing.location_city}
          </span>
          <span>{timeAgo(listing.created_at)}</span>
        </div>
        <div className="mp-card-seller">
          <div className="mp-seller-avatar">{(listing.seller_name||'U')[0].toUpperCase()}</div>
          <span>{listing.seller_name || 'Anonymous'}</span>
        </div>
        <button className="mp-contact-btn" style={{background:color}} onClick={e=>{e.stopPropagation();onContact(listing)}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          {lang==='kn'?'ಸಂಪರ್ಕಿಸಿ':'Contact Seller'}
        </button>
      </div>
    </div>
  )
}

export default function Find({ session }) {
  const navigate = useNavigate()
  const { lang } = useApp()
  const [activeTab, setActiveTab] = useState('map')
  const [selectedArea, setSelectedArea] = useState('All')
  const [selectedMaterial, setSelectedMaterial] = useState('All')
  const [selectedKabadiwala, setSelectedKabadiwala] = useState(null)

  // Marketplace state
  const [listings, setListings] = useState([])
  const [mpLoading, setMpLoading] = useState(false)
  const [mpView, setMpView] = useState('browse') // browse, sell, detail, contact
  const [selectedListing, setSelectedListing] = useState(null)
  const [matFilter, setMatFilter] = useState('All')
  const [areaFilter, setAreaFilter] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [mpMsg, setMpMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ title:'', material_type:'Paper', quantity_kg:'', price_per_kg:'', negotiable:true, condition:'good', description:'', location_area:'Koramangala', contact_phone:'', contact_whatsapp:'' })

  // Complaint state
  const [cView, setCView] = useState('feed')
  const [complaints, setComplaints] = useState([])
  const [cLoading, setCLoading] = useState(false)
  const [cSubmitting, setCSubmitting] = useState(false)
  const [cMsg, setCMsg] = useState({ text:'', ok:true })
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [cTypeFilter, setCTypeFilter] = useState('All')
  const [cStatusFilter, setCStatusFilter] = useState('All')
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [camOpen, setCamOpen] = useState(false)
  const [cForm, setCForm] = useState({ type:'illegal_dumping', title:'', description:'', location_text:'', location_lat:'', location_lng:'', photo:null, photoPreview:null, contact_phone:'', severity:'medium' })

  const userId = session?.user?.id
  const userName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Seller'

  useEffect(() => { if (activeTab === 'sell') loadListings() }, [activeTab])

  async function loadListings() {
    setMpLoading(true)
    if (!supabaseConfigured) { setListings(DEMO_LISTINGS); setMpLoading(false); return }
    try {
      const { data } = await supabase.from('marketplace_listings').select('*').eq('status','active').order('created_at',{ascending:false}).limit(100)
      setListings(data?.length ? data : DEMO_LISTINGS)
    } catch { setListings(DEMO_LISTINGS) }
    setMpLoading(false)
  }

  async function submitListing() {
    if (!form.title || !form.contact_phone) return setMpMsg('Fill in title and contact number')
    setSubmitting(true); setMpMsg('')
    try {
      const total = form.quantity_kg && form.price_per_kg ? parseFloat(form.quantity_kg) * parseFloat(form.price_per_kg) : null
      const { error } = await supabase.from('marketplace_listings').insert({
        user_id: userId, seller_name: userName, title: form.title, material_type: form.material_type,
        quantity_kg: form.quantity_kg ? parseFloat(form.quantity_kg) : null,
        price_per_kg: form.price_per_kg ? parseFloat(form.price_per_kg) : null,
        total_price: total, negotiable: form.negotiable, condition: form.condition,
        description: form.description, location_area: form.location_area, location_city: 'Karnataka',
        contact_phone: form.contact_phone, contact_whatsapp: form.contact_whatsapp || form.contact_phone,
        image_url: MAT_IMGS[form.material_type] || ''
      })
      if (error) throw error
      setMpMsg('Listed successfully!')
      await loadListings()
      setMpView('browse')
      setForm({ title:'', material_type:'Paper', quantity_kg:'', price_per_kg:'', negotiable:true, condition:'good', description:'', location_area:'Koramangala', contact_phone:'', contact_whatsapp:'' })
    } catch(e) { setMpMsg(e.message) }
    setSubmitting(false)
  }

  async function viewListing(listing) {
    setSelectedListing(listing)
    setMpView('detail')
    if (supabaseConfigured && listing.id && !listing.id.startsWith('d')) {
      await supabase.from('marketplace_listings').update({ views: (listing.views||0)+1 }).eq('id', listing.id)
    }
  }

  function contactSeller(listing) { setSelectedListing(listing); setMpView('contact') }

  const filteredListings = listings.filter(l => {
    const mOk = matFilter === 'All' || l.material_type === matFilter
    const aOk = areaFilter === 'All' || l.location_area === areaFilter
    return mOk && aOk
  }).sort((a,b) => {
    if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at)
    if (sortBy === 'price_low') return (a.total_price||0) - (b.total_price||0)
    if (sortBy === 'price_high') return (b.total_price||0) - (a.total_price||0)
    return 0
  })

  const areas = ['All', ...Array.from(new Set(KABADIWALAS.map(k => k.area)))]
  const filteredKabs = KABADIWALAS.filter(k => {
    const matchArea = selectedArea === 'All' || k.area === selectedArea
    const matchMat = selectedMaterial === 'All' || k.materials.some(m => m.toLowerCase().includes(selectedMaterial.toLowerCase()))
    return matchArea && matchMat
  })

  // When switching tabs, reset marketplace sub-view
  function switchTab(tab) {
    setActiveTab(tab)
    setMpView('browse')
    setSelectedListing(null)
    setCView('feed')
    stopCamera()
    if (tab === 'complaint') loadComplaints()
  }

  // ── Complaint helpers ──
  async function loadComplaints() {
    setCLoading(true)
    if (!supabaseConfigured) { setComplaints([]); setCLoading(false); return }
    try {
      const { data } = await supabase.from('complaints').select('*').order('created_at',{ascending:false}).limit(50)
      setComplaints(data || [])
    } catch { setComplaints([]) }
    setCLoading(false)
  }

  function getLocation() {
    if (!navigator.geolocation) return setCMsg({ text: lang==='kn'?'GPS ಲಭ್ಯವಿಲ್ಲ':'GPS not available on this device', ok:false })
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCForm(f => ({ ...f, location_lat: pos.coords.latitude.toFixed(6), location_lng: pos.coords.longitude.toFixed(6) }))
        setCMsg({ text: lang==='kn'?'ಸ್ಥಳ ಪಡೆಯಲಾಗಿದೆ ✓':'Location captured ✓', ok:true })
      },
      () => setCMsg({ text: lang==='kn'?'ಸ್ಥಳ ಪಡೆಯಲು ವಿಫಲವಾಗಿದೆ':'Could not get location. Please enter manually.', ok:false })
    )
  }

  function handlePhotoUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setCForm(f => ({ ...f, photo: file, photoPreview: ev.target.result }))
    reader.readAsDataURL(file)
  }

  async function openCamera() {
    setCamOpen(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode:'environment' } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch { setCMsg({ text: lang==='kn'?'ಕ್ಯಾಮೆರಾ ತೆರೆಯಲು ವಿಫಲ':'Could not open camera', ok:false }); setCamOpen(false) }
  }

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return
    const v = videoRef.current, c = canvasRef.current
    c.width = v.videoWidth; c.height = v.videoHeight
    c.getContext('2d').drawImage(v, 0, 0)
    const dataUrl = c.toDataURL('image/jpeg', 0.85)
    setCForm(f => ({ ...f, photoPreview: dataUrl, photo: dataUrl }))
    stopCamera()
  }

  function stopCamera() {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null }
    setCamOpen(false)
  }

  async function submitComplaint() {
    if (!cForm.title || !cForm.description || !cForm.location_text) return setCMsg({ text: lang==='kn'?'ಶೀರ್ಷಿಕೆ, ವಿವರಣೆ ಮತ್ತು ಸ್ಥಳ ಅಗತ್ಯ':'Title, description and location are required', ok:false })
    setCSubmitting(true); setCMsg({ text:'', ok:true })
    const reporterName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Anonymous'
    try {
      if (!supabaseConfigured) throw new Error('demo')
      const { error } = await supabase.from('complaints').insert({
        user_id: userId, reporter_name: reporterName,
        type: cForm.type, title: cForm.title, description: cForm.description,
        location_text: cForm.location_text, location_lat: cForm.location_lat || null, location_lng: cForm.location_lng || null,
        severity: cForm.severity, status: 'pending', upvotes: 0,
        photo_url: cForm.photoPreview || null, contact_phone: cForm.contact_phone || null,
      })
      if (error) throw error
      setCMsg({ text: lang==='kn'?'ದೂರು ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!':'Complaint submitted successfully!', ok:true })
      setCForm({ type:'illegal_dumping', title:'', description:'', location_text:'', location_lat:'', location_lng:'', photo:null, photoPreview:null, contact_phone:'', severity:'medium' })
      await loadComplaints()
      setTimeout(() => setCView('feed'), 1500)
    } catch(e) {
      const errMsg = e.message === 'demo' || !supabaseConfigured
        ? (lang==='kn' ? 'Supabase ಸಂಪರ್ಕಿಸಲಾಗಿಲ್ಲ. ದೂರು ಉಳಿಸಲು Supabase ಸೆಟಪ್ ಮಾಡಿ.' : 'Supabase not connected. Please set up Supabase to save complaints.')
        : e.message
      setCMsg({ text: errMsg, ok: false })
    }
    setCSubmitting(false)
  }

  async function upvoteComplaint(c) {
    setComplaints(prev => prev.map(x => x.id === c.id ? { ...x, upvotes: (x.upvotes||0)+1 } : x))
    if (supabaseConfigured && !c.id.startsWith('c') && !c.id.startsWith('new')) {
      await supabase.from('complaints').update({ upvotes: (c.upvotes||0)+1 }).eq('id', c.id)
    }
  }

  const COMPLAINT_TYPES = {
    illegal_dumping: { en:'Illegal Dumping', kn:'ಅಕ್ರಮ ತ್ಯಾಜ್ಯ ಎಸೆತ', color:'#ef4444', icon:'🗑️' },
    missed_collection: { en:'Missed Collection', kn:'ಸಂಗ್ರಹ ತಪ್ಪಿದೆ', color:'#f59e0b', icon:'🚛' },
    open_burning: { en:'Open Burning', kn:'ಬಯಲು ದಹನ', color:'#f97316', icon:'🔥' },
    overflowing_bin: { en:'Overflowing Bin', kn:'ತುಂಬಿ ಹರಿಯುತ್ತಿರುವ ಬಿನ್', color:'#8b5cf6', icon:'♻️' },
    water_pollution: { en:'Water Pollution', kn:'ನೀರು ಮಾಲಿನ್ಯ', color:'#3b82f6', icon:'💧' },
    other: { en:'Other', kn:'ಇತರ', color:'#6b7280', icon:'⚠️' },
  }
  const SEVERITY_COLORS = { low:'#10b981', medium:'#f59e0b', high:'#ef4444', critical:'#7c3aed' }
  const STATUS_LABELS = {
    pending: { en:'Pending', kn:'ಬಾಕಿ', color:'#f59e0b' },
    under_review: { en:'Under Review', kn:'ಪರಿಶೀಲನೆಯಲ್ಲಿ', color:'#3b82f6' },
    resolved: { en:'Resolved', kn:'ಪರಿಹರಿಸಲಾಗಿದೆ', color:'#10b981' },
    rejected: { en:'Rejected', kn:'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ', color:'#ef4444' },
  }

  const filteredComplaints = complaints.filter(c => {
    const tOk = cTypeFilter === 'All' || c.type === cTypeFilter
    const sOk = cStatusFilter === 'All' || c.status === cStatusFilter
    return tOk && sOk
  })

  return (
    <div className="find-root">
      {/* Topbar */}
      <div className="find-topbar">
        <button className="scan-back" onClick={() => {
          if (activeTab === 'sell' && mpView !== 'browse') { setMpView('browse'); setSelectedListing(null) }
          else navigate('/')
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          {lang === 'kn' ? 'ಹಿಂದೆ' : 'Back'}
        </button>
        <div className="find-topbar-brand">
          <RecycleLogo size={22}/>
          <span>{lang === 'kn' ? 'ಕಬಾಡಿ & ಮಾರುಕಟ್ಟೆ' : 'Find & Sell Scrap'}</span>
        </div>
        {activeTab === 'sell' && mpView === 'browse' && userId && (
          <button className="mp-sell-btn" onClick={() => setMpView('sell')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {lang === 'kn' ? 'ಮಾರಿ' : 'Sell'}
          </button>
        )}
        {!(activeTab === 'sell' && mpView === 'browse' && userId) && <div style={{width:80}}/>}
      </div>

      {/* Hero with tabs */}
      <div className="find-hero">
        <h1>{lang === 'kn' ? 'ಕರ್ನಾಟಕ ಸ್ಕ್ರ್ಯಾಪ್ ಕೇಂದ್ರ' : 'Karnataka Scrap Hub'}</h1>
        <p>{lang === 'kn' ? 'ಹತ್ತಿರದ ಕೇಂದ್ರ ಹುಡುಕಿ, ಬೆಲೆ ತಿಳಿಯಿರಿ ಮತ್ತು ನಿಮ್ಮ ಸ್ಕ್ರ್ಯಾಪ್ ಮಾರಿ' : 'Find recycling centers, check scrap prices, and sell your scrap'}</p>
        <div className="find-tabs">
          <button className={`find-tab ${activeTab==='map'?'active':''}`} onClick={() => switchTab('map')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {lang === 'kn' ? 'ನಕ್ಷೆ & ಕೇಂದ್ರಗಳು' : 'Map & Centers'}
          </button>
          <button className={`find-tab ${activeTab==='prices'?'active':''}`} onClick={() => switchTab('prices')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            {lang === 'kn' ? 'ಸ್ಕ್ರ್ಯಾಪ್ ಬೆಲೆ' : 'Scrap Prices'}
          </button>
          <button className={`find-tab ${activeTab==='sell'?'active':''}`} onClick={() => switchTab('sell')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {lang === 'kn' ? 'ಸ್ಕ್ರ್ಯಾಪ್ ಮಾರಿ' : 'Sell Scrap'}
          </button>
          <button className={`find-tab ${activeTab==='complaint'?'active complaint-tab':''}`} onClick={() => switchTab('complaint')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            {lang === 'kn' ? 'ದೂರು' : 'Complaints'}
          </button>
        </div>
      </div>

      {/* ── MAP TAB ── */}
      {activeTab === 'map' && (
        <div className="find-container">
          <div className="find-filters-row">
            <div className="find-filter-group">
              <label>{lang === 'kn' ? 'ಪ್ರದೇಶ' : 'Area'}</label>
              <select value={selectedArea} onChange={e=>setSelectedArea(e.target.value)} className="find-select">
                {areas.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="find-filter-group">
              <label>{lang === 'kn' ? 'ವಸ್ತು' : 'Material'}</label>
              <select value={selectedMaterial} onChange={e=>setSelectedMaterial(e.target.value)} className="find-select">
                {MATERIAL_FILTER.map(m => <option key={m} value={m}>{lang==='kn' ? MP_MATERIALS_KN[m]||m : m}</option>)}
              </select>
            </div>
            <div className="find-result-count">{filteredKabs.length} {lang === 'kn' ? 'ಕೇಂದ್ರಗಳು' : 'centers found'}</div>
          </div>

          <div className="find-map-wrap">
            <iframe
              title="Karnataka Kabadiwala Map"
              src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d3970000!2d76.5!3d14.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1skabadiwala%20karnataka!5e0!3m2!1sen!2sin!4v1704067200000!5m2!1sen!2sin"
              className="find-map"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="find-map-overlay-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {lang === 'kn' ? 'ಕೆಳಗಿನ ಪಟ್ಟಿಯಿಂದ ಕೇಂದ್ರ ಆಯ್ಕೆ ಮಾಡಿ — ಕರ್ನಾಟಕದ 40+ ಕೇಂದ್ರಗಳು' : 'Select a center below to get directions — 40+ centers across Karnataka'}
            </div>
          </div>

          <div className="kab-grid">
            {filteredKabs.map(k => (
              <div key={k.id} className={`kab-card ${selectedKabadiwala?.id === k.id ? 'selected' : ''}`}
                onClick={() => setSelectedKabadiwala(selectedKabadiwala?.id === k.id ? null : k)}>
                <div className="kab-card-top">
                  <div className="kab-card-left">
                    {k.verified && (
                      <div className="kab-verified">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="#10b981"><polyline points="20 6 9 17 4 12"/></svg>
                        {lang === 'kn' ? 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ' : 'Verified'}
                      </div>
                    )}
                    <h3 className="kab-name">{k.name}</h3>
                    <p className="kab-area">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      {k.area}
                    </p>
                  </div>
                  <div className="kab-rating">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <span>{k.rating}</span>
                    <small>({k.reviews})</small>
                  </div>
                </div>

                {selectedKabadiwala?.id === k.id ? (
                  <div className="kab-expanded">
                    <div className="kab-detail-row">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      <span>{k.address}</span>
                    </div>
                    <div className="kab-detail-row">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      <span>{k.phone}</span>
                    </div>
                    <div className="kab-detail-row">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      <span>{k.hours}</span>
                    </div>
                    <div className="kab-materials">
                      {k.materials.map(m => <span key={m} className="kab-mat-tag">{lang==='kn' ? (KAB_MATERIALS_KN[m]||m) : m}</span>)}
                    </div>
                    <a href={k.mapUrl} target="_blank" rel="noopener noreferrer" className="kab-directions-btn">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                      {lang === 'kn' ? 'ದಿಕ್ಕುಗಳು ಪಡೆಯಿರಿ' : 'Get Directions'}
                    </a>
                  </div>
                ) : (
                  <p className="kab-address-preview">{k.address}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PRICES TAB ── */}
      {activeTab === 'prices' && (
        <div className="find-container">
          <div className="prices-header">
            <div>
              <h3>{lang === 'kn' ? 'ಇಂದಿನ ಸ್ಕ್ರ್ಯಾಪ್ ಬೆಲೆ' : "Today's Scrap Prices"}</h3>
              <p>{lang === 'kn' ? 'ಬೆಂಗಳೂರು ಮಾರುಕಟ್ಟೆ ದರ — ಏಪ್ರಿಲ್ 2026' : 'Bengaluru market rates — April 2026'}</p>
            </div>
            <div className="prices-legend">
              <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg> Rising</span>
              <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg> Falling</span>
              <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg> Stable</span>
            </div>
          </div>
          <div className="prices-grid">
            {SCRAP_PRICES.map((p, i) => (
              <div key={i} className="price-card" style={{borderLeft:`3px solid ${p.color}`}}>
                <div className="price-card-top">
                  <div className="price-material">{lang==='kn' ? p.material_kn : p.material}</div>
                  <TrendIcon trend={p.trend}/>
                </div>
                <div className="price-value" style={{color:p.color}}>{p.price}</div>
                <div className="price-tip">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {lang==='kn' ? p.tip_kn : p.tip}
                </div>
              </div>
            ))}
          </div>
          <div className="prices-note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            {lang === 'kn'
              ? 'ಬೆಲೆಗಳು ಅಂದಾಜು ಮಾತ್ರ. ನಿಜವಾದ ಬೆಲೆ ಗುಣಮಟ್ಟ ಮತ್ತು ಪ್ರಮಾಣವನ್ನು ಅವಲಂಬಿಸಿರುತ್ತದೆ.'
              : 'Prices are approximate. Actual rates depend on quality, quantity, and local market conditions. Call ahead to confirm.'}
          </div>
        </div>
      )}

      {/* ── SELL TAB ── */}
      {activeTab === 'sell' && (
        <>
          {/* BROWSE listings */}
          {mpView === 'browse' && (
            <div className="mp-browse">
              <div className="mp-hero-inner">
                <div className="mp-hero-content">
                  <h2>{lang==='kn'?'ನಿಮ್ಮ ಸ್ಕ್ರ್ಯಾಪ್ ಮಾರಿ, ಹಣ ಗಳಿಸಿ':'Sell Your Scrap, Earn Money'}</h2>
                  <p>{lang==='kn'?'ಕರ್ನಾಟಕದ ಸ್ಕ್ರ್ಯಾಪ್ ಮಾರುಕಟ್ಟೆ — ನೇರ ಖರೀದಿದಾರರಿಗೆ ಮಾರಿ':'Karnataka\'s scrap marketplace — sell directly to buyers and kabadiwalas'}</p>
                  <div className="mp-hero-stats">
                    <div><strong>{listings.length}</strong><small>{lang==='kn'?'ಪಟ್ಟಿಗಳು':'Listings'}</small></div>
                    <div><strong>{new Set(listings.map(l=>l.location_area)).size}</strong><small>{lang==='kn'?'ಪ್ರದೇಶಗಳು':'Areas'}</small></div>
                    <div><strong>₹{listings.reduce((a,l)=>a+(l.total_price||0),0).toLocaleString()}</strong><small>{lang==='kn'?'ಒಟ್ಟು ಮೌಲ್ಯ':'Total Value'}</small></div>
                  </div>
                </div>
              </div>

              {mpMsg && <div className="mp-msg success" style={{margin:'0 20px'}}>{mpMsg}</div>}

              <div className="mp-filters-bar">
                <select value={matFilter} onChange={e=>setMatFilter(e.target.value)} className="mp-select">
                  {MP_MATERIALS.map(m=><option key={m} value={m}>{lang==='kn' ? MP_MATERIALS_KN[m]||m : (m==='All'?'All Materials':m)}</option>)}
                </select>
                <select value={areaFilter} onChange={e=>setAreaFilter(e.target.value)} className="mp-select">
                  {MP_AREAS.map(a=><option key={a} value={a}>{a==='All'?(lang==='kn'?'ಎಲ್ಲಾ ಪ್ರದೇಶಗಳು':'All Areas'):a}</option>)}
                </select>
                <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="mp-select">
                  <option value="newest">{lang==='kn'?'ಹೊಸದು ಮೊದಲು':'Newest First'}</option>
                  <option value="price_low">{lang==='kn'?'ಕಡಿಮೆ ಬೆಲೆ':'Price: Low to High'}</option>
                  <option value="price_high">{lang==='kn'?'ಹೆಚ್ಚು ಬೆಲೆ':'Price: High to Low'}</option>
                </select>
                <span className="mp-count">{filteredListings.length} {lang==='kn'?'ಫಲಿತಾಂಶಗಳು':'results'}</span>
              </div>

              {mpLoading ? (
                <div className="mp-loading"><div className="spinner"><div/><div/><div/></div><p>Loading listings...</p></div>
              ) : filteredListings.length === 0 ? (
                <div className="mp-empty"><h3>No listings found</h3><p>Try changing your filters</p></div>
              ) : (
                <div className="mp-grid">
                  {filteredListings.map(l=><ListingCard key={l.id} listing={l} lang={lang} onContact={contactSeller} onView={viewListing}/>)}
                </div>
              )}
            </div>
          )}

          {/* SELL FORM */}
          {mpView === 'sell' && (
            <div className="mp-form-container">
              <h2>{lang==='kn'?'ಹೊಸ ಪಟ್ಟಿ ಸೇರಿಸಿ':'Create New Listing'}</h2>
              {mpMsg && <div className={`mp-msg ${mpMsg.includes('success')?'success':'error'}`}>{mpMsg}</div>}
              <div className="mp-form">
                <div className="mp-field"><label>{lang==='kn'?'ಶೀರ್ಷಿಕೆ':'Title'} *</label><input placeholder={lang==='kn'?'ಉದಾ: ಹಳೆ ಪೇಪರ್ ಬಂಡಲ್':'e.g. Old newspaper bundle'} value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></div>
                <div className="mp-field-row">
                  <div className="mp-field"><label>{lang==='kn'?'ವಸ್ತು ವಿಧ':'Material'}</label>
                    <select value={form.material_type} onChange={e=>setForm({...form,material_type:e.target.value})} className="mp-select-full">
                      {MP_MATERIALS.filter(m=>m!=='All').map(m=><option key={m} value={m}>{lang==='kn' ? MP_MATERIALS_KN[m]||m : m}</option>)}
                    </select>
                  </div>
                  <div className="mp-field"><label>{lang==='kn'?'ಸ್ಥಿತಿ':'Condition'}</label>
                    <select value={form.condition} onChange={e=>setForm({...form,condition:e.target.value})} className="mp-select-full">
                      <option value="excellent">{lang==='kn'?'ಅತ್ಯುತ್ತಮ':'Excellent'}</option>
                      <option value="good">{lang==='kn'?'ಉತ್ತಮ':'Good'}</option>
                      <option value="fair">{lang==='kn'?'ಸಾಧಾರಣ':'Fair'}</option>
                    </select>
                  </div>
                </div>
                <div className="mp-field-row">
                  <div className="mp-field"><label>{lang==='kn'?'ತೂಕ (kg)':'Weight (kg)'}</label><input type="number" placeholder="e.g. 25" value={form.quantity_kg} onChange={e=>setForm({...form,quantity_kg:e.target.value})}/></div>
                  <div className="mp-field"><label>{lang==='kn'?'ಬೆಲೆ (₹/kg)':'Price (₹/kg)'}</label><input type="number" placeholder="e.g. 12" value={form.price_per_kg} onChange={e=>setForm({...form,price_per_kg:e.target.value})}/></div>
                </div>
                {form.quantity_kg && form.price_per_kg && <div className="mp-total-preview">Total: ₹{(parseFloat(form.quantity_kg||0)*parseFloat(form.price_per_kg||0)).toFixed(0)}</div>}
                <div className="mp-field"><label>{lang==='kn'?'ವಿವರಣೆ':'Description'}</label><textarea placeholder={lang==='kn'?'ವಸ್ತುವಿನ ಬಗ್ಗೆ ಹೇಳಿ...':'Describe your scrap...'} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3}/></div>
                <div className="mp-field"><label>{lang==='kn'?'ಪ್ರದೇಶ':'Area'}</label>
                  <select value={form.location_area} onChange={e=>setForm({...form,location_area:e.target.value})} className="mp-select-full">
                    {MP_AREAS.filter(a=>a!=='All').map(a=><option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="mp-field-row">
                  <div className="mp-field"><label>{lang==='kn'?'ಫೋನ್ ನಂಬರ್':'Phone'} *</label><input type="tel" placeholder="9XXXXXXXXX" value={form.contact_phone} onChange={e=>setForm({...form,contact_phone:e.target.value})}/></div>
                  <div className="mp-field"><label>WhatsApp</label><input type="tel" placeholder="9XXXXXXXXX" value={form.contact_whatsapp} onChange={e=>setForm({...form,contact_whatsapp:e.target.value})}/></div>
                </div>
                <label className="mp-negotiable-check">
                  <input type="checkbox" checked={form.negotiable} onChange={e=>setForm({...form,negotiable:e.target.checked})}/>
                  <span>{lang==='kn'?'ಬೆಲೆ ಮಾತುಕತೆ ಸಾಧ್ಯ':'Price is negotiable'}</span>
                </label>
                <button className="mp-submit-btn" onClick={submitListing} disabled={submitting}>
                  {submitting?'Posting...':(lang==='kn'?'ಪಟ್ಟಿ ಪ್ರಕಟಿಸಿ':'Post Listing')}
                </button>
              </div>
            </div>
          )}

          {/* DETAIL */}
          {mpView === 'detail' && selectedListing && (
            <div className="mp-detail-container">
              <div className="mp-detail-img-wrap">
                <img src={selectedListing.image_url || MAT_IMGS[selectedListing.material_type] || MAT_IMGS.Paper} alt={selectedListing.title} className="mp-detail-img"/>
                <div className="mp-detail-mat-badge" style={{background:MAT_COLORS[selectedListing.material_type]||'#10b981'}}>{selectedListing.material_type}</div>
              </div>
              <div className="mp-detail-body">
                <div className="mp-detail-top">
                  <div>
                    <h2>{selectedListing.title}</h2>
                    <div className="mp-detail-price">₹{selectedListing.total_price} {selectedListing.negotiable && <span className="mp-neg-tag">{lang==='kn'?'ಮಾತುಕತೆ':'Negotiable'}</span>}</div>
                    {selectedListing.quantity_kg && <p className="mp-detail-qty">{selectedListing.quantity_kg}kg @ ₹{selectedListing.price_per_kg}/kg</p>}
                  </div>
                </div>
                <div className="mp-detail-info-grid">
                  <div className="mp-dinfo"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg><span>{selectedListing.location_area}, {selectedListing.location_city}</span></div>
                  <div className="mp-dinfo"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span>{timeAgo(selectedListing.created_at)}</span></div>
                  <div className="mp-dinfo"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg><span>{selectedListing.views||0} views</span></div>
                  <div className="mp-dinfo"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg><span>{selectedListing.condition} condition</span></div>
                </div>
                {selectedListing.description && <p className="mp-detail-desc">{selectedListing.description}</p>}
                <div className="mp-detail-seller">
                  <div className="mp-seller-avatar-lg">{(selectedListing.seller_name||'U')[0].toUpperCase()}</div>
                  <div><strong>{selectedListing.seller_name||'Anonymous'}</strong><p>Seller</p></div>
                </div>
                <button className="mp-contact-btn-lg" style={{background:MAT_COLORS[selectedListing.material_type]||'#10b981'}} onClick={()=>contactSeller(selectedListing)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  {lang==='kn'?'ಮಾರಾಟಗಾರರನ್ನು ಸಂಪರ್ಕಿಸಿ':'Contact Seller'}
                </button>
              </div>
            </div>
          )}

          {/* CONTACT */}
          {mpView === 'contact' && selectedListing && (
            <div className="mp-form-container">
              <h2>{lang==='kn'?'ಮಾರಾಟಗಾರರ ಸಂಪರ್ಕ':'Seller Contact'}</h2>
              <div className="mp-contact-card">
                <div className="mp-contact-listing-preview">
                  <img src={selectedListing.image_url||MAT_IMGS[selectedListing.material_type]||MAT_IMGS.Paper} alt="" className="mp-contact-thumb"/>
                  <div><h4>{selectedListing.title}</h4><p>₹{selectedListing.total_price} · {selectedListing.location_area}</p></div>
                </div>
                <div className="mp-contact-seller-info">
                  <div className="mp-seller-avatar-lg">{(selectedListing.seller_name||'U')[0].toUpperCase()}</div>
                  <div><strong>{selectedListing.seller_name||'Anonymous'}</strong><p>{selectedListing.location_area}, Karnataka</p></div>
                </div>
                <div className="mp-contact-methods">
                  <a href={`tel:${selectedListing.contact_phone}`} className="mp-contact-method phone">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <div><strong>{lang==='kn'?'ಕರೆ ಮಾಡಿ':'Call Now'}</strong><span>{selectedListing.contact_phone}</span></div>
                  </a>
                  {selectedListing.contact_whatsapp && (
                    <a href={`https://wa.me/91${selectedListing.contact_whatsapp}?text=Hi, I'm interested in your listing: ${selectedListing.title} on Tyajyadinda Tejassige`} target="_blank" rel="noopener noreferrer" className="mp-contact-method whatsapp">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      <div><strong>WhatsApp</strong><span>{selectedListing.contact_whatsapp}</span></div>
                    </a>
                  )}
                </div>
                <div className="mp-contact-note">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {lang==='kn'?'ಭೇಟಿ ಮಾಡುವ ಮೊದಲು ಬೆಲೆ ಮತ್ತು ಸ್ಥಳ ದೃಢಪಡಿಸಿ':'Confirm price and location before meeting. Stay safe.'}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── COMPLAINT TAB ── */}
      {activeTab === 'complaint' && (
        <div className="cp-root">
          {/* hidden canvas for camera capture */}
          <canvas ref={canvasRef} style={{display:'none'}}/>

          {/* FEED */}
          {cView === 'feed' && (
            <>
              <div className="cp-hero">
                <div className="cp-hero-icon">🚨</div>
                <h2>{lang==='kn'?'ದೂರು ಪೋರ್ಟಲ್':'Complaint Portal'}</h2>
                <p>{lang==='kn'?'ಅಕ್ರಮ ತ್ಯಾಜ್ಯ ಎಸೆತ, ತಪ್ಪಿದ ಸಂಗ್ರಹ ಅಥವಾ ಇತರ ತ್ಯಾಜ್ಯ ಸಮಸ್ಯೆಗಳನ್ನು ಫೋಟೋ ಮತ್ತು GPS ಸ್ಥಳದೊಂದಿಗೆ ವರದಿ ಮಾಡಿ':'Report illegal dumping, missed collection or other waste issues with photo and GPS location'}</p>
                <div className="cp-stats">
                  <div><strong>{complaints.length}</strong><small>{lang==='kn'?'ಒಟ್ಟು ದೂರುಗಳು':'Total Reports'}</small></div>
                  <div><strong>{complaints.filter(c=>c.status==='resolved').length}</strong><small>{lang==='kn'?'ಪರಿಹರಿಸಲಾಗಿದೆ':'Resolved'}</small></div>
                  <div><strong>{complaints.filter(c=>c.status==='pending'||c.status==='under_review').length}</strong><small>{lang==='kn'?'ಬಾಕಿ ಇದೆ':'Pending'}</small></div>
                </div>
                <button className="cp-new-btn" onClick={() => setCView('new')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  {lang==='kn'?'ಹೊಸ ದೂರು ಸಲ್ಲಿಸಿ':'File New Complaint'}
                </button>
              </div>

              <div className="cp-filters">
                <select value={cTypeFilter} onChange={e=>setCTypeFilter(e.target.value)} className="cp-select">
                  <option value="All">{lang==='kn'?'ಎಲ್ಲಾ ವಿಧಗಳು':'All Types'}</option>
                  {Object.entries(COMPLAINT_TYPES).map(([k,v])=><option key={k} value={k}>{lang==='kn'?v.kn:v.en}</option>)}
                </select>
                <select value={cStatusFilter} onChange={e=>setCStatusFilter(e.target.value)} className="cp-select">
                  <option value="All">{lang==='kn'?'ಎಲ್ಲಾ ಸ್ಥಿತಿ':'All Status'}</option>
                  {Object.entries(STATUS_LABELS).map(([k,v])=><option key={k} value={k}>{lang==='kn'?v.kn:v.en}</option>)}
                </select>
                <span className="cp-count">{filteredComplaints.length} {lang==='kn'?'ದೂರುಗಳು':'reports'}</span>
              </div>

              {cLoading ? (
                <div className="mp-loading"><div className="spinner"><div/><div/><div/></div><p>{lang==='kn'?'ಲೋಡ್ ಆಗುತ್ತಿದೆ...':'Loading...'}</p></div>
              ) : (
                <div className="cp-feed">
                  {filteredComplaints.map(c => {
                    const ct = COMPLAINT_TYPES[c.type] || COMPLAINT_TYPES.other
                    const st = STATUS_LABELS[c.status] || STATUS_LABELS.pending
                    return (
                      <div key={c.id} className="cp-card" onClick={()=>{setSelectedComplaint(c);setCView('detail')}}>
                        {c.photo_url && <div className="cp-card-img-wrap"><img src={c.photo_url} alt="" className="cp-card-img"/><div className="cp-card-img-overlay"/></div>}
                        <div className="cp-card-body">
                          <div className="cp-card-top">
                            <span className="cp-type-badge" style={{background:ct.color+'22',color:ct.color,border:`1px solid ${ct.color}44`}}>{ct.icon} {lang==='kn'?ct.kn:ct.en}</span>
                            <span className="cp-status-badge" style={{background:st.color+'22',color:st.color}}>{lang==='kn'?st.kn:st.en}</span>
                          </div>
                          <h3 className="cp-card-title">{c.title}</h3>
                          <p className="cp-card-desc">{c.description}</p>
                          <div className="cp-card-meta">
                            <span><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>{c.location_text}</span>
                            <span>{timeAgo(c.created_at)}</span>
                          </div>
                          <div className="cp-card-footer">
                            <div className="cp-reporter"><div className="cp-avatar">{(c.reporter_name||'A')[0].toUpperCase()}</div><span>{c.reporter_name||'Anonymous'}</span></div>
                            <button className="cp-upvote" onClick={e=>{e.stopPropagation();upvoteComplaint(c)}}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>
                              {c.upvotes||0} {lang==='kn'?'ಬೆಂಬಲ':'Support'}
                            </button>
                          </div>
                          {c.severity === 'critical' && <div className="cp-critical-badge">{lang==='kn'?'⚠️ ತುರ್ತು':'⚠️ Critical'}</div>}
                        </div>
                      </div>
                    )
                  })}
                  {filteredComplaints.length === 0 && <div className="mp-empty"><h3>{lang==='kn'?'ದೂರುಗಳು ಇಲ್ಲ':'No complaints found'}</h3><p>{lang==='kn'?'ಫಿಲ್ಟರ್ ಬದಲಾಯಿಸಿ':'Try changing filters'}</p></div>}
                </div>
              )}
            </>
          )}

          {/* NEW COMPLAINT FORM */}
          {cView === 'new' && (
            <div className="cp-form-container">
              <button className="cp-back-btn" onClick={()=>{setCView('feed');setCMsg({text:'',ok:true})}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                {lang==='kn'?'ಹಿಂದೆ':'Back'}
              </button>
              <h2>{lang==='kn'?'ದೂರು ಸಲ್ಲಿಸಿ':'File a Complaint'}</h2>
              <p className="cp-form-sub">{lang==='kn'?'ಫೋಟೋ ಮತ್ತು GPS ಸ್ಥಳದೊಂದಿಗೆ ನಿಖರ ದೂರು ಸಲ್ಲಿಸಿ. ಸ್ಥಳೀಯ ಅಧಿಕಾರಿಗಳಿಗೆ ಕಳುಹಿಸಲಾಗುತ್ತದೆ.':'Submit an accurate complaint with photo and GPS. Forwarded to local BBMP/municipal authorities.'}</p>

              {cMsg.text && <div className={`cp-msg ${cMsg.ok?'success':'error'}`}>{cMsg.text}</div>}

              {/* Camera */}
              {camOpen && (
                <div className="cp-camera-wrap">
                  <video ref={videoRef} autoPlay playsInline className="cp-video"/>
                  <div className="cp-camera-btns">
                    <button className="cp-capture-btn" onClick={capturePhoto}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M20 7h-3.5l-1.5-2h-6L7.5 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/></svg>
                      {lang==='kn'?'ಫೋಟೋ ತೆಗೆಯಿರಿ':'Capture'}
                    </button>
                    <button className="cp-cancel-cam-btn" onClick={stopCamera}>{lang==='kn'?'ರದ್ದು':'Cancel'}</button>
                  </div>
                </div>
              )}

              <div className="cp-form">
                {/* Photo section */}
                <div className="cp-photo-section">
                  <label className="cp-field-label">{lang==='kn'?'ಫೋಟೋ (ಅಗತ್ಯ ಶಿಫಾರಸು)':'Photo (Recommended)'}</label>
                  {cForm.photoPreview ? (
                    <div className="cp-photo-preview-wrap">
                      <img src={cForm.photoPreview} alt="preview" className="cp-photo-preview"/>
                      <button className="cp-remove-photo" onClick={()=>setCForm(f=>({...f,photo:null,photoPreview:null}))}>✕</button>
                    </div>
                  ) : (
                    <div className="cp-photo-btns">
                      <button className="cp-photo-btn camera" onClick={openCamera}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M20 7h-3.5l-1.5-2h-6L7.5 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/></svg>
                        {lang==='kn'?'ಕ್ಯಾಮೆರಾ ತೆರೆಯಿರಿ':'Open Camera'}
                      </button>
                      <label className="cp-photo-btn gallery">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        {lang==='kn'?'ಗ್ಯಾಲರಿಯಿಂದ':'From Gallery'}
                        <input type="file" accept="image/*" style={{display:'none'}} onChange={handlePhotoUpload}/>
                      </label>
                    </div>
                  )}
                </div>

                {/* Type & Severity */}
                <div className="mp-field-row">
                  <div className="mp-field">
                    <label className="cp-field-label">{lang==='kn'?'ದೂರು ವಿಧ':'Complaint Type'} *</label>
                    <select value={cForm.type} onChange={e=>setCForm(f=>({...f,type:e.target.value}))} className="mp-select-full">
                      {Object.entries(COMPLAINT_TYPES).map(([k,v])=><option key={k} value={k}>{v.icon} {lang==='kn'?v.kn:v.en}</option>)}
                    </select>
                  </div>
                  <div className="mp-field">
                    <label className="cp-field-label">{lang==='kn'?'ತೀವ್ರತೆ':'Severity'}</label>
                    <select value={cForm.severity} onChange={e=>setCForm(f=>({...f,severity:e.target.value}))} className="mp-select-full">
                      <option value="low">{lang==='kn'?'ಕಡಿಮೆ':'Low'}</option>
                      <option value="medium">{lang==='kn'?'ಮಧ್ಯಮ':'Medium'}</option>
                      <option value="high">{lang==='kn'?'ಹೆಚ್ಚು':'High'}</option>
                      <option value="critical">{lang==='kn'?'ತುರ್ತು':'Critical'}</option>
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div className="mp-field">
                  <label className="cp-field-label">{lang==='kn'?'ಶೀರ್ಷಿಕೆ':'Title'} *</label>
                  <input placeholder={lang==='kn'?'ಉದಾ: ಕೆರೆ ಬಳಿ ಅಕ್ರಮ ತ್ಯಾಜ್ಯ ಎಸೆತ':'e.g. Illegal dumping near lake'} value={cForm.title} onChange={e=>setCForm(f=>({...f,title:e.target.value}))}/>
                </div>

                {/* Description */}
                <div className="mp-field">
                  <label className="cp-field-label">{lang==='kn'?'ವಿವರಣೆ':'Description'} *</label>
                  <textarea rows={4} placeholder={lang==='kn'?'ಸಮಸ್ಯೆಯ ಬಗ್ಗೆ ವಿವರವಾಗಿ ಹೇಳಿ — ಎಷ್ಟು ದಿನದಿಂದ, ಎಷ್ಟು ತ್ಯಾಜ್ಯ, ಯಾವ ಸಮಸ್ಯೆ...':'Describe the issue in detail — how long, how much waste, what problem...'} value={cForm.description} onChange={e=>setCForm(f=>({...f,description:e.target.value}))}/>
                </div>

                {/* Location */}
                <div className="mp-field">
                  <label className="cp-field-label">{lang==='kn'?'ಸ್ಥಳ':'Location'} *</label>
                  <div className="cp-location-row">
                    <input placeholder={lang==='kn'?'ಉದಾ: 5ನೇ ಕ್ರಾಸ್, ಕೋರಮಂಗಲ, ಬೆಂಗಳೂರು':'e.g. 5th Cross, Koramangala, Bengaluru'} value={cForm.location_text} onChange={e=>setCForm(f=>({...f,location_text:e.target.value}))} style={{flex:1}}/>
                    <button className="cp-gps-btn" onClick={getLocation} title="Get GPS location">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="8" strokeDasharray="2 2"/></svg>
                      GPS
                    </button>
                  </div>
                  {cForm.location_lat && <div className="cp-gps-tag">📍 {cForm.location_lat}, {cForm.location_lng}</div>}
                </div>

                {/* Contact */}
                <div className="mp-field">
                  <label className="cp-field-label">{lang==='kn'?'ಸಂಪರ್ಕ ಸಂಖ್ಯೆ (ಐಚ್ಛಿಕ)':'Contact Number (Optional)'}</label>
                  <input type="tel" placeholder="9XXXXXXXXX" value={cForm.contact_phone} onChange={e=>setCForm(f=>({...f,contact_phone:e.target.value}))}/>
                </div>

                <button className="cp-submit-btn" onClick={submitComplaint} disabled={cSubmitting}>
                  {cSubmitting ? (lang==='kn'?'ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...':'Submitting...') : (
                    <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>{lang==='kn'?'ದೂರು ಸಲ್ಲಿಸಿ':'Submit Complaint'}</>
                  )}
                </button>

                <div className="cp-authority-note">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  {lang==='kn'?'ನಿಮ್ಮ ದೂರು BBMP / ಸ್ಥಳೀಯ ಪಾಲಿಕೆ ಅಧಿಕಾರಿಗಳಿಗೆ ಕಳುಹಿಸಲಾಗುತ್ತದೆ':'Your complaint will be forwarded to BBMP / local municipal authorities'}
                </div>
              </div>
            </div>
          )}

          {/* DETAIL VIEW */}
          {cView === 'detail' && selectedComplaint && (
            <div className="cp-detail-container">
              <button className="cp-back-btn" onClick={()=>setCView('feed')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                {lang==='kn'?'ಹಿಂದೆ':'Back'}
              </button>
              {selectedComplaint.photo_url && <img src={selectedComplaint.photo_url} alt="" className="cp-detail-img"/>}
              <div className="cp-detail-body">
                <div className="cp-detail-badges">
                  <span className="cp-type-badge" style={{background:COMPLAINT_TYPES[selectedComplaint.type]?.color+'22',color:COMPLAINT_TYPES[selectedComplaint.type]?.color,border:`1px solid ${COMPLAINT_TYPES[selectedComplaint.type]?.color}44`}}>
                    {COMPLAINT_TYPES[selectedComplaint.type]?.icon} {lang==='kn'?COMPLAINT_TYPES[selectedComplaint.type]?.kn:COMPLAINT_TYPES[selectedComplaint.type]?.en}
                  </span>
                  <span className="cp-status-badge" style={{background:STATUS_LABELS[selectedComplaint.status]?.color+'22',color:STATUS_LABELS[selectedComplaint.status]?.color}}>
                    {lang==='kn'?STATUS_LABELS[selectedComplaint.status]?.kn:STATUS_LABELS[selectedComplaint.status]?.en}
                  </span>
                  <span className="cp-sev-badge" style={{background:SEVERITY_COLORS[selectedComplaint.severity]+'22',color:SEVERITY_COLORS[selectedComplaint.severity]}}>
                    {selectedComplaint.severity?.toUpperCase()}
                  </span>
                </div>
                <h2>{selectedComplaint.title}</h2>
                <p className="cp-detail-desc">{selectedComplaint.description}</p>
                <div className="cp-detail-info">
                  <div className="cp-dinfo"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg><span>{selectedComplaint.location_text}</span></div>
                  {selectedComplaint.location_lat && (
                    <a href={`https://maps.google.com/?q=${selectedComplaint.location_lat},${selectedComplaint.location_lng}`} target="_blank" rel="noopener noreferrer" className="cp-map-link">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                      {lang==='kn'?'ನಕ್ಷೆಯಲ್ಲಿ ತೆರೆಯಿರಿ':'Open in Maps'}
                    </a>
                  )}
                  <div className="cp-dinfo"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span>{timeAgo(selectedComplaint.created_at)}</span></div>
                  <div className="cp-dinfo"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>{selectedComplaint.reporter_name||'Anonymous'}</span></div>
                </div>
                <button className="cp-upvote-lg" onClick={()=>upvoteComplaint(selectedComplaint)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>
                  {lang==='kn'?'ಬೆಂಬಲಿಸಿ':'Support this complaint'} ({selectedComplaint.upvotes||0})
                </button>
                <div className="cp-timeline">
                  <h4>{lang==='kn'?'ಸ್ಥಿತಿ ಟೈಮ್‌ಲೈನ್':'Status Timeline'}</h4>
                  <div className="cp-timeline-steps">
                    {['pending','under_review','resolved'].map((s,i) => {
                      const steps = ['pending','under_review','resolved']
                      const current = steps.indexOf(selectedComplaint.status)
                      const done = i <= current
                      return (
                        <div key={s} className={`cp-step ${done?'done':''}`}>
                          <div className="cp-step-dot"/>
                          <span>{lang==='kn'?STATUS_LABELS[s]?.kn:STATUS_LABELS[s]?.en}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

