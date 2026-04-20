const fs = require('fs');
const out = 'wastesmart-main/frontend-react/src/pages/Community.jsx';

const p2 = `
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

  useEffect(() => { loadMyCommunities() }, [])

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
`;

fs.appendFileSync(out, p2);
console.log('p2 done');
