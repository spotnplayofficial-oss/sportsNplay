import { useState, useEffect } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const GroupPage = () => {
  const { user } = useAuth();
  const [myGroups, setMyGroups] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [nearbyGroups, setNearbyGroups] = useState([]);
  const [position, setPosition] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [activeTab, setActiveTab] = useState('my');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [inviteUserId, setInviteUserId] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    sport: 'cricket',
    maxMembers: 11,
    joiningDeadline: '',
    coordinates: [],
  });

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
      .font-bebas { font-family: 'Bebas Neue', cursive !important; }

      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(24px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes shimmer {
        from { background-position: -200% center; }
        to { background-position: 200% center; }
      }
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes cardIn {
        from { opacity: 0; transform: translateY(20px) scale(0.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes pulse-ring {
        0% { transform: scale(1); opacity: 0.6; }
        100% { transform: scale(2); opacity: 0; }
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .animate-fadeUp-1 { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.05s forwards; opacity: 0; }
      .animate-fadeUp-2 { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.15s forwards; opacity: 0; }
      .animate-fadeUp-3 { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.25s forwards; opacity: 0; }
      .animate-cardIn { animation: cardIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
      .animate-slideIn { animation: slideIn 0.3s ease forwards; }
      .animate-spin { animation: spin 1s linear infinite; }

      .shimmer-text {
        background: linear-gradient(90deg, var(--shimmer-color));
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: shimmer 3s linear infinite;
      }

      .grid-dots {
        background-image: radial-gradient(circle, var(--glass-05, rgba(255,255,255,0.05)) 1px, transparent 1px);
        background-size: 28px 28px;
      }

      .create-panel {
        background: var(--glass-02, rgba(255,255,255,0.02));
        border: 1px solid var(--glass-06, rgba(255,255,255,0.06));
        border-radius: 24px;
        padding: 28px;
        transition: all 0.3s ease;
      }

      .input-field {
        width: 100%;
        background: var(--glass-05);
        border: 1px solid var(--glass-08, rgba(255,255,255,0.08));
        border-radius: 12px;
        padding: 12px 14px;
        color: var(--text-main);
        font-size: 14px;
        outline: none;
        transition: all 0.3s ease;
        font-family: 'DM Sans', sans-serif;
      }
      .input-field:focus {
        border-color: rgba(74,222,128,0.4);
        background: var(--glass-05, rgba(255,255,255,0.05));
        box-shadow: 0 0 0 3px rgba(74,222,128,0.06);
      }
      .input-field::placeholder { color: var(--text-muted); opacity: 0.5; }
      .input-field option { background: var(--bg-surface); }

      .label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; display: block; }

      .btn-primary {
        background: linear-gradient(135deg, #4ade80, #22c55e);
        color: black;
        font-weight: 700;
        border-radius: 12px;
        padding: 12px 24px;
        font-size: 14px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        font-family: 'DM Sans', sans-serif;
      }
      .btn-primary::before {
        content: '';
        position: absolute;
        top: 0; left: -100%;
        width: 100%; height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
        transition: left 0.4s ease;
      }
      .btn-primary:hover::before { left: 100%; }
      .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(74,222,128,0.3); }
      .btn-primary:disabled { opacity: 0.5; transform: none; }

      .btn-secondary {
        background: var(--glass-04, rgba(255,255,255,0.04));
        border: 1px solid var(--glass-08, rgba(255,255,255,0.08));
        color: var(--text-muted);
        font-weight: 500;
        border-radius: 12px;
        padding: 12px 20px;
        font-size: 14px;
        transition: all 0.3s ease;
        font-family: 'DM Sans', sans-serif;
      }
      .btn-secondary:hover {
        background: var(--glass-05);
        border-color: var(--text-muted);
        color: var(--text-main);
      }

      .btn-danger {
        background: rgba(239,68,68,0.08);
        border: 1px solid rgba(239,68,68,0.15);
        color: rgba(239,68,68,0.7);
        font-weight: 500;
        border-radius: 12px;
        padding: 8px 16px;
        font-size: 13px;
        transition: all 0.3s ease;
        font-family: 'DM Sans', sans-serif;
      }
      .btn-danger:hover {
        background: rgba(239,68,68,0.15);
        border-color: rgba(239,68,68,0.3);
        color: #ef4444;
      }

      .tab-btn {
        padding: 10px 20px;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 600;
        transition: all 0.3s ease;
        font-family: 'DM Sans', sans-serif;
        white-space: nowrap;
      }
      .tab-active {
        background: rgba(74,222,128,0.12);
        color: #4ade80;
        border: 1px solid rgba(74,222,128,0.2);
      }
      .tab-inactive {
        background: transparent;
        color: var(--text-muted);
        border: 1px solid transparent;
      }
      .tab-inactive:hover { color: var(--text-main); }

      .group-card {
        background: var(--glass-02, rgba(255,255,255,0.02));
        border: 1px solid var(--glass-06, rgba(255,255,255,0.06));
        border-radius: 20px;
        padding: 20px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      .group-card::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, rgba(74,222,128,0.3), transparent);
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .group-card:hover { border-color: rgba(74,222,128,0.15); }
      .group-card:hover::before { opacity: 1; }

      .invite-card {
        background: var(--glass-02, rgba(255,255,255,0.02));
        border: 1px solid rgba(74,222,128,0.1);
        border-radius: 20px;
        padding: 20px;
        transition: all 0.3s ease;
      }
      .invite-card:hover { border-color: rgba(74,222,128,0.25); }

      .member-avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid #060606;
        object-fit: cover;
        margin-left: -8px;
        transition: transform 0.2s ease;
      }
      .member-avatar:hover { transform: translateY(-3px); z-index: 10; }
      .member-avatar:first-child { margin-left: 0; }

      .sport-icon {
        width: 44px;
        height: 44px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        flex-shrink: 0;
      }

      .status-open {
        background: rgba(74,222,128,0.08);
        border: 1px solid rgba(74,222,128,0.2);
        color: #4ade80;
        font-size: 11px;
        font-weight: 600;
        padding: 3px 10px;
        border-radius: 100px;
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }
      .status-closed {
        background: rgba(239,68,68,0.08);
        border: 1px solid rgba(239,68,68,0.15);
        color: rgba(239,68,68,0.7);
        font-size: 11px;
        font-weight: 600;
        padding: 3px 10px;
        border-radius: 100px;
      }

      .progress-bar {
        height: 4px;
        background: var(--glass-06, rgba(255,255,255,0.06));
        border-radius: 100px;
        overflow: hidden;
      }
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #4ade80, #22c55e);
        border-radius: 100px;
        transition: width 0.5s ease;
      }

      .invite-input-row {
        display: flex;
        gap: 8px;
        margin-top: 12px;
        animation: slideIn 0.3s ease forwards;
      }

      .accept-btn {
        background: rgba(74,222,128,0.12);
        border: 1px solid rgba(74,222,128,0.25);
        color: #4ade80;
        font-weight: 600;
        font-size: 13px;
        border-radius: 10px;
        padding: 9px 18px;
        transition: all 0.2s ease;
        font-family: 'DM Sans', sans-serif;
      }
      .accept-btn:hover { background: rgba(74,222,128,0.2); transform: translateY(-1px); }

      .decline-btn {
        background: rgba(239,68,68,0.06);
        border: 1px solid rgba(239,68,68,0.15);
        color: rgba(239,68,68,0.6);
        font-weight: 600;
        font-size: 13px;
        border-radius: 10px;
        padding: 9px 18px;
        transition: all 0.2s ease;
        font-family: 'DM Sans', sans-serif;
      }
      .decline-btn:hover { background: rgba(239,68,68,0.12); color: #ef4444; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    fetchMyGroups();
    fetchInvitations();
    navigator.geolocation.getCurrentPosition((pos) => {
      setPosition([pos.coords.longitude, pos.coords.latitude]);
    });
  }, []);

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const fetchMyGroups = async () => {
    try {
      const { data } = await API.get('/groups/my');
      setMyGroups(data);
    } catch { setMyGroups([]); }
  };

  const fetchInvitations = async () => {
    try {
      const { data } = await API.get('/groups/invitations');
      setInvitations(data);
    } catch { setInvitations([]); }
  };

  const fetchNearbyGroups = async () => {
    if (!position) return;
    setLoading(true);
    try {
      const { data } = await API.get(`/groups/nearby?longitude=${position[0]}&latitude=${position[1]}&radius=5000`);
      setNearbyGroups(data);
    } catch { setNearbyGroups([]); }
    finally { setLoading(false); }
  };

  const handleDetectLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setPosition([pos.coords.longitude, pos.coords.latitude]);
      setForm({ ...form, coordinates: [pos.coords.longitude, pos.coords.latitude] });
      showMessage('Location detected ✅');
    });
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await API.post('/groups', form);
      showMessage('Group created successfully! 🎉');
      fetchMyGroups();
      setForm({ name: '', sport: 'cricket', maxMembers: 11, joiningDeadline: '', coordinates: position || [] });
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to create group', 'error');
    } finally { setCreating(false); }
  };

  const handleInvite = async (groupId) => {
    if (!inviteUserId) return;
    try {
      await API.post(`/groups/${groupId}/invite`, { userId: inviteUserId });
      showMessage('Invitation sent ✅');
      setInviteUserId('');
      setSelectedGroup(null);
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const handleRespond = async (groupId, response) => {
    try {
      await API.patch(`/groups/${groupId}/respond`, { response });
      showMessage(`Invitation ${response} ✅`);
      fetchInvitations();
      fetchMyGroups();
    } catch { showMessage('Failed', 'error'); }
  };

  const handleJoin = async (groupId) => {
    try {
      await API.patch(`/groups/${groupId}/join`);
      showMessage('Joined group! 🎉');
      fetchNearbyGroups();
      fetchMyGroups();
    } catch (err) { showMessage(err.response?.data?.message || 'Failed', 'error'); }
  };

  const handleLeave = async (groupId) => {
    try {
      await API.patch(`/groups/${groupId}/leave`);
      showMessage('Left group');
      fetchMyGroups();
    } catch { showMessage('Failed', 'error'); }
  };

  const handleClose = async (groupId) => {
    try {
      await API.patch(`/groups/${groupId}/close`);
      showMessage('Group closed');
      fetchMyGroups();
    } catch { showMessage('Failed', 'error'); }
  };

  const getSportEmoji = (sport) => {
    const map = { football: '⚽', cricket: '🏏', basketball: '🏀', tennis: '🎾', badminton: '🏸', volleyball: '🏐', 'box cricket': '🏏', 'box football': '⚽' };
    return map[sport] || '🏆';
  };

  const getSportBg = (sport) => {
    const map = { football: 'rgba(34,197,94,0.1)', cricket: 'rgba(59,130,246,0.1)', basketball: 'rgba(249,115,22,0.1)', tennis: 'rgba(234,179,8,0.1)', badminton: 'rgba(168,85,247,0.1)', volleyball: 'rgba(239,68,68,0.1)', 'box cricket': 'rgba(59,130,246,0.1)', 'box football': 'rgba(34,197,94,0.1)' };
    return map[sport] || 'rgba(74,222,128,0.1)';
  };

  const getDeadlineStatus = (deadline) => {
    const diff = new Date(deadline) - new Date();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (diff < 0) return { text: 'Expired', color: 'text-red-400' };
    if (hours < 2) return { text: `${hours}h left`, color: 'text-red-400' };
    if (days < 1) return { text: `${hours}h left`, color: 'text-yellow-400' };
    return { text: `${days}d left`, color: 'text-green-400' };
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] dark:bg-[#060606] text-gray-900 dark:text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="fixed inset-0 grid-dots pointer-events-none opacity-30" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[1px] bg-gradient-to-r from-transparent via-green-400/20 to-transparent pointer-events-none" />

      <Navbar />

      {message && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slideIn px-5 py-3 rounded-2xl text-sm font-medium flex items-center gap-2 shadow-2xl ${
          messageType === 'success'
            ? 'bg-green-400/15 border border-green-400/25 text-green-400'
            : 'bg-red-400/15 border border-red-400/25 text-red-400'
        }`}>
          {messageType === 'success' ? '✅' : '⚠️'} {message}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="animate-fadeUp-1 mb-8">
          <p className="text-green-400 text-xs uppercase tracking-[0.3em] mb-1">Community</p>
          <h1 className="font-bebas text-5xl md:text-6xl tracking-wide shimmer-text">SPORTS GROUPS</h1>
        </div>

        <div className="animate-fadeUp-2 create-panel mb-8">
          <h2 className="font-bebas text-2xl tracking-wide text-gray-900 dark:text-white mb-6">CREATE A GROUP</h2>
          <form onSubmit={handleCreateGroup}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Group Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Sunday Cricket Gang"
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Sport</label>
                <select value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })} className="input-field">
                  <option value="football">⚽ Football</option>
                  <option value="cricket">🏏 Cricket</option>
                  <option value="basketball">🏀 Basketball</option>
                  <option value="tennis">🎾 Tennis</option>
                  <option value="badminton">🏸 Badminton</option>
                  <option value="volleyball">🏐 Volleyball</option>
                  <option value="box cricket">🏏 Box Cricket</option>
                  <option value="box football">⚽ Box Football</option>
                </select>
              </div>
              <div>
                <label className="label">Max Members</label>
                <input
                  type="number"
                  value={form.maxMembers}
                  onChange={(e) => setForm({ ...form, maxMembers: Number(e.target.value) })}
                  min={2} max={50}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Joining Deadline</label>
                <input
                  type="datetime-local"
                  value={form.joiningDeadline}
                  onChange={(e) => setForm({ ...form, joiningDeadline: e.target.value })}
                  required
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={handleDetectLocation} className="btn-secondary flex items-center gap-2">
                📍 {form.coordinates.length > 0 ? 'Location Set ✅' : 'Detect Location'}
              </button>
              <button type="submit" disabled={creating} className="btn-primary flex items-center gap-2">
                {creating ? (
                  <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> Creating...</>
                ) : '👥 Create Group'}
              </button>
            </div>
          </form>
        </div>

        <div className="animate-fadeUp-3">
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {[
              { id: 'my', label: `My Groups`, count: myGroups.length },
              { id: 'invitations', label: `Invitations`, count: invitations.length },
              { id: 'nearby', label: `Nearby`, count: nearbyGroups.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); if (tab.id === 'nearby') fetchNearbyGroups(); }}
                className={`tab-btn ${activeTab === tab.id ? 'tab-active' : 'tab-inactive'}`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-green-400/20' : 'bg-black/8 dark:bg-white/8'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeTab === 'my' && (
            <div className="flex flex-col gap-4">
              {myGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <span className="text-5xl">👥</span>
                  <p className="text-gray-500">No groups yet</p>
                  <p className="text-gray-700 text-sm">Create your first group above</p>
                </div>
              ) : myGroups.map((group, i) => {
                const deadline = getDeadlineStatus(group.joiningDeadline);
                const fillPct = (group.members.length / group.maxMembers) * 100;
                return (
                  <div key={group._id} className="group-card animate-cardIn" style={{ animationDelay: `${i * 0.07}s` }}>
                    <div className="flex items-start gap-4">
                      <div className="sport-icon" style={{ background: getSportBg(group.sport) }}>
                        {getSportEmoji(group.sport)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                          <div>
                            <h3 className="text-gray-900 dark:text-white font-bold text-lg leading-tight">{group.name}</h3>
                            <p className="text-gray-600 text-xs mt-0.5">
                              Created by <span className="text-gray-600 dark:text-gray-400">{group.createdBy?.name}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {group.isOpen ? (
                              <span className="status-open">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                                Open
                              </span>
                            ) : (
                              <span className="status-closed">Closed</span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="text-xs bg-black/4 dark:bg-white/4 border border-black/8 dark:border-white/8 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full capitalize">
                            {getSportEmoji(group.sport)} {group.sport}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full border border-black/8 dark:border-white/8 bg-black/4 dark:bg-white/4 ${deadline.color}`}>
                            ⏰ {deadline.text}
                          </span>
                          <span className="text-xs bg-black/4 dark:bg-white/4 border border-black/8 dark:border-white/8 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                            👥 {group.members.length}/{group.maxMembers}
                          </span>
                        </div>

                        <div className="mb-3">
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${fillPct}%` }} />
                          </div>
                          <p className="text-gray-700 text-xs mt-1">{group.members.length} of {group.maxMembers} spots filled</p>
                        </div>

                        {group.members.length > 0 && (
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex">
                              {group.members.slice(0, 5).map((member, idx) => (
                                member.avatar ? (
                                  <img key={idx} src={member.avatar} alt="" className="member-avatar" style={{ zIndex: idx }} />
                                ) : (
                                  <div key={idx} className="member-avatar bg-green-400/15 border-2 border-[#060606] flex items-center justify-center text-xs text-green-400 font-bold" style={{ zIndex: idx }}>
                                    {member.name?.charAt(0)}
                                  </div>
                                )
                              ))}
                            </div>
                            {group.members.length > 5 && (
                              <span className="text-gray-600 text-xs">+{group.members.length - 5} more</span>
                            )}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {group.createdBy._id === user._id && group.isOpen && (
                            <>
                              <button
                                onClick={() => setSelectedGroup(selectedGroup === group._id ? null : group._id)}
                                className="btn-secondary text-xs py-2 px-3"
                              >
                                {selectedGroup === group._id ? 'Cancel' : '+ Invite Player'}
                              </button>
                              <button onClick={() => handleClose(group._id)} className="btn-danger text-xs py-2">
                                Close Group
                              </button>
                            </>
                          )}
                          {group.createdBy._id !== user._id && (
                            <button onClick={() => handleLeave(group._id)} className="btn-danger text-xs py-2">
                              Leave Group
                            </button>
                          )}

                          <button
    onClick={async () => {
      try {
        const { data } = await API.get(`/chat/group/${group._id}`);
        navigate(`/chat/${data._id}`);
      } catch (err) {
        console.error(err);
      }
    }}
    className="btn-secondary text-xs py-2 px-3"
  >
    💬 Group Chat
  </button>
                        </div>

                        {selectedGroup === group._id && (
                          <div className="invite-input-row">
                            <input
                              type="text"
                              value={inviteUserId}
                              onChange={(e) => setInviteUserId(e.target.value)}
                              placeholder="Paste Player User ID here"
                              className="input-field flex-1 text-xs py-2"
                            />
                            <button onClick={() => handleInvite(group._id)} className="btn-primary text-xs py-2 px-4">
                              Send
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'invitations' && (
            <div className="flex flex-col gap-4">
              {invitations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <span className="text-5xl">📬</span>
                  <p className="text-gray-500">No pending invitations</p>
                </div>
              ) : invitations.map((group, i) => {
                const deadline = getDeadlineStatus(group.joiningDeadline);
                return (
                  <div key={group._id} className="invite-card animate-cardIn" style={{ animationDelay: `${i * 0.07}s` }}>
                    <div className="flex items-start gap-4">
                      <div className="sport-icon" style={{ background: getSportBg(group.sport) }}>
                        {getSportEmoji(group.sport)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-1">{group.name}</h3>
                        <p className="text-gray-500 text-sm mb-1">
                          Invited by <span className="text-gray-700 dark:text-gray-300">{group.createdBy?.name}</span>
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="text-xs bg-black/4 dark:bg-white/4 border border-black/8 dark:border-white/8 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full capitalize">
                            {getSportEmoji(group.sport)} {group.sport}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full border border-black/8 dark:border-white/8 bg-black/4 dark:bg-white/4 ${deadline.color}`}>
                            ⏰ {deadline.text}
                          </span>
                          <span className="text-xs bg-black/4 dark:bg-white/4 border border-black/8 dark:border-white/8 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                            👥 {group.members?.length}/{group.maxMembers}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleRespond(group._id, 'accepted')} className="accept-btn">
                            ✅ Accept
                          </button>
                          <button onClick={() => handleRespond(group._id, 'declined')} className="decline-btn">
                            ✕ Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'nearby' && (
            <div className="flex flex-col gap-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-8 h-8 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                  <p className="text-gray-600 text-sm">Finding groups nearby...</p>
                </div>
              ) : nearbyGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <span className="text-5xl">🔍</span>
                  <p className="text-gray-500">No groups found nearby</p>
                  <p className="text-gray-700 text-sm">Try refreshing or check back later</p>
                </div>
              ) : nearbyGroups.map((group, i) => {
                const deadline = getDeadlineStatus(group.joiningDeadline);
                const fillPct = (group.members.length / group.maxMembers) * 100;
                return (
                  <div key={group._id} className="group-card animate-cardIn" style={{ animationDelay: `${i * 0.07}s` }}>
                    <div className="flex items-start gap-4">
                      <div className="sport-icon" style={{ background: getSportBg(group.sport) }}>
                        {getSportEmoji(group.sport)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                          <div>
                            <h3 className="text-gray-900 dark:text-white font-bold text-lg">{group.name}</h3>
                            <p className="text-gray-600 text-xs">By {group.createdBy?.name}</p>
                          </div>
                          <span className="status-open">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                            Open
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="text-xs bg-black/4 dark:bg-white/4 border border-black/8 dark:border-white/8 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full capitalize">
                            {getSportEmoji(group.sport)} {group.sport}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full border border-black/8 dark:border-white/8 bg-black/4 dark:bg-white/4 ${deadline.color}`}>
                            ⏰ {deadline.text}
                          </span>
                          <span className="text-xs bg-black/4 dark:bg-white/4 border border-black/8 dark:border-white/8 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                            👥 {group.members.length}/{group.maxMembers}
                          </span>
                        </div>

                        <div className="mb-4">
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${fillPct}%` }} />
                          </div>
                        </div>

                        <button onClick={() => handleJoin(group._id)} className="btn-primary text-sm py-2.5">
                          Join Group 👥
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupPage;