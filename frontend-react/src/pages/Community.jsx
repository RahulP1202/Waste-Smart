import { useState, useEffect, useRef } from 'react'
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
  { id:'ch1', title:'Scan 100 Items This Month', description:'Collectively scan 100 waste items using Smart Waste AI', target_scans:100, current_scans:67, end_date:'2026-04-30', status:'active' },
  { id:'ch2', title:'Zero Plastic Week', description:'Go plastic-free for 7 days and post your progress', target_scans:50, current_scans:50, end_date:'2026-04-15', status:'completed' },
]
const DEMO_COMMUNITY = { id:'demo', name:'Smart Waste', description:'Official demo community', type:'general', join_code:'DEMO01', member_count:128, total_scans:1240, total_carbon_saved:89.4, avatar_color:'#10b981' }

export default function Community({ session }) {
  const navigate = useNavigate()
  const { lang } = useApp()
  const [view, setView] = useState('home')
  const [activeTab, setActiveTab] = useState('feed')
  const [myCommunities, setMyCommunities] = useState([])
  const [selectedCommunity, setSelectedCommunity] = useState(null)
  const [members, setMembers] = useState([])
  const [challenges, setChallenges] = useState([])
  const [posts, setPosts] = useState([])
  const [comments, setComments] = useState({})
  const [openComments, setOpenComments] = useState({})
  const [newComment, setNewComment] = useState({})
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [posting, setPosting] = useState(false)
  const [msg, setMsg] = useState('')
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newType, setNewType] = useState('general')
  const [joinCode, setJoinCode] = useState('')
  const [postContent, setPostContent] = useState('')
  const [postType, setPostType] = useState('update')
  const [postImagePreview, setPostImagePreview] = useState(null)
  const [showPostBox, setShowPostBox] = useState(false)
  const fileRef = useRef()
  const isDemo = !supabaseConfigured
  const userId = session?.user?.id
  const userName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'User'
  const userColor = '#10b981'

  const [stats, setStats] = useState({ members:0, scans:0, carbon:0, groups:0 })

  useEffect(() => { loadMyCommunities(); loadStats() }, [])

  async function loadStats() {
    if (isDemo) return
    try {
      const [{ count: groups }, { count: members }, { data: agg }] = await Promise.all([
        supabase.from('communities').select('*', { count:'exact', head:true }),
        supabase.from('community_members').select('*', { count:'exact', head:true }),
        supabase.from('communities').select('total_scans, total_carbon_saved'),
      ])
      const scans = (agg||[]).reduce((s,c)=>s+(c.total_scans||0),0)
      const carbon = (agg||[]).reduce((s,c)=>s+(c.total_carbon_saved||0),0)
      setStats({ members: members||0, scans, carbon, groups: groups||0 })
    } catch(e) {}
  }

  async function loadMyCommunities() {
    setLoading(true)
    if (isDemo) { setLoading(false); return }
    try {
      const { data } = await supabase.from('community_members').select('community_id, communities(*)').eq('user_id', userId)
      setMyCommunities((data||[]).map(d=>d.communities).filter(Boolean))
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  async function loadCommunityDetail(community) {
    setSelectedCommunity(community)
    setView('detail')
    setActiveTab('feed')
    if (isDemo) {
      setMembers(DEMO_MEMBERS)
      setChallenges(DEMO_CHALLENGES)
      setPosts(DEMO_POSTS)
      setComments(DEMO_COMMENTS)
      return
    }
    try {
      const [{ data: mems }, { data: chals }, { data: ps }] = await Promise.all([
        supabase.from('community_members').select('*').eq('community_id', community.id).order('points',{ascending:false}),
        supabase.from('community_challenges').select('*').eq('community_id', community.id).order('created_at',{ascending:false}),
        supabase.from('community_posts').select('*').eq('community_id', community.id).order('created_at',{ascending:false}).limit(30)
      ])
      setMembers(mems||[])
      setChallenges(chals||[])
      setPosts(ps||[])
    } catch(e) { console.error(e) }
  }

  async function loadComments(postId) {
    const isOpen = openComments[postId]
    setOpenComments(o=>({...o,[postId]:!isOpen}))
    if (isOpen || comments[postId]) return
    if (isDemo) { setComments(c=>({...c,[postId]:DEMO_COMMENTS[postId]||[]})); return }
    try {
      const { data } = await supabase.from('community_comments').select('*').eq('post_id', postId).order('created_at',{ascending:true})
      setComments(c=>({...c,[postId]:data||[]}))
    } catch(e) { console.error(e) }
  }

  async function addComment(postId) {
    const text = (newComment[postId]||'').trim()
    if (!text) return
    const comment = { id:'nc_'+Date.now(), post_id:postId, user_name:userName, user_color:userColor, content:text, created_at:new Date().toISOString() }
    setComments(c=>({...c,[postId]:[...(c[postId]||[]),comment]}))
    setPosts(p=>p.map(x=>x.id===postId?{...x,comment_count:(x.comment_count||0)+1}:x))
    setNewComment(n=>({...n,[postId]:''}))
    if (!isDemo) {
      try { await supabase.from('community_comments').insert({ post_id:postId, community_id:selectedCommunity.id, user_id:userId, user_name:userName, user_color:userColor, content:text }) } catch(e){}
    }
  }

  function addReaction(postId, emoji) {
    setPosts(p=>p.map(x=>{
      if (x.id!==postId) return x
      const r = {...(x.reactions||{})}
      r[emoji] = (r[emoji]||0)+1
      return {...x, reactions:r}
    }))
    if (!isDemo) {
      supabase.from('community_reactions').insert({ post_id:postId, user_id:userId, emoji }).catch(()=>{})
    }
  }

  async function submitPost() {
    if (!postContent.trim()) return
    setPosting(true)
    const post = { id:'np_'+Date.now(), community_id:selectedCommunity?.id||'demo', user_name:userName, user_color:userColor, content:postContent, image_url:postImagePreview||null, post_type:postType, reactions:{}, comment_count:0, created_at:new Date().toISOString() }
    if (!isDemo) {
      try {
        const { data, error } = await supabase.from('community_posts').insert({ community_id:selectedCommunity.id, user_id:userId, user_name:userName, user_color:userColor, content:postContent, image_url:postImagePreview||null, post_type:postType, reactions:{} }).select().single()
        if (!error && data) post.id = data.id
      } catch(e){}
    }
    setPosts(p=>[post,...p])
    setPostContent('')
    setPostImagePreview(null)
    setShowPostBox(false)
    setPosting(false)
  }

  function handlePostImage(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPostImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  async function createCommunity() {
    if (!newName.trim()) return setMsg('Enter a community name')
    setCreating(true); setMsg('')
    if (isDemo) {
      const demo = { id:'demo_'+Date.now(), name:newName, description:newDesc, type:newType, join_code:generateCode(), member_count:1, total_scans:0, total_carbon_saved:0, avatar_color:TYPE_COLORS[newType] }
      setMyCommunities(p=>[...p,demo])
      setNewName(''); setNewDesc(''); setCreating(false)
      setMsg('Community created! (Demo mode — connect Supabase to persist)')
      setView('home'); return
    }
    try {
      const code = generateCode()
      const { data, error } = await supabase.from('communities').insert({ name:newName.trim(), description:newDesc.trim(), type:newType, created_by:userId, join_code:code, avatar_color:TYPE_COLORS[newType] }).select().single()
      if (error) throw error
      await supabase.from('community_members').insert({ community_id:data.id, user_id:userId, user_name:userName, role:'admin' })
      await supabase.from('community_challenges').insert({ community_id:data.id, title:'First Month Challenge', description:'Scan 50 waste items as a group this month!', target_scans:50, end_date:new Date(Date.now()+30*86400000).toISOString().split('T')[0] })
      await loadMyCommunities()
      setNewName(''); setNewDesc('')
      setMsg('Community created! Join code: '+code)
      setView('home')
    } catch(e) { setMsg(e.message) }
    setCreating(false)
  }

  async function joinCommunity() {
    if (!joinCode.trim()) return setMsg('Enter a join code')
    setJoining(true); setMsg('')
    if (isDemo) { setMsg('Join requires Supabase. Running in demo mode.'); setJoining(false); return }
    try {
      const { data:comm, error } = await supabase.from('communities').select('*').eq('join_code',joinCode.trim().toUpperCase()).single()
      if (error||!comm) { setMsg('Invalid join code.'); setJoining(false); return }
      const { data:existing } = await supabase.from('community_members').select('id').eq('community_id',comm.id).eq('user_id',userId).single()
      if (existing) { setMsg('Already a member!'); setJoining(false); return }
      await supabase.from('community_members').insert({ community_id:comm.id, user_id:userId, user_name:userName, role:'member' })
      await supabase.from('communities').update({ member_count:(comm.member_count||1)+1 }).eq('id',comm.id)
      await loadMyCommunities()
      setJoinCode('')
      setMsg('Joined "'+comm.name+'"!')
      setView('home')
    } catch(e) { setMsg(e.message) }
    setJoining(false)
  }

  async function leaveCommunity(communityId) {
    if (!window.confirm('Leave this community?')) return
    if (!isDemo) await supabase.from('community_members').delete().eq('community_id',communityId).eq('user_id',userId)
    setMyCommunities(p=>p.filter(c=>c.id!==communityId))
    setView('home')
  }

  return (
    <div className="comm-root">
      <div className="comm-topbar">
        <button className="scan-back" onClick={() => view==='home' ? navigate('/') : setView('home')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          {lang==='kn' ? 'ಹಿಂದೆ' : 'Back'}
        </button>
        <div className="comm-topbar-brand"><RecycleLogo size={22}/><span>{lang==='kn' ? 'ಸಮುದಾಯ' : 'Community'}</span></div>
        {view==='detail'
          ? <button className="comm-post-topbtn" onClick={()=>setShowPostBox(true)}>+ {lang==='kn' ? 'ಪೋಸ್ಟ್' : 'Post'}</button>
          : <div style={{width:80}}/>
        }
      </div>

      {/* HOME */}
      {view==='home' && (
        <div className="comm-home-root">

          {/* Cinematic image hero — completely different from landing */}
          <div className="comm-video-hero">
            <div className="comm-hero-bg"/>
            <div className="comm-hero-overlay"/>
            <div className="comm-hero-content">
              <div className="comm-hero-tag">{lang==='kn' ? 'ಕರ್ನಾಟಕ ಸಮುದಾಯ' : 'Karnataka Community'}</div>
              <h1>{lang==='kn' ? 'ಒಟ್ಟಾಗಿ ಬದಲಾವಣೆ ತರೋಣ' : 'Change Starts Together'}</h1>
              <p>{lang==='kn' ? 'ಗುಂಪು ರಚಿಸಿ, ಸ್ಪರ್ಧೆಗಳಲ್ಲಿ ಭಾಗವಹಿಸಿ, ನಿಮ್ಮ ಪರಿಸರ ಪ್ರಯಾಣ ಹಂಚಿಕೊಳ್ಳಿ' : 'Join groups, take on challenges, share your eco journey and inspire your community'}</p>
              <div className="comm-hero-actions">
                <button className="comm-hero-btn-primary" onClick={()=>setView('create')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  {lang==='kn' ? 'ಗುಂಪು ರಚಿಸಿ' : 'Create Group'}
                </button>
                <button className="comm-hero-btn-secondary" onClick={()=>setView('join')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                  {lang==='kn' ? 'ಗುಂಪಿಗೆ ಸೇರಿ' : 'Join a Group'}
                </button>
              </div>
            </div>
            <div className="comm-scroll-hint">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>

          {/* Impact strip */}
          <div className="comm-impact-strip">
            <div className="comm-impact-strip-item">
              <strong>{isDemo ? '—' : stats.members.toLocaleString()}</strong>
              <span>{lang==='kn' ? 'ಸಕ್ರಿಯ ಸದಸ್ಯರು' : 'Active Members'}</span>
            </div>
            <div className="comm-impact-strip-divider"/>
            <div className="comm-impact-strip-item">
              <strong>{isDemo ? '—' : stats.scans.toLocaleString()}</strong>
              <span>{lang==='kn' ? 'ತ್ಯಾಜ್ಯ ಸ್ಕ್ಯಾನ್‌ಗಳು' : 'Waste Scans'}</span>
            </div>
            <div className="comm-impact-strip-divider"/>
            <div className="comm-impact-strip-item">
              <strong style={{color:'#10b981'}}>{isDemo ? '—' : stats.carbon.toFixed(1)+' kg'}</strong>
              <span>CO₂ {lang==='kn' ? 'ಉಳಿತಾಯ' : 'Saved'}</span>
            </div>
            <div className="comm-impact-strip-divider"/>
            <div className="comm-impact-strip-item">
              <strong>{isDemo ? '—' : stats.groups.toLocaleString()}</strong>
              <span>{lang==='kn' ? 'ಗುಂಪುಗಳು' : 'Groups'}</span>
            </div>
          </div>

          {/* How it works */}
          <div className="comm-how-section">
            <h2>{lang==='kn' ? 'ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ' : 'How It Works'}</h2>
            <div className="comm-how-grid">
              <div className="comm-how-card">
                <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80" alt="Create group" className="comm-how-img"/>
                <div className="comm-how-body">
                  <div className="comm-how-num">01</div>
                  <h3>{lang==='kn' ? 'ಗುಂಪು ರಚಿಸಿ' : 'Create a Group'}</h3>
                  <p>{lang==='kn' ? 'ನಿಮ್ಮ ಅಪಾರ್ಟ್‌ಮೆಂಟ್, ಶಾಲೆ ಅಥವಾ ಕಚೇರಿಗಾಗಿ ಗುಂಪು ರಚಿಸಿ' : 'Start a group for your apartment, school, or office and invite members with a code'}</p>
                </div>
              </div>
              <div className="comm-how-card">
                <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80" alt="Take challenges" className="comm-how-img"/>
                <div className="comm-how-body">
                  <div className="comm-how-num">02</div>
                  <h3>{lang==='kn' ? 'ಸ್ಪರ್ಧೆಗಳಲ್ಲಿ ಭಾಗವಹಿಸಿ' : 'Take on Challenges'}</h3>
                  <p>{lang==='kn' ? 'ತ್ಯಾಜ್ಯ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ, ಅಂಕಗಳು ಗಳಿಸಿ ಮತ್ತು ಲೀಡರ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ ಮೇಲೇರಿ' : 'Scan waste, earn points and climb the leaderboard as a team'}</p>
                </div>
              </div>
              <div className="comm-how-card">
                <img src="https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&q=80" alt="Share journey" className="comm-how-img"/>
                <div className="comm-how-body">
                  <div className="comm-how-num">03</div>
                  <h3>{lang==='kn' ? 'ಅನುಭವ ಹಂಚಿಕೊಳ್ಳಿ' : 'Share Your Journey'}</h3>
                  <p>{lang==='kn' ? 'ಪೋಸ್ಟ್ ಮಾಡಿ, ಪ್ರತಿಕ್ರಿಯಿಸಿ ಮತ್ತು ಇತರರನ್ನು ಪ್ರೇರೇಪಿಸಿ' : 'Post updates, react to others and inspire your community to do more'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="comm-home-inner">
            {msg && <div className={'comm-msg '+(msg.includes('created')||msg.includes('Joined')?'success':'info')}>{msg}</div>}

            {isDemo && (
              <div className="comm-demo-banner">
                <span>{lang==='kn' ? 'Demo Mode — Supabase ಸಂಪರ್ಕಿಸಿ' : 'Demo Mode — Connect Supabase for full features'}</span>
                <button onClick={()=>loadCommunityDetail(DEMO_COMMUNITY)}>{lang==='kn' ? 'ಡೆಮೊ ನೋಡಿ' : 'View Demo Community'}</button>
              </div>
            )}

            {loading ? (
              <div className="comm-loading"><div className="spinner"><div/><div/><div/></div><p>Loading...</p></div>
            ) : myCommunities.length === 0 && !isDemo ? (
              <div className="comm-no-groups">
                <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80" alt="community" className="comm-no-groups-img"/>
                <h3>{lang==='kn' ? 'ಇನ್ನೂ ಯಾವುದೇ ಗುಂಪಿಲ್ಲ' : 'No groups yet'}</h3>
                <p>{lang==='kn' ? 'ಮೇಲಿನ ಬಟನ್‌ಗಳನ್ನು ಬಳಸಿ ಗುಂಪು ರಚಿಸಿ ಅಥವಾ ಸೇರಿ' : 'Use the buttons above to create or join a group'}</p>
              </div>
            ) : (
              <>
                {myCommunities.length > 0 && <h2 className="comm-section-title">{lang==='kn' ? 'ನನ್ನ ಗುಂಪುಗಳು' : 'My Groups'}</h2>}
                <div className="comm-groups-grid">
                  {myCommunities.map(c => {
                    const TYPE_IMGS = { school:'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80', apartment:'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80', office:'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80', general:'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80' }
                    return (
                      <div key={c.id} className="comm-group-card" onClick={()=>loadCommunityDetail(c)}>
                        <div className="comm-group-card-img-wrap">
                          <img src={TYPE_IMGS[c.type]||TYPE_IMGS.general} alt={c.name} className="comm-group-card-img"/>
                          <div className="comm-group-card-img-overlay"/>
                          <div className="comm-group-type-badge-img" style={{background:TYPE_COLORS[c.type]}}>{TYPE_ICONS[c.type]} {c.type}</div>
                        </div>
                        <div className="comm-group-card-body">
                          <div className="comm-group-top">
                            <Avatar name={c.name} color={c.avatar_color} size={44}/>
                            <div className="comm-group-info">
                              <h3>{c.name}</h3>
                              {c.description && <p>{c.description}</p>}
                            </div>
                          </div>
                          <div className="comm-group-stats">
                            <div className="comm-gstat"><strong>{c.member_count||1}</strong><small>{lang==='kn'?'ಸದಸ್ಯರು':'Members'}</small></div>
                            <div className="comm-gstat"><strong>{c.total_scans||0}</strong><small>{lang==='kn'?'ಸ್ಕ್ಯಾನ್':'Scans'}</small></div>
                            <div className="comm-gstat"><strong style={{color:'#10b981'}}>{(c.total_carbon_saved||0).toFixed(1)}kg</strong><small>CO₂</small></div>
                          </div>
                          <div className="comm-group-code">{lang==='kn'?'ಕೋಡ್:':'Code:'} <strong>{c.join_code}</strong></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* CREATE */}
      {view==='create' && (
        <div className="comm-container comm-form-container">
          <h2>{lang==='kn'?'ಹೊಸ ಗುಂಪು ರಚಿಸಿ':'Create New Group'}</h2>
          {msg && <div className="comm-msg info">{msg}</div>}
          <div className="comm-form">
            <div className="comm-field"><label>{lang==='kn'?'ಗುಂಪಿನ ಹೆಸರು':'Group Name'} *</label><input placeholder={lang==='kn'?'ಉದಾ: ಕೋರಮಂಗಲ ಅಪಾರ್ಟ್‌ಮೆಂಟ್':'e.g. Koramangala Apartment'} value={newName} onChange={e=>setNewName(e.target.value)}/></div>
            <div className="comm-field"><label>{lang==='kn'?'ವಿವರಣೆ':'Description'}</label><textarea placeholder={lang==='kn'?'ನಿಮ್ಮ ಗುಂಪಿನ ಬಗ್ಗೆ ಹೇಳಿ...':'Tell us about your group...'} value={newDesc} onChange={e=>setNewDesc(e.target.value)} rows={3}/></div>
            <div className="comm-field">
              <label>{lang==='kn'?'ಗುಂಪಿನ ವಿಧ':'Group Type'}</label>
              <div className="comm-type-grid">
                {Object.entries(TYPE_ICONS).map(([type,icon])=>(
                  <button key={type} className={'comm-type-btn '+(newType===type?'active':'')} style={newType===type?{borderColor:TYPE_COLORS[type],background:TYPE_COLORS[type]+'15',color:TYPE_COLORS[type]}:{}} onClick={()=>setNewType(type)}>
                    <span>{icon}</span><span>{type.charAt(0).toUpperCase()+type.slice(1)}</span>
                  </button>
                ))}
              </div>
            </div>
            <button className="comm-btn-primary" onClick={createCommunity} disabled={creating}>{creating?'Creating...':(lang==='kn'?'ಗುಂಪು ರಚಿಸಿ':'Create Group')}</button>
          </div>
        </div>
      )}

      {/* JOIN */}
      {view==='join' && (
        <div className="comm-container comm-form-container">
          <h2>{lang==='kn'?'ಗುಂಪಿಗೆ ಸೇರಿ':'Join a Group'}</h2>
          <p className="comm-join-hint">{lang==='kn'?'6-ಅಕ್ಷರದ ಕೋಡ್ ನಮೂದಿಸಿ':'Enter the 6-character join code from your group admin'}</p>
          {msg && <div className={'comm-msg '+(msg.includes('Joined')?'success':'info')}>{msg}</div>}
          <div className="comm-form">
            <div className="comm-field"><label>{lang==='kn'?'ಸೇರ್ಪಡೆ ಕೋಡ್':'Join Code'}</label><input placeholder="e.g. ABC123" value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} maxLength={6} style={{textTransform:'uppercase',letterSpacing:'6px',fontSize:'22px',textAlign:'center',fontWeight:800}}/></div>
            <button className="comm-btn-primary" onClick={joinCommunity} disabled={joining}>{joining?'Joining...':(lang==='kn'?'ಗುಂಪಿಗೆ ಸೇರಿ':'Join Group')}</button>
          </div>
        </div>
      )}

      {/* DETAIL */}
      {view==='detail' && selectedCommunity && (
        <div className="comm-detail-root">
          <div className="comm-detail-banner" style={{background:'linear-gradient(135deg,'+selectedCommunity.avatar_color+'22,'+selectedCommunity.avatar_color+'08)'}}>
            <div className="comm-detail-banner-inner">
              <Avatar name={selectedCommunity.name} color={selectedCommunity.avatar_color} size={64}/>
              <div className="comm-detail-info">
                <div className="comm-group-type-badge" style={{background:TYPE_COLORS[selectedCommunity.type]+'22',color:TYPE_COLORS[selectedCommunity.type]}}>{TYPE_ICONS[selectedCommunity.type]} {selectedCommunity.type}</div>
                <h2>{selectedCommunity.name}</h2>
                {selectedCommunity.description && <p>{selectedCommunity.description}</p>}
                <div className="comm-detail-code">
                  {lang==='kn'?'ಕೋಡ್:':'Code:'} <strong>{selectedCommunity.join_code}</strong>
                  <button onClick={()=>navigator.clipboard.writeText(selectedCommunity.join_code)} className="comm-copy-btn">Copy</button>
                </div>
              </div>
            </div>
            <div className="comm-impact-row">
              <div className="comm-impact-card"><strong style={{color:'#10b981'}}>{selectedCommunity.member_count||members.length}</strong><small>{lang==='kn'?'ಸದಸ್ಯರು':'Members'}</small></div>
              <div className="comm-impact-card"><strong style={{color:'#6366f1'}}>{selectedCommunity.total_scans||0}</strong><small>{lang==='kn'?'ಸ್ಕ್ಯಾನ್':'Scans'}</small></div>
              <div className="comm-impact-card"><strong style={{color:'#f59e0b'}}>{(selectedCommunity.total_carbon_saved||0).toFixed(1)}kg</strong><small>CO₂ {lang==='kn'?'ಉಳಿತಾಯ':'Saved'}</small></div>
              <div className="comm-impact-card"><strong style={{color:'#10b981'}}>{((selectedCommunity.total_carbon_saved||0)/21).toFixed(1)}</strong><small>{lang==='kn'?'ಮರ ಸಮಾನ':'Trees Equiv.'}</small></div>
            </div>
          </div>

          <div className="comm-tabs-bar">
            {['feed','challenges','leaderboard'].map(t=>(
              <button key={t} className={'comm-tab '+(activeTab===t?'active':'')} onClick={()=>setActiveTab(t)}>
                {t==='feed'?(lang==='kn'?'📰 ಫೀಡ್':'📰 Feed'):t==='challenges'?(lang==='kn'?'🏆 ಸ್ಪರ್ಧೆಗಳು':'🏆 Challenges'):(lang==='kn'?'🏅 ಲೀಡರ್‌ಬೋರ್ಡ್':'🏅 Leaderboard')}
              </button>
            ))}
          </div>

          {/* FEED */}
          {activeTab==='feed' && (
            <div className="comm-feed-container">
              {showPostBox ? (
                <div className="comm-composer">
                  <div className="comm-composer-top">
                    <Avatar name={userName} color={userColor} size={38}/>
                    <div className="comm-composer-right">
                      <div className="comm-post-types">
                        {[['update','📢',lang==='kn'?'ಅಪ್‌ಡೇಟ್':'Update'],['challenge','🏆',lang==='kn'?'ಸ್ಪರ್ಧೆ':'Challenge'],['scan','🔍',lang==='kn'?'ಸ್ಕ್ಯಾನ್':'Scan'],['tip','💡',lang==='kn'?'ಸಲಹೆ':'Tip']].map(([t,icon,label])=>(
                          <button key={t} className={'comm-ptype-btn '+(postType===t?'active':'')} onClick={()=>setPostType(t)}>{icon} {label}</button>
                        ))}
                      </div>
                      <textarea className="comm-composer-input" placeholder={lang==='kn'?'ನಿಮ್ಮ ಅನುಭವ ಹಂಚಿಕೊಳ್ಳಿ...':'Share your eco journey, challenge update, or tip...'} value={postContent} onChange={e=>setPostContent(e.target.value)} rows={3} autoFocus/>
                      {postImagePreview && (
                        <div className="comm-composer-img-wrap">
                          <img src={postImagePreview} alt="preview" className="comm-composer-img"/>
                          <button className="comm-remove-img" onClick={()=>setPostImagePreview(null)}>x</button>
                        </div>
                      )}
                      <div className="comm-composer-actions">
                        <label className="comm-img-btn">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          {lang==='kn'?'ಫೋಟೋ':'Photo'}
                          <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handlePostImage}/>
                        </label>
                        <div style={{display:'flex',gap:8,marginLeft:'auto'}}>
                          <button className="comm-cancel-btn" onClick={()=>{setShowPostBox(false);setPostContent('');setPostImagePreview(null)}}>{lang==='kn'?'ರದ್ದು':'Cancel'}</button>
                          <button className="comm-submit-post-btn" onClick={submitPost} disabled={posting||!postContent.trim()}>{posting?'Posting...':(lang==='kn'?'ಪ್ರಕಟಿಸಿ':'Post')}</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <button className="comm-open-composer" onClick={()=>setShowPostBox(true)}>
                  <Avatar name={userName} color={userColor} size={36}/>
                  <span>{lang==='kn'?'ನಿಮ್ಮ ಅನುಭವ ಹಂಚಿಕೊಳ್ಳಿ...':'Share your eco journey...'}</span>
                </button>
              )}

              {posts.length===0 && (
                <div className="comm-no-posts">
                  <div style={{fontSize:48}}>🌱</div>
                  <h3>{lang==='kn'?'ಇನ್ನೂ ಯಾವುದೇ ಪೋಸ್ಟ್ ಇಲ್ಲ':'No posts yet'}</h3>
                  <p>{lang==='kn'?'ಮೊದಲ ಪೋಸ್ಟ್ ಮಾಡಿ!':'Be the first to post!'}</p>
                </div>
              )}

              {posts.map(post => {
                const ptColors = {update:'#6366f1',challenge:'#f59e0b',scan:'#10b981',tip:'#3b82f6'}
                const ptIcons = {update:'📢',challenge:'🏆',scan:'🔍',tip:'💡'}
                const ptColor = ptColors[post.post_type]||'#6366f1'
                return (
                  <div key={post.id} className="comm-post-card">
                    <div className="comm-post-header">
                      <Avatar name={post.user_name} color={post.user_color||'#10b981'} size={40}/>
                      <div className="comm-post-meta">
                        <strong>{post.user_name}</strong>
                        <div className="comm-post-meta-row">
                          <span className="comm-post-type-tag" style={{background:ptColor+'22',color:ptColor}}>{ptIcons[post.post_type]} {post.post_type}</span>
                          <span className="comm-post-time">{timeAgo(post.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <p className="comm-post-content">{post.content}</p>
                    {post.image_url && <img src={post.image_url} alt="" className="comm-post-img" loading="lazy"/>}
                    <div className="comm-reactions-row">
                      <div className="comm-reaction-btns">
                        {REACTIONS.map(emoji=>(
                          <button key={emoji} className="comm-react-btn" onClick={()=>addReaction(post.id,emoji)}>
                            {emoji}{post.reactions&&post.reactions[emoji]>0&&<span>{post.reactions[emoji]}</span>}
                          </button>
                        ))}
                      </div>
                      <button className="comm-comment-toggle" onClick={()=>loadComments(post.id)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        {post.comment_count||0} {lang==='kn'?'ಕಾಮೆಂಟ್':'comments'}
                      </button>
                    </div>
                    {openComments[post.id] && (
                      <div className="comm-comments-section">
                        {(comments[post.id]||[]).map(c=>(
                          <div key={c.id} className="comm-comment">
                            <Avatar name={c.user_name} color={c.user_color||'#6366f1'} size={28}/>
                            <div className="comm-comment-body">
                              <div className="comm-comment-header"><strong>{c.user_name}</strong><span>{timeAgo(c.created_at)}</span></div>
                              <p>{c.content}</p>
                            </div>
                          </div>
                        ))}
                        <div className="comm-add-comment">
                          <Avatar name={userName} color={userColor} size={28}/>
                          <input placeholder={lang==='kn'?'ಕಾಮೆಂಟ್ ಸೇರಿಸಿ...':'Add a comment...'} value={newComment[post.id]||''} onChange={e=>setNewComment(n=>({...n,[post.id]:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&addComment(post.id)}/>
                          <button onClick={()=>addComment(post.id)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* CHALLENGES */}
          {activeTab==='challenges' && (
            <div className="comm-tab-content">
              {challenges.length===0 && <div className="comm-no-posts"><div style={{fontSize:48}}>🏆</div><h3>{lang==='kn'?'ಇನ್ನೂ ಯಾವುದೇ ಸ್ಪರ್ಧೆ ಇಲ್ಲ':'No challenges yet'}</h3></div>}
              {challenges.map(ch=>{
                const pct = Math.min(100,((ch.current_scans||0)/(ch.target_scans||1))*100)
                const done = ch.status==='completed'||pct>=100
                return (
                  <div key={ch.id} className={'comm-challenge-card '+(done?'done':'')}>
                    <div className="comm-challenge-badge" style={{background:done?'rgba(16,185,129,0.15)':'rgba(245,158,11,0.15)',color:done?'#10b981':'#f59e0b'}}>{done?(lang==='kn'?'Completed':'Completed'):(lang==='kn'?'Active':'Active')}</div>
                    <h4>{ch.title}</h4>
                    <p>{ch.description}</p>
                    <div className="comm-challenge-progress-label"><span>{ch.current_scans||0} / {ch.target_scans} {lang==='kn'?'ಸ್ಕ್ಯಾನ್':'scans'}</span><span style={{fontWeight:700,color:done?'#10b981':'#f59e0b'}}>{pct.toFixed(0)}%</span></div>
                    <div className="comm-progress-track"><div className="comm-progress-fill" style={{width:pct+'%',background:done?'linear-gradient(90deg,#10b981,#059669)':'linear-gradient(90deg,#f59e0b,#f97316)'}}/></div>
                    {ch.end_date && <p className="comm-challenge-date">Ends: {new Date(ch.end_date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>}
                  </div>
                )
              })}
            </div>
          )}

          {/* LEADERBOARD */}
          {activeTab==='leaderboard' && (
            <div className="comm-tab-content">
              <div className="comm-lb-podium">
                {members.slice(0,3).map((m,i)=>(
                  <div key={m.id} className={'comm-podium-item rank-'+(i+1)}>
                    <div className="comm-podium-crown">{i===0?'👑':i===1?'🥈':'🥉'}</div>
                    <Avatar name={m.user_name||'User'} color={m.user_color||['#f59e0b','#94a3b8','#cd7c2f'][i]} size={i===0?56:46}/>
                    <div className="comm-podium-name">{m.user_name||'Anonymous'}{m.user_id===userId&&<span className="comm-lb-you"> (You)</span>}</div>
                    <div className="comm-podium-pts" style={{color:['#f59e0b','#94a3b8','#cd7c2f'][i]}}>{m.points||0} pts</div>
                  </div>
                ))}
              </div>
              <div className="comm-leaderboard">
                {members.map((m,i)=>(
                  <div key={m.id} className={'comm-lb-row '+(m.user_id===userId?'mine':'')}>
                    <div className="comm-lb-rank" style={{color:i===0?'#f59e0b':i===1?'#94a3b8':i===2?'#cd7c2f':'var(--muted2)'}}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':('#'+(i+1))}</div>
                    <Avatar name={m.user_name||'User'} color={m.user_color||'#10b981'} size={36}/>
                    <div className="comm-lb-info">
                      <span className="comm-lb-name">{m.user_name||'Anonymous'}{m.user_id===userId&&<span className="comm-lb-you"> (You)</span>}</span>
                      <span className="comm-lb-role">{m.role}</span>
                    </div>
                    <div className="comm-lb-stats">
                      <span>{m.scans_count||0} scans</span>
                      <strong style={{color:'#10b981'}}>{m.points||0} pts</strong>
                    </div>
                  </div>
                ))}
                {members.length===0 && <p className="comm-empty-text">{lang==='kn'?'ಇನ್ನೂ ಯಾವುದೇ ಸದಸ್ಯರಿಲ್ಲ':'No members yet'}</p>}
              </div>
            </div>
          )}

          <button className="comm-leave-btn" onClick={()=>leaveCommunity(selectedCommunity.id)}>{lang==='kn'?'ಗುಂಪು ಬಿಡಿ':'Leave Group'}</button>
        </div>
      )}
    </div>
  )
}

