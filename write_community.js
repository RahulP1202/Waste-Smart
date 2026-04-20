const fs = require('fs');
const out = 'wastesmart-main/frontend-react/src/pages/Community.jsx';

const p1 = `import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import RecycleLogo from '../components/RecycleLogo'
import { supabase, supabaseConfigured } from '../lib/supabase'
import './Community.css'

const TYPE_ICONS = { school:'🏫', apartment:'🏢', office:'💼', general:'🌿' }
const TYPE_COLORS = { school:'#f59e0b', apartment:'#3b82f6', office:'#6366f1', general:'#10b981' }
const REACTIONS = ['👍','🌱','♻️','🔥','💚','🌍']

function generateCode() { return Math.random().toString(36).substring(2,8).toUpperCase() }
function timeAgo(d) {
  const s = Math.floor((Date.now()-new Date(d))/1000)
  if (s<60) return 'just now'
  if (s<3600) return Math.floor(s/60)+'m ago'
  if (s<86400) return Math.floor(s/3600)+'h ago'
  return Math.floor(s/86400)+'d ago'
}
function Avatar({ name, color, size=40 }) {
  const initials = name ? name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase() : '?'
  return <div style={{width:size,height:size,borderRadius:'50%',background:color||'#10b981',display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.38,fontWeight:800,color:'#fff',flexShrink:0}}>{initials}</div>
}

const DEMO_POSTS = [
  { id:'p1', community_id:'demo', user_name:'Priya S', user_color:'#10b981', content:'Just completed the 7-day no-plastic challenge! Switched to cloth bags and steel bottles 🌱', image_url:'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&q=80', post_type:'challenge', reactions:{'👍':12,'🌱':8,'💚':5}, comment_count:2, created_at:new Date(Date.now()-2*3600000).toISOString() },
  { id:'p2', community_id:'demo', user_name:'Rahul M', user_color:'#6366f1', content:'Our apartment collected 45kg of dry waste this week! Heading to Hasiru Dala tomorrow. Who wants to join? ♻️', image_url:null, post_type:'update', reactions:{'👍':19,'♻️':11,'🔥':6}, comment_count:3, created_at:new Date(Date.now()-5*3600000).toISOString() },
  { id:'p3', community_id:'demo', user_name:'Ananya K', user_color:'#f59e0b', content:'Scanned 10 items today — learned my old phone charger is e-waste needing special disposal 🤯', image_url:'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80', post_type:'scan', reactions:{'👍':7,'🌍':9,'🌱':4}, comment_count:1, created_at:new Date(Date.now()-86400000).toISOString() },
]
const DEMO_COMMENTS = {
  p1:[{ id:'c1', user_name:'Kiran B', user_color:'#3b82f6', content:'Amazing! Day 3 and going strong 💪', created_at:new Date(Date.now()-3600000).toISOString() },{ id:'c2', user_name:'Sunita R', user_color:'#8b5cf6', content:'What was the hardest part?', created_at:new Date(Date.now()-1800000).toISOString() }],
  p2:[{ id:'c3', user_name:'Mohammed A', user_color:'#10b981', content:'Count me in! What time?', created_at:new Date(Date.now()-4*3600000).toISOString() }],
  p3:[{ id:'c4', user_name:'Priya S', user_color:'#10b981', content:'Same! The AI is so accurate', created_at:new Date(Date.now()-3600000).toISOString() }],
}
const DEMO_MEMBERS = [
  { id:'m1', user_name:'Priya S', user_color:'#10b981', role:'admin', scans_count:47, points:470, carbon_saved:12.4 },
  { id:'m2', user_name:'Rahul M', user_color:'#6366f1', role:'member', scans_count:38, points:380, carbon_saved:9.8 },
  { id:'m3', user_name:'Ananya K', user_color:'#f59e0b', role:'member', scans_count:29, points:290, carbon_saved:7.2 },
  { id:'m4', user_name:'Kiran B', user_color:'#3b82f6', role:'member', scans_count:21, points:210, carbon_saved:5.1 },
  { id:'m5', user_name:'Sunita R', user_color:'#8b5cf6', role:'member', scans_count:14, points:140, carbon_saved:3.3 },
]
const DEMO_CHALLENGES = [
  { id:'ch1', title:'Scan 100 Items This Month', description:'Collectively scan 100 waste items using WasteSmart AI', target_scans:100, current_scans:67, end_date:'2026-04-30', status:'active' },
  { id:'ch2', title:'Zero Plastic Week', description:'Go plastic-free for 7 days and post your progress', target_scans:50, current_scans:50, end_date:'2026-04-15', status:'completed' },
]
const DEMO_COMMUNITY = { id:'demo', name:'WasteSmart Karnataka', description:'Official demo community', type:'general', join_code:'DEMO01', member_count:128, total_scans:1240, total_carbon_saved:89.4, avatar_color:'#10b981' }
`;

fs.writeFileSync(out, p1);
console.log('p1 done');