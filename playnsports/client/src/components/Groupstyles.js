// GroupStyles.js — shared style injection for Group pages
export const GROUP_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  .font-bebas { font-family: 'Bebas Neue', cursive !important; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shimmer { from{background-position:-200% center} to{background-position:200% center} }
  @keyframes slideIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cardIn { from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes overlayIn { from{opacity:0} to{opacity:1} }
  @keyframes modalIn { from{opacity:0;transform:translateY(30px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }

  .g-anim-1 { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.05s forwards; opacity:0; }
  .g-anim-2 { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.15s forwards; opacity:0; }
  .g-anim-3 { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.25s forwards; opacity:0; }
  .g-cardIn { animation: cardIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards; opacity:0; }
  .g-slideIn { animation: slideIn 0.3s ease forwards; }
  .g-spin { animation: spin 1s linear infinite; }
  .g-overlayIn { animation: overlayIn 0.2s ease forwards; }
  .g-modalIn { animation: modalIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards; }

  .shimmer-text {
    background: linear-gradient(90deg,#4ade80,#22c55e,#86efac,#4ade80);
    background-size:200% auto;
    -webkit-background-clip:text;
    -webkit-text-fill-color:transparent;
    animation: shimmer 3s linear infinite;
  }
  .grid-dots {
    background-image: radial-gradient(circle,rgba(255,255,255,0.04) 1px,transparent 1px);
    background-size: 28px 28px;
  }

  /* Cards */
  .g-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 20px;
    padding: 20px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  .g-card::before {
    content:'';
    position:absolute;
    top:0;left:0;right:0;
    height:2px;
    background:linear-gradient(90deg,transparent,rgba(74,222,128,0.3),transparent);
    opacity:0;
    transition:opacity 0.3s;
  }
  .g-card:hover { border-color:rgba(74,222,128,0.15); }
  .g-card:hover::before { opacity:1; }

  .g-invite-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(74,222,128,0.1);
    border-radius: 20px;
    padding: 20px;
    transition: all 0.3s;
  }
  .g-invite-card:hover { border-color:rgba(74,222,128,0.25); }

  /* Inputs & Buttons */
  .g-input {
    width:100%;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.08);
    border-radius:12px;
    padding:11px 14px;
    color:inherit;
    font-size:14px;
    outline:none;
    transition:all 0.25s;
    font-family:'DM Sans',sans-serif;
  }
  .g-input:focus { border-color:rgba(74,222,128,0.4); background:rgba(74,222,128,0.03); box-shadow:0 0 0 3px rgba(74,222,128,0.06); }
  .g-input::placeholder { color:#4b5563; }
  .g-input option { background:#111; }

  .g-label { font-size:11px; color:#6b7280; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:5px; display:block; }

  .g-btn-primary {
    background:linear-gradient(135deg,#4ade80,#22c55e);
    color:black;
    font-weight:700;
    border-radius:12px;
    padding:11px 22px;
    font-size:14px;
    transition:all 0.3s;
    position:relative;
    overflow:hidden;
    font-family:'DM Sans',sans-serif;
    border:none;
    cursor:pointer;
  }
  .g-btn-primary::before { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent); transition:left 0.4s; }
  .g-btn-primary:hover::before { left:100%; }
  .g-btn-primary:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(74,222,128,0.3); }
  .g-btn-primary:disabled { opacity:0.5; transform:none; box-shadow:none; cursor:not-allowed; }

  .g-btn-secondary {
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.08);
    color:#9ca3af;
    font-weight:500;
    border-radius:12px;
    padding:10px 18px;
    font-size:13px;
    transition:all 0.25s;
    font-family:'DM Sans',sans-serif;
    cursor:pointer;
  }
  .g-btn-secondary:hover { background:rgba(255,255,255,0.06); border-color:#9ca3af; color:white; }

  .g-btn-danger {
    background:rgba(239,68,68,0.08);
    border:1px solid rgba(239,68,68,0.15);
    color:rgba(239,68,68,0.7);
    font-weight:600;
    border-radius:10px;
    padding:7px 14px;
    font-size:12px;
    transition:all 0.2s;
    font-family:'DM Sans',sans-serif;
    cursor:pointer;
  }
  .g-btn-danger:hover { background:rgba(239,68,68,0.15); color:#ef4444; }

  .g-accept-btn {
    background:rgba(74,222,128,0.12);
    border:1px solid rgba(74,222,128,0.25);
    color:#4ade80;
    font-weight:600;
    font-size:13px;
    border-radius:10px;
    padding:9px 18px;
    transition:all 0.2s;
    font-family:'DM Sans',sans-serif;
    cursor:pointer;
  }
  .g-accept-btn:hover { background:rgba(74,222,128,0.2); }

  .g-decline-btn {
    background:rgba(239,68,68,0.06);
    border:1px solid rgba(239,68,68,0.15);
    color:rgba(239,68,68,0.6);
    font-weight:600;
    font-size:13px;
    border-radius:10px;
    padding:9px 18px;
    transition:all 0.2s;
    font-family:'DM Sans',sans-serif;
    cursor:pointer;
  }
  .g-decline-btn:hover { background:rgba(239,68,68,0.12); color:#ef4444; }

  /* Tabs */
  .g-tab {
    padding:10px 20px;
    border-radius:12px;
    font-size:13px;
    font-weight:600;
    transition:all 0.25s;
    font-family:'DM Sans',sans-serif;
    white-space:nowrap;
    border:1px solid transparent;
    cursor:pointer;
  }
  .g-tab-active { background:rgba(74,222,128,0.12); color:#4ade80; border-color:rgba(74,222,128,0.2); }
  .g-tab-inactive { background:transparent; color:#6b7280; }
  .g-tab-inactive:hover { color:#9ca3af; border-color:rgba(255,255,255,0.08); }

  /* Status badges */
  .g-status-open {
    background:rgba(74,222,128,0.08);
    border:1px solid rgba(74,222,128,0.2);
    color:#4ade80;
    font-size:11px;
    font-weight:600;
    padding:3px 10px;
    border-radius:100px;
    display:inline-flex;
    align-items:center;
    gap:5px;
  }
  .g-status-closed {
    background:rgba(239,68,68,0.08);
    border:1px solid rgba(239,68,68,0.15);
    color:rgba(239,68,68,0.7);
    font-size:11px;
    font-weight:600;
    padding:3px 10px;
    border-radius:100px;
  }

  /* Progress bar */
  .g-progress-track { height:4px; background:rgba(255,255,255,0.06); border-radius:100px; overflow:hidden; }
  .g-progress-fill { height:100%; background:linear-gradient(90deg,#4ade80,#22c55e); border-radius:100px; transition:width 0.5s; }

  /* Sport icon */
  .g-sport-icon { width:44px; height:44px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0; }

  /* Member avatar stack */
  .g-member-avatar {
    width:28px; height:28px; border-radius:50%;
    border:2px solid var(--bg, #060606);
    object-fit:cover;
    margin-left:-8px;
    transition:transform 0.2s;
    flex-shrink:0;
  }
  .g-member-avatar:first-child { margin-left:0; }
  .g-member-avatar:hover { transform:translateY(-3px); z-index:10; }
  .g-member-initial {
    width:28px; height:28px; border-radius:50%;
    border:2px solid #060606;
    display:flex; align-items:center; justify-content:center;
    font-size:11px; font-weight:700; color:#4ade80;
    background:rgba(74,222,128,0.1);
    margin-left:-8px;
    flex-shrink:0;
  }
  .g-member-initial:first-child { margin-left:0; }

  /* Modal overlay */
  .g-overlay {
    position:fixed; inset:0; z-index:100;
    background:rgba(0,0,0,0.75);
    backdrop-filter:blur(8px);
    display:flex; align-items:flex-end;
    justify-content:center;
    padding:0;
  }
  @media(min-width:640px) {
    .g-overlay { align-items:center; padding:20px; }
  }

  .g-modal {
    background:#0d1117;
    border:1px solid rgba(255,255,255,0.08);
    border-radius:24px 24px 0 0;
    width:100%;
    max-width:520px;
    max-height:85vh;
    display:flex;
    flex-direction:column;
    overflow:hidden;
    animation: modalIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards;
  }
  @media(min-width:640px) {
    .g-modal { border-radius:24px; }
  }

  /* Player picker item */
  .g-player-item {
    display:flex; align-items:center; gap:12px;
    padding:12px 16px;
    border-radius:14px;
    border:1px solid transparent;
    transition:all 0.2s;
    cursor:pointer;
  }
  .g-player-item:hover { background:rgba(74,222,128,0.04); border-color:rgba(74,222,128,0.15); }
  .g-player-item.selected { background:rgba(74,222,128,0.08); border-color:rgba(74,222,128,0.3); }

  /* Search bar in modal */
  .g-search {
    background:rgba(255,255,255,0.05);
    border:1px solid rgba(255,255,255,0.08);
    border-radius:12px;
    padding:10px 14px 10px 38px;
    color:inherit;
    font-size:13px;
    outline:none;
    width:100%;
    font-family:'DM Sans',sans-serif;
    transition:all 0.2s;
  }
  .g-search:focus { border-color:rgba(74,222,128,0.35); }
  .g-search::placeholder { color:#4b5563; }

  /* Member row in group detail */
  .g-member-row {
    display:flex; align-items:center; gap:10px;
    padding:10px 12px;
    border-radius:12px;
    border:1px solid transparent;
    transition:all 0.2s;
  }
  .g-member-row:hover { background:rgba(255,255,255,0.02); border-color:rgba(255,255,255,0.05); }
`;