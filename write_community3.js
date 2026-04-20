const fs = require('fs');
const out = 'wastesmart-main/frontend-react/src/pages/Community.jsx';

const p3 = `
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
        <div className="comm-container">
          <div className="comm-hero">
            <div className="comm-hero-emoji">🌍</div>
            <h1>{lang==='kn' ? 'ಒಟ್ಟಾಗಿ ಬದಲಾವಣೆ ತರೋಣ' : 'Change Together'}</h1>
            <p>{lang==='kn' ? 'ಗುಂಪು ರಚಿಸಿ, ಸ್ಪರ್ಧೆಗಳಲ್ಲಿ ಭಾಗವಹಿಸಿ, ಒಟ್ಟಾಗಿ ಪರಿಸರ ರಕ್ಷಿಸಿ' : 'Create groups, join challenges, share your eco journey and inspire others'}</p>
            <div className="comm-hero-actions">
              <button className="comm-btn-primary" onClick={()=>setView('create')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                {lang==='kn' ? 'ಗುಂಪು ರಚಿಸಿ' : 'Create Group'}
              </button>
              <button className="comm-btn-secondary" onClick={()=>setView('join')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                {lang==='kn' ? 'ಗುಂಪಿಗೆ ಸೇರಿ' : 'Join a Group'}
              </button>
            </div>
          </div>

          {msg && <div className={'comm-msg '+(msg.includes('created')||msg.includes('Joined')?'success':'info')}>{msg}</div>}

          {isDemo && (
            <div className="comm-demo-banner">
              <span>🌟 {lang==='kn' ? 'ಡೆಮೊ ಮೋಡ್ — ಸಂಪೂರ್ಣ ವೈಶಿಷ್ಟ್ಯಗಳಿಗಾಗಿ Supabase ಸಂಪರ್ಕಿಸಿ' : 'Demo Mode — Connect Supabase for full features'}</span>
              <button onClick={()=>loadCommunityDetail(DEMO_COMMUNITY)}>{lang==='kn' ? 'ಡೆಮೊ ನೋಡಿ' : 'View Demo'}</button>
            </div>
          )}

          {loading ? (
            <div className="comm-loading"><div className="spinner"><div/><div/><div/></div><p>Loading...</p></div>
          ) : myCommunities.length === 0 && !isDemo ? (
            <div className="comm-no-groups">
              <div style={{fontSize:56}}>👥</div>
              <h3>{lang==='kn' ? 'ಇನ್ನೂ ಯಾವುದೇ ಗುಂಪಿಲ್ಲ' : 'No groups yet'}</h3>
              <p>{lang==='kn' ? 'ಗುಂಪು ರಚಿಸಿ ಅಥವಾ ಸೇರಿ' : 'Create or join a group to get started'}</p>
            </div>
          ) : (
            <div className="comm-groups-grid">
              {myCommunities.map(c => (
                <div key={c.id} className="comm-group-card" onClick={()=>loadCommunityDetail(c)}>
                  <div className="comm-group-top">
                    <Avatar name={c.name} color={c.avatar_color} size={52}/>
                    <div className="comm-group-info">
                      <div className="comm-group-type-badge" style={{background:TYPE_COLORS[c.type]+'22',color:TYPE_COLORS[c.type]}}>{TYPE_ICONS[c.type]} {c.type}</div>
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
              ))}
            </div>
          )}
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
`;

fs.appendFileSync(out, p3);
console.log('p3 done');
