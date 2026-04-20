const fs = require('fs');
const path = 'wastesmart-main/frontend-react/src/pages/Community.jsx';

const part3 = `
      {/* DETAIL */}
      {view==='detail' && selectedCommunity && (
        <div className="comm-detail-root">

          {/* Community header banner */}
          <div className="comm-detail-banner" style={{background:\`linear-gradient(135deg, \${selectedCommunity.avatar_color}22, \${selectedCommunity.avatar_color}08)\`}}>
            <div className="comm-detail-banner-inner">
              <Avatar name={selectedCommunity.name} color={selectedCommunity.avatar_color} size={64}/>
              <div className="comm-detail-info">
                <div className="comm-group-type-badge" style={{background:TYPE_COLORS[selectedCommunity.type]+'22',color:TYPE_COLORS[selectedCommunity.type]}}>{TYPE_ICONS[selectedCommunity.type]} {selectedCommunity.type}</div>
                <h2>{selectedCommunity.name}</h2>
                {selectedCommunity.description && <p>{selectedCommunity.description}</p>}
                <div className="comm-detail-code">
                  {lang==='kn'?'ಕೋಡ್:':'Code:'} <strong>{selectedCommunity.join_code}</strong>
                  <button onClick={()=>navigator.clipboard.writeText(selectedCommunity.join_code)} className="comm-copy-btn">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    Copy
                  </button>
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

          {/* Tabs */}
          <div className="comm-tabs-bar">
            {['feed','challenges','leaderboard'].map(t=>(
              <button key={t} className={\`comm-tab \${activeTab===t?'active':''}\`} onClick={()=>setActiveTab(t)}>
                {t==='feed'?(lang==='kn'?'ಫೀಡ್':'Feed'):t==='challenges'?(lang==='kn'?'ಸ್ಪರ್ಧೆಗಳು':'Challenges'):(lang==='kn'?'ಲೀಡರ್‌ಬೋರ್ಡ್':'Leaderboard')}
              </button>
            ))}
          </div>

          {/* FEED TAB */}
          {activeTab==='feed' && (
            <div className="comm-feed-container">

              {/* Post composer */}
              {showPostBox ? (
                <div className="comm-composer">
                  <div className="comm-composer-top">
                    <Avatar name={userName} color={userColor} size={38}/>
                    <div className="comm-composer-right">
                      <div className="comm-post-types">
                        {[['update','📢',lang==='kn'?'ಅಪ್‌ಡೇಟ್':'Update'],['challenge','🏆',lang==='kn'?'ಸ್ಪರ್ಧೆ':'Challenge'],['scan','🔍',lang==='kn'?'ಸ್ಕ್ಯಾನ್':'Scan'],['tip','💡',lang==='kn'?'ಸಲಹೆ':'Tip']].map(([t,icon,label])=>(
                          <button key={t} className={\`comm-ptype-btn \${postType===t?'active':''}\`} onClick={()=>setPostType(t)}>{icon} {label}</button>
                        ))}
                      </div>
                      <textarea className="comm-composer-input" placeholder={lang==='kn'?'ನಿಮ್ಮ ಅನುಭವ ಹಂಚಿಕೊಳ್ಳಿ...':'Share your eco journey, challenge update, or tip...'} value={postContent} onChange={e=>setPostContent(e.target.value)} rows={3} autoFocus/>
                      {postImagePreview && (
                        <div className="comm-composer-img-wrap">
                          <img src={postImagePreview} alt="preview" className="comm-composer-img"/>
                          <button className="comm-remove-img" onClick={()=>{setPostImage(null);setPostImagePreview(null)}}>✕</button>
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

              {/* Posts */}
              {posts.length===0 ? (
                <div className="comm-no-posts">
                  <div style={{fontSize:48}}>🌱</div>
                  <h3>{lang==='kn'?'ಇನ್ನೂ ಯಾವುದೇ ಪೋಸ್ಟ್ ಇಲ್ಲ':'No posts yet'}</h3>
                  <p>{lang==='kn'?'ಮೊದಲ ಪೋಸ್ಟ್ ಮಾಡಿ!':'Be the first to post!'}</p>
                </div>
              ) : posts.map(post => {
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

                    {/* Reactions */}
                    <div className="comm-reactions-row">
                      <div className="comm-reaction-btns">
                        {REACTIONS.map(emoji=>(
                          <button key={emoji} className="comm-react-btn" onClick={()=>addReaction(post.id,emoji)}>
                            {emoji} {post.reactions?.[emoji]>0 && <span>{post.reactions[emoji]}</span>}
                          </button>
                        ))}
                      </div>
                      <button className="comm-comment-toggle" onClick={()=>loadComments(post.id)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        {post.comment_count||0} {lang==='kn'?'ಕಾಮೆಂಟ್':'comments'}
                      </button>
                    </div>

                    {/* Comments */}
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

          {/* CHALLENGES TAB */}
          {activeTab==='challenges' && (
            <div className="comm-tab-content">
              {challenges.length===0 ? (
                <div className="comm-no-posts"><div style={{fontSize:48}}>🏆</div><h3>{lang==='kn'?'ಇನ್ನೂ ಯಾವುದೇ ಸ್ಪರ್ಧೆ ಇಲ್ಲ':'No challenges yet'}</h3></div>
              ) : challenges.map(ch=>{
                const pct = Math.min(100,((ch.current_scans||0)/(ch.target_scans||1))*100)
                const done = ch.status==='completed'||pct>=100
                return (
                  <div key={ch.id} className={\`comm-challenge-card \${done?'done':''}\`}>
                    <div className="comm-challenge-top">
                      <div>
                        <div className="comm-challenge-badge" style={{background:done?'rgba(16,185,129,0.15)':'rgba(245,158,11,0.15)',color:done?'#10b981':'#f59e0b'}}>{done?(lang==='kn'?'✅ ಪೂರ್ಣ':'✅ Completed'):(lang==='kn'?'🔥 ಸಕ್ರಿಯ':'🔥 Active')}</div>
                        <h4>{ch.title}</h4>
                        <p>{ch.description}</p>
                      </div>
                    </div>
                    <div className="comm-challenge-progress">
                      <div className="comm-challenge-progress-label"><span>{ch.current_scans||0} / {ch.target_scans} {lang==='kn'?'ಸ್ಕ್ಯಾನ್':'scans'}</span><span style={{fontWeight:700,color:done?'#10b981':'#f59e0b'}}>{pct.toFixed(0)}%</span></div>
                      <div className="comm-progress-track"><div className="comm-progress-fill" style={{width:pct+'%',background:done?'linear-gradient(90deg,#10b981,#059669)':'linear-gradient(90deg,#f59e0b,#f97316)'}}/></div>
                    </div>
                    {ch.end_date && <p className="comm-challenge-date">📅 {lang==='kn'?'ಅಂತಿಮ:':'Ends:'} {new Date(ch.end_date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>}
                  </div>
                )
              })}
            </div>
          )}

          {/* LEADERBOARD TAB */}
          {activeTab==='leaderboard' && (
            <div className="comm-tab-content">
              <div className="comm-lb-podium">
                {members.slice(0,3).map((m,i)=>(
                  <div key={m.id} className={\`comm-podium-item rank-\${i+1}\`}>
                    <div className="comm-podium-crown">{i===0?'👑':i===1?'🥈':'🥉'}</div>
                    <Avatar name={m.user_name||'User'} color={m.user_color||[' #f59e0b','#94a3b8','#cd7c2f'][i]} size={i===0?56:46}/>
                    <div className="comm-podium-name">{m.user_name||'Anonymous'}{m.user_id===userId&&<span className="comm-lb-you"> (You)</span>}</div>
                    <div className="comm-podium-pts" style={{color:['#f59e0b','#94a3b8','#cd7c2f'][i]}}>{m.points||0} pts</div>
                  </div>
                ))}
              </div>
              <div className="comm-leaderboard">
                {members.map((m,i)=>(
                  <div key={m.id} className={\`comm-lb-row \${m.user_id===userId?'mine':''}\`}>
                    <div className="comm-lb-rank" style={{color:i===0?'#f59e0b':i===1?'#94a3b8':i===2?'#cd7c2f':'var(--muted2)'}}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':\`#\${i+1}\`}</div>
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
                {members.length===0&&<p className="comm-empty-text">{lang==='kn'?'ಇನ್ನೂ ಯಾವುದೇ ಸದಸ್ಯರಿಲ್ಲ':'No members yet'}</p>}
              </div>
            </div>
          )}

          <button className="comm-leave-btn" onClick={()=>leaveCommunity(selectedCommunity.id)}>{lang==='kn'?'ಗುಂಪು ಬಿಡಿ':'Leave Group'}</button>
        </div>
      )}
    </div>
  )
}
`;

fs.appendFileSync(path, part3);
console.log('part3 done');
