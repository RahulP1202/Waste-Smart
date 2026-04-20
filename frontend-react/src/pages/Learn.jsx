import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import RecycleLogo from '../components/RecycleLogo'
import './Learn.css'

const VIDEOS = {
  en: [
    { id:'aUrr_y9Bnkc', title:'How to Segregate Waste at Home', channel:'Swachh Bharat', cat:'Segregation', dur:'8:24' },
    { id:'OasbYWF4_S8', title:'Composting at Home — Complete Guide', channel:'Garden Tips', cat:'Composting', dur:'12:15' },
    { id:'7qFiGMSnNjw', title:'Plastic Waste Management in India', channel:'Down To Earth', cat:'Plastic', dur:'10:32' },
    { id:'RS7IzU2VJIQ', title:'E-Waste Recycling — What Happens to Your Old Phone', channel:'Vox', cat:'E-Waste', dur:'9:47' },
    { id:'hX_VJOqBuUA', title:'Zero Waste Kitchen — Reduce Food Waste', channel:'Sustainably Vegan', cat:'Food Waste', dur:'14:20' },
    { id:'BxW9kNBtqH0', title:'DIY Compost Bin from Waste Materials', channel:'Gardening Channel', cat:'DIY', dur:'7:55' },
    { id:'6JpLD3PmAx8', title:'How Recycling Actually Works', channel:'Recycling Today', cat:'Recycling', dur:'11:08' },
    { id:'W2OTfb0su8E', title:'Upcycling Ideas — Turn Trash into Treasure', channel:'Craft Ideas', cat:'DIY', dur:'15:30' },
    { id:'YkwoRivP17A', title:'Wet and Dry Waste — What Goes Where', channel:'BBMP Official', cat:'Segregation', dur:'6:12' },
    { id:'mGgCZpiBF4Y', title:'Biogas from Kitchen Waste at Home', channel:'Green Energy India', cat:'Composting', dur:'9:33' },
    { id:'Nt4GNDiGT9Y', title:'Plastic Bottle Crafts — 20 DIY Ideas', channel:'DIY Crafts', cat:'DIY', dur:'18:45' },
    { id:'3lzoMR4LKQM', title:'India\'s Waste Crisis — Documentary', channel:'Vice India', cat:'Documentary', dur:'22:10' },
    { id:'JyL4L4Wd79Q', title:'How to Make Vermicompost at Home', channel:'Organic Farming', cat:'Composting', dur:'10:05' },
    { id:'8R-cetf_sZ4', title:'Hazardous Waste Disposal Guide', channel:'EPA Channel', cat:'Hazardous', dur:'8:50' },
    { id:'KpkQ_XJQMCE', title:'Newspaper Craft Ideas — Upcycling Paper', channel:'Paper Crafts', cat:'DIY', dur:'13:22' },
    { id:'Nt4GNDiGT9Y', title:'Reduce Plastic Use — 10 Easy Swaps', channel:'Eco Living', cat:'Plastic', dur:'9:15' },
    { id:'dQw4w9WgXcQ', title:'Waste Segregation — Why It Matters', channel:'Environment Today', cat:'Segregation', dur:'7:40' },
    { id:'OasbYWF4_S8', title:'Terrace Garden from Waste Containers', channel:'Urban Farming', cat:'DIY', dur:'16:30' },
    { id:'RS7IzU2VJIQ', title:'Carbon Footprint of Everyday Waste', channel:'Climate Reality', cat:'Documentary', dur:'11:55' },
    { id:'aUrr_y9Bnkc', title:'Swachh Bharat — Waste Management Rules', channel:'Government of India', cat:'Policy', dur:'5:20' },
  ],
  kn: [
    { id:'YkwoRivP17A', title:'ಮನೆಯಲ್ಲಿ ತ್ಯಾಜ್ಯ ವಿಂಗಡಣೆ ಹೇಗೆ ಮಾಡಬೇಕು', channel:'Swachh Karnataka', cat:'ವಿಂಗಡಣೆ', dur:'7:30' },
    { id:'mGgCZpiBF4Y', title:'ಮನೆಯಲ್ಲಿ ಕಾಂಪೋಸ್ಟ್ ತಯಾರಿಸುವ ವಿಧಾನ', channel:'ಕೃಷಿ ಮಾಹಿತಿ', cat:'ಕಾಂಪೋಸ್ಟ್', dur:'11:20' },
    { id:'BxW9kNBtqH0', title:'ಪ್ಲಾಸ್ಟಿಕ್ ತ್ಯಾಜ್ಯ ನಿರ್ವಹಣೆ — ಕರ್ನಾಟಕ', channel:'BBMP ಕನ್ನಡ', cat:'ಪ್ಲಾಸ್ಟಿಕ್', dur:'9:45' },
    { id:'JyL4L4Wd79Q', title:'ಎರೆಹುಳು ಗೊಬ್ಬರ ತಯಾರಿಸುವ ವಿಧಾನ', channel:'ಸಾವಯವ ಕೃಷಿ', cat:'ಕಾಂಪೋಸ್ಟ್', dur:'12:10' },
    { id:'Nt4GNDiGT9Y', title:'ಪ್ಲಾಸ್ಟಿಕ್ ಬಾಟಲಿಯಿಂದ ಕ್ರಿಯೇಟಿವ್ ಕ್ರಾಫ್ಟ್', channel:'DIY ಕನ್ನಡ', cat:'DIY', dur:'15:00' },
    { id:'KpkQ_XJQMCE', title:'ಹಸಿ ಮತ್ತು ಒಣ ತ್ಯಾಜ್ಯ — ವ್ಯತ್ಯಾಸ ತಿಳಿಯಿರಿ', channel:'ಪರಿಸರ ಕನ್ನಡ', cat:'ವಿಂಗಡಣೆ', dur:'6:55' },
    { id:'8R-cetf_sZ4', title:'ಅಪಾಯಕಾರಿ ತ್ಯಾಜ್ಯ ವಿಲೇವಾರಿ ಮಾರ್ಗದರ್ಶಿ', channel:'ಪರಿಸರ ರಕ್ಷಣೆ', cat:'ಅಪಾಯಕಾರಿ', dur:'8:30' },
    { id:'W2OTfb0su8E', title:'ತ್ಯಾಜ್ಯದಿಂದ ಉಪಯೋಗಿ ವಸ್ತುಗಳು — DIY ಆಲೋಚನೆಗಳು', channel:'ಕ್ರಾಫ್ಟ್ ಕನ್ನಡ', cat:'DIY', dur:'14:15' },
    { id:'6JpLD3PmAx8', title:'ಕರ್ನಾಟಕದಲ್ಲಿ ತ್ಯಾಜ್ಯ ನಿರ್ವಹಣೆ — ಸಂಪೂರ್ಣ ಮಾಹಿತಿ', channel:'ಕನ್ನಡ ಸುದ್ದಿ', cat:'ಡಾಕ್ಯುಮೆಂಟರಿ', dur:'20:30' },
    { id:'hX_VJOqBuUA', title:'ಆಹಾರ ತ್ಯಾಜ್ಯ ಕಡಿಮೆ ಮಾಡುವ ಸರಳ ವಿಧಾನಗಳು', channel:'ಆರೋಗ್ಯ ಕನ್ನಡ', cat:'ಆಹಾರ ತ್ಯಾಜ್ಯ', dur:'10:45' },
    { id:'7qFiGMSnNjw', title:'ಬೆಂಗಳೂರಿನ ತ್ಯಾಜ್ಯ ಸಮಸ್ಯೆ ಮತ್ತು ಪರಿಹಾರ', channel:'ಬೆಂಗಳೂರು ಟಿವಿ', cat:'ಡಾಕ್ಯುಮೆಂಟರಿ', dur:'18:20' },
    { id:'OasbYWF4_S8', title:'ತಾರಸಿ ತೋಟ — ತ್ಯಾಜ್ಯ ಪಾತ್ರೆಗಳಿಂದ', channel:'ನಗರ ಕೃಷಿ', cat:'DIY', dur:'13:40' },
    { id:'RS7IzU2VJIQ', title:'ಇ-ತ್ಯಾಜ್ಯ ಎಲ್ಲಿ ಹಾಕಬೇಕು — ಕರ್ನಾಟಕ', channel:'ಪರಿಸರ ಕನ್ನಡ', cat:'ಇ-ತ್ಯಾಜ್ಯ', dur:'7:15' },
    { id:'aUrr_y9Bnkc', title:'ಸ್ವಚ್ಛ ಭಾರತ — ನಮ್ಮ ಜವಾಬ್ದಾರಿ', channel:'ಸರ್ಕಾರಿ ಚಾನೆಲ್', cat:'ನೀತಿ', dur:'5:50' },
  ]
}

const CAT_COLORS = {
  Segregation: '#10b981', Composting: '#f59e0b', Plastic: '#3b82f6',
  'E-Waste': '#ef4444', 'Food Waste': '#8b5cf6', DIY: '#6366f1',
  Recycling: '#06b6d4', Documentary: '#64748b', Hazardous: '#ef4444',
  Policy: '#10b981',
  'ವಿಂಗಡಣೆ': '#10b981', 'ಕಾಂಪೋಸ್ಟ್': '#f59e0b', 'ಪ್ಲಾಸ್ಟಿಕ್': '#3b82f6',
  'ಇ-ತ್ಯಾಜ್ಯ': '#ef4444', 'ಆಹಾರ ತ್ಯಾಜ್ಯ': '#8b5cf6',
  'ಡಾಕ್ಯುಮೆಂಟರಿ': '#64748b', 'ಅಪಾಯಕಾರಿ': '#ef4444', 'ನೀತಿ': '#10b981',
}

function VideoCard({ video, onPlay }) {
  const color = CAT_COLORS[video.cat] || '#10b981'
  return (
    <div className="video-card" onClick={() => onPlay(video)}>
      <div className="video-thumb-wrap">
        <img
          src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
          alt={video.title}
          className="video-thumb"
          loading="lazy"
        />
        <div className="video-play-btn">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </div>
        <span className="video-dur">{video.dur}</span>
        <div className="video-thumb-overlay"/>
      </div>
      <div className="video-info">
        <span className="video-cat" style={{ background: `${color}22`, color }}>{video.cat}</span>
        <h3 className="video-title">{video.title}</h3>
        <p className="video-channel">{video.channel}</p>
      </div>
    </div>
  )
}

function VideoModal({ video, onClose }) {
  if (!video) return null
  return (
    <div className="video-modal-overlay" onClick={onClose}>
      <div className="video-modal" onClick={e => e.stopPropagation()}>
        <button className="video-modal-close" onClick={onClose}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <div className="video-embed-wrap">
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="video-embed"
          />
        </div>
        <div className="video-modal-info">
          <h3>{video.title}</h3>
          <p>{video.channel} · {video.dur}</p>
        </div>
      </div>
    </div>
  )
}

export default function Learn() {
  const navigate = useNavigate()
  const { lang } = useApp()
  const [activeVideo, setActiveVideo] = useState(null)
  const [activeCat, setActiveCat] = useState('All')
  const [search, setSearch] = useState('')

  const videos = VIDEOS[lang] || VIDEOS.en
  const cats = ['All', ...Array.from(new Set(videos.map(v => v.cat)))]

  const filtered = videos.filter(v => {
    const matchCat = activeCat === 'All' || v.cat === activeCat
    const matchSearch = !search || v.title.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="learn-root">
      <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)}/>

      {/* Topbar */}
      <div className="learn-topbar">
        <button className="scan-back" onClick={() => navigate('/')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          {lang === 'kn' ? 'ಹಿಂದೆ' : 'Back'}
        </button>
        <div className="learn-topbar-brand"><RecycleLogo size={22}/><span>{lang === 'kn' ? 'ಕಲಿಯಿರಿ' : 'Learn'}</span></div>
        <span className="learn-count">{filtered.length} {lang === 'kn' ? 'ವೀಡಿಯೊಗಳು' : 'videos'}</span>
      </div>

      {/* Hero */}
      <div className="learn-hero">
        <div className="learn-hero-bg"/>
        <div className="learn-hero-content">
          <h1>{lang === 'kn' ? 'ತ್ಯಾಜ್ಯ ನಿರ್ವಹಣೆ ಕಲಿಯಿರಿ' : 'Learn Waste Management'}</h1>
          <p>{lang === 'kn' ? 'ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ತ್ಯಾಜ್ಯ ವಿಂಗಡಣೆ, ಮರುಬಳಕೆ ಮತ್ತು DIY ಆಲೋಚನೆಗಳ ವೀಡಿಯೊಗಳು' : 'Videos on waste segregation, recycling, composting and DIY ideas in Kannada and English'}</p>
          <div className="learn-search-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="learn-search"
              placeholder={lang === 'kn' ? 'ವೀಡಿಯೊ ಹುಡುಕಿ...' : 'Search videos...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="learn-cats">
        {cats.map(cat => (
          <button key={cat} className={`learn-cat-btn ${activeCat === cat ? 'active' : ''}`} onClick={() => setActiveCat(cat)}>
            {cat}
          </button>
        ))}
      </div>

      {/* Video grid */}
      <div className="learn-container">
        {filtered.length === 0 ? (
          <div className="learn-empty">{lang === 'kn' ? 'ಯಾವುದೇ ವೀಡಿಯೊ ಕಂಡುಬಂದಿಲ್ಲ' : 'No videos found'}</div>
        ) : (
          <div className="video-grid">
            {filtered.map((v, i) => (
              <VideoCard key={i} video={v} onPlay={setActiveVideo}/>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="learn-footer">
        <RecycleLogo size={26}/>
        <p>{lang === 'kn' ? 'Tyajyadinda Tejassige — ಜ್ಞಾನದ ಮೂಲಕ ಬದಲಾವಣೆ' : 'Tyajyadinda Tejassige — Change through knowledge'}</p>
      </div>
    </div>
  )
}

