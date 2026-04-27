import { useState, useEffect } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import MapLocationPicker from '../components/MapLocationPicker';

const GroundOwnerDashboard = () => {
  const { user } = useAuth();
  const [grounds, setGrounds] = useState([]);
  const [selectedGround, setSelectedGround] = useState(null);
  const [groundBookings, setGroundBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('grounds');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingGroundId, setEditingGroundId] = useState(null);

  const [groundForm, setGroundForm] = useState({
    name: '', sport: 'cricket', address: '',
    pricePerHour: '', amenities: [], coordinates: [], isSocial: false,
  });
  const [amenityInput, setAmenityInput] = useState('');
  const PRESET_AMENITIES = ['Parking', 'Washroom', 'Drinking Water', 'Floodlights', 'Seating', 'Changing Room', 'First Aid', 'Equipment Rental'];

  const [slotForm, setSlotForm] = useState({
    date: '', startTime: '', endTime: '',
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
        from { opacity: 0; transform: translateY(16px) scale(0.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

      .animate-fadeUp-1 { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.05s forwards; opacity: 0; }
      .animate-fadeUp-2 { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.15s forwards; opacity: 0; }
      .animate-fadeUp-3 { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.25s forwards; opacity: 0; }
      .animate-fadeUp-4 { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.35s forwards; opacity: 0; }
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

      .glass-card {
        background: var(--glass-02, rgba(255,255,255,0.02));
        border: 1px solid var(--glass-06, rgba(255,255,255,0.06));
        border-radius: 24px;
        padding: 24px;
      }

      .stat-card {
        background: var(--glass-02, rgba(255,255,255,0.02));
        border: 1px solid var(--glass-06, rgba(255,255,255,0.06));
        border-radius: 20px;
        padding: 20px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      .stat-card::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 2px;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .stat-card:hover::before { opacity: 1; }
      .stat-card:hover { border-color: rgba(74,222,128,0.15); transform: translateY(-3px); }
      .stat-green::before { background: linear-gradient(90deg, transparent, #4ade80, transparent); }
      .stat-blue::before { background: linear-gradient(90deg, transparent, #60a5fa, transparent); }
      .stat-orange::before { background: linear-gradient(90deg, transparent, #fb923c, transparent); }
      .stat-purple::before { background: linear-gradient(90deg, transparent, #a78bfa, transparent); }

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
      .tab-inactive:hover { color: var(--text-muted); }

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

      .label {
        font-size: 11px;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 6px;
        display: block;
      }

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
        padding: 10px 18px;
        font-size: 13px;
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
        font-weight: 600;
        border-radius: 12px;
        padding: 10px 18px;
        font-size: 13px;
        transition: all 0.2s ease;
        font-family: 'DM Sans', sans-serif;
      }
      .btn-danger:hover { background: rgba(239,68,68,0.15); color: #ef4444; }

      .ground-card {
        background: var(--glass-02, rgba(255,255,255,0.02));
        border: 1px solid var(--glass-06, rgba(255,255,255,0.06));
        border-radius: 20px;
        padding: 20px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      .ground-card::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, rgba(74,222,128,0.4), transparent);
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .ground-card:hover::before { opacity: 1; }
      .ground-card:hover { border-color: rgba(74,222,128,0.15); }
      .ground-card.selected {
        border-color: rgba(74,222,128,0.3);
        background: rgba(74,222,128,0.03);
      }
      .ground-card.selected::before { opacity: 1; }

      .booking-card {
        background: var(--glass-02, rgba(255,255,255,0.02));
        border: 1px solid var(--glass-05, rgba(255,255,255,0.05));
        border-radius: 14px;
        padding: 14px;
        transition: all 0.2s ease;
      }
      .booking-card:hover { border-color: rgba(74,222,128,0.1); }

      .status-badge {
        font-size: 11px;
        font-weight: 600;
        padding: 3px 10px;
        border-radius: 100px;
      }

      .slot-pill {
        background: rgba(74,222,128,0.06);
        border: 1px solid rgba(74,222,128,0.12);
        color: var(--text-muted);
        font-size: 11px;
        padding: 4px 10px;
        border-radius: 100px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .slot-pill.booked {
        background: rgba(239,68,68,0.06);
        border-color: rgba(239,68,68,0.12);
        color: rgba(239,68,68,0.6);
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

      .revenue-card {
        background: rgba(74,222,128,0.04);
        border: 1px solid rgba(74,222,128,0.1);
        border-radius: 16px;
        padding: 16px;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => { fetchGrounds(); }, []);

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const fetchGrounds = async () => {
    try {
      const { data } = await API.get('/grounds/my');
      setGrounds(data);
    } catch { setGrounds([]); }
  };

  const fetchGroundBookings = async (groundId) => {
    try {
      const { data } = await API.get(`/bookings/grounds/${groundId}`);
      setGroundBookings(data);
    } catch { setGroundBookings([]); }
  };

  const handleSelectGround = (ground) => {
    if (selectedGround?._id === ground._id) {
      setSelectedGround(null);
      setGroundBookings([]);
    } else {
      setSelectedGround(ground);
      fetchGroundBookings(ground._id);
      setActiveTab('bookings');
    }
  };

  const handleDetectLocation = () => {
    setShowMapPicker(true);
  };

  const handleAddAmenity = (val) => {
    const trimmed = val.trim();
    if (trimmed && !groundForm.amenities.includes(trimmed)) {
      setGroundForm({ ...groundForm, amenities: [...groundForm.amenities, trimmed] });
    }
    setAmenityInput('');
  };

  const handleRemoveAmenity = (val) => {
    setGroundForm({ ...groundForm, amenities: groundForm.amenities.filter(a => a !== val) });
  };

  const handleCreateGround = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await API.put(`/grounds/${editingGroundId}`, {
          name: groundForm.name,
          sport: groundForm.sport,
          address: groundForm.address,
          pricePerHour: Number(groundForm.pricePerHour),
          amenities: groundForm.amenities,
          longitude: groundForm.coordinates[0],
          latitude: groundForm.coordinates[1],
          isSocial: groundForm.isSocial,
        });
        showMessage('Ground updated successfully! 🏟️');
      } else {
        await API.post('/grounds', {
          name: groundForm.name,
          sport: groundForm.sport,
          address: groundForm.address,
          pricePerHour: Number(groundForm.pricePerHour),
          amenities: groundForm.amenities,
          longitude: groundForm.coordinates[0],
          latitude: groundForm.coordinates[1],
          isSocial: groundForm.isSocial,
        });
        showMessage('Ground created successfully! 🏟️');
      }
      
      setGroundForm({ name: '', sport: 'cricket', address: '', pricePerHour: '', amenities: [], coordinates: [], isSocial: false });
      setIsEditing(false);
      setEditingGroundId(null);
      fetchGrounds();
      if (isEditing) fetchGroundBookings(editingGroundId);
      setActiveTab('grounds');
    } catch (err) {
      showMessage(err.response?.data?.message || (isEditing ? 'Failed to update ground' : 'Failed to create ground'), 'error');
    } finally { setLoading(false); }
  };

  const handleEditGround = (ground) => {
    setGroundForm({
      name: ground.name,
      sport: ground.sport,
      address: ground.address,
      pricePerHour: ground.pricePerHour,
      amenities: ground.amenities || [],
      coordinates: ground.location?.coordinates ? [ground.location.coordinates[0], ground.location.coordinates[1]] : [],
      isSocial: ground.isSocial || false,
    });
    setEditingGroundId(ground._id);
    setIsEditing(true);
    setActiveTab('create');
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!selectedGround) return showMessage('Select a ground first', 'error');
    try {
      await API.post(`/grounds/${selectedGround._id}/slots`, {
        slots: [slotForm],
      });
      showMessage('Slot added ✅');
      setSlotForm({ date: '', startTime: '', endTime: '' });
      fetchGrounds();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const handleDeleteGround = async (groundId) => {
    if (!window.confirm('Delete this ground permanently?')) return;
    try {
      await API.delete(`/grounds/${groundId}`);
      showMessage('Ground deleted');
      setSelectedGround(null);
      setGroundBookings([]);
      fetchGrounds();
    } catch { showMessage('Failed to delete', 'error'); }
  };

  const getStatusBadge = (status) => {
    const map = {
      advance_pending: { label: 'Advance Pending', color: 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20' },
      advance_paid: { label: 'Advance Paid', color: 'bg-blue-400/10 text-blue-400 border border-blue-400/20' },
      completed: { label: 'Completed 🎉', color: 'bg-green-400/10 text-green-400 border border-green-400/20' },
      refunded: { label: 'Refunded', color: 'bg-gray-400/10 text-gray-600 dark:text-gray-400 border border-gray-400/20' },
      cancelled: { label: 'Cancelled', color: 'bg-red-400/10 text-red-400 border border-red-400/20' },
    };
    return map[status] || { label: status, color: 'bg-black/10 dark:bg-white/10 text-gray-900 dark:text-white' };
  };

  const getSportEmoji = (sport) => {
    const map = { football: '⚽', cricket: '🏏', basketball: '🏀', tennis: '🎾', badminton: '🏸', volleyball: '🏐', 'box cricket': '🏏', 'box football': '⚽' };
    return map[sport] || '🏆';
  };

  const totalRevenue = grounds.reduce((sum, g) => {
    return sum + (g.slots?.filter(s => s.isBooked).length * g.pricePerHour);
  }, 0);
  const totalSlots = grounds.reduce((sum, g) => sum + (g.slots?.length || 0), 0);
  const bookedSlots = grounds.reduce((sum, g) => sum + (g.slots?.filter(s => s.isBooked).length || 0), 0);
  const totalBookings = groundBookings.length;

  return (
    <div className="min-h-screen bg-[#fcfcfc] dark:bg-[#060606] text-gray-900 dark:text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="fixed inset-0 grid-dots pointer-events-none opacity-30" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[1px] bg-gradient-to-r from-transparent via-green-400/20 to-transparent pointer-events-none" />

      <Navbar />

      {showMapPicker && (
        <MapLocationPicker
          initialCoordinates={groundForm.coordinates}
          initialAddress={groundForm.address}
          onConfirm={(coords, addr) => {
            setGroundForm({ ...groundForm, coordinates: coords, address: addr });
            setShowMapPicker(false);
          }}
          onClose={() => setShowMapPicker(false)}
        />
      )}

      {message && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slideIn px-5 py-3 rounded-2xl text-sm font-medium flex items-center gap-2 shadow-2xl whitespace-nowrap ${
          messageType === 'success'
            ? 'bg-green-400/15 border border-green-400/25 text-green-400'
            : 'bg-red-400/15 border border-red-400/25 text-red-400'
        }`}>
          {messageType === 'success' ? '✅' : '⚠️'} {message}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="animate-fadeUp-1 flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <p className="text-green-400 text-xs uppercase tracking-[0.3em] mb-1">Ground Owner</p>
            <h1 className="font-bebas text-5xl tracking-wide shimmer-text">
              {user?.name?.split(' ')[0]}'S DASHBOARD
            </h1>
            <p className="text-gray-600 text-sm mt-1">Manage your grounds and track bookings 🏟️</p>
          </div>
          <Link to="/profile" className="w-10 h-10 rounded-full overflow-hidden border border-black/10 dark:border-white/10 hover:border-green-400/30 transition-colors flex-shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-green-400/10 flex items-center justify-center text-green-400 font-bold text-sm">
                {user?.name?.charAt(0)}
              </div>
            )}
          </Link>
        </div>

        {/* Stats */}
        <div className="animate-fadeUp-2 grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'My Grounds', value: grounds.length, icon: '🏟️', color: 'stat-green' },
            { label: 'Total Slots', value: totalSlots, icon: '📅', color: 'stat-blue' },
            { label: 'Slots Booked', value: bookedSlots, icon: '✅', color: 'stat-orange' },
            { label: 'Est. Revenue', value: `₹${totalRevenue}`, icon: '💰', color: 'stat-purple' },
          ].map((stat, i) => (
            <div key={i} className={`stat-card ${stat.color}`}>
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="font-bebas text-3xl text-gray-900 dark:text-white">{stat.value}</div>
              <div className="text-gray-600 text-xs uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="animate-fadeUp-3 grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — My Grounds List */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bebas text-2xl tracking-wide text-gray-900 dark:text-white">MY GROUNDS</h2>
              <button onClick={() => setActiveTab('create')} className="btn-secondary text-xs py-2 px-3">
                + New Ground
              </button>
            </div>

            {grounds.length === 0 ? (
              <div className="glass-card text-center py-10">
                <span className="text-4xl block mb-3">🏟️</span>
                <p className="text-gray-500 text-sm">No grounds yet</p>
                <button onClick={() => setActiveTab('create')} className="btn-primary mt-4 text-sm px-6 py-2.5">
                  Create First Ground
                </button>
              </div>
            ) : grounds.map((ground, i) => {
              const available = ground.slots?.filter(s => !s.isBooked).length || 0;
              const booked = ground.slots?.filter(s => s.isBooked).length || 0;
              const total = ground.slots?.length || 0;
              const fillPct = total > 0 ? (booked / total) * 100 : 0;
              const isSelected = selectedGround?._id === ground._id;

              return (
                <div
                  key={ground._id}
                  onClick={() => handleSelectGround(ground)}
                  className={`ground-card animate-cardIn cursor-pointer ${isSelected ? 'selected' : ''}`}
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)' }}>
                      {getSportEmoji(ground.sport)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 dark:text-white font-semibold text-sm truncate flex items-center gap-2">
                        {ground.name}
                        {ground.isSocial && <span className="text-[10px] bg-yellow-400 text-black px-1.5 py-0.5 rounded font-bold tracking-widest leading-none">SOCIAL</span>}
                      </p>
                      <p className="text-gray-600 text-xs truncate">📍 {ground.address}</p>
                    </div>
                    {isSelected && (
                      <span className="text-green-400 text-xs font-semibold flex-shrink-0">Selected ✓</span>
                    )}
                  </div>

                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-600">{booked}/{total} booked</span>
                    <span className="text-green-400 font-semibold">₹{ground.pricePerHour}/hr</span>
                  </div>

                  <div className="progress-bar mb-3">
                    <div className="progress-fill" style={{ width: `${fillPct}%` }} />
                  </div>

                  <div className="flex gap-2 flex-wrap items-center">
                    <span className="slot-pill">✅ {available} free</span>
                    <span className="slot-pill booked">🔴 {booked} booked</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEditGround(ground); }} 
                      className="ml-auto text-xs bg-blue-400/10 text-blue-400 border border-blue-400/20 px-3 py-1 rounded-full hover:bg-blue-400/20 transition-colors flex items-center gap-1"
                    >
                      ✏️ Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right — Tabs Panel */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[
                { id: 'grounds', label: '📋 Overview' },
                { id: 'bookings', label: `📅 Bookings ${selectedGround ? `(${groundBookings.length})` : ''}` },
                { id: 'slots', label: '➕ Add Slots' },
                { id: 'create', label: isEditing ? '✏️ Edit Ground' : '🏟️ New Ground' },
              ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`tab-btn ${activeTab === tab.id ? 'tab-active' : 'tab-inactive'}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === 'grounds' && (
              <div className="flex flex-col gap-4">
                {selectedGround ? (
                  <>
                    <div className="glass-card animate-cardIn">
                      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                        <div>
                          <h3 className="font-bebas text-2xl text-gray-900 dark:text-white flex items-center gap-2">
                            {selectedGround.name}
                            {selectedGround.isSocial && <span className="bg-yellow-400 text-black text-xs px-2 py-0.5 rounded font-bold tracking-wider mb-1">SOCIAL GROUND</span>}
                          </h3>
                          <p className="text-gray-500 text-sm">📍 {selectedGround.address}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditGround(selectedGround)} className="btn-secondary text-xs py-2">
                            ✏️ Edit Details
                          </button>
                          <button onClick={() => handleDeleteGround(selectedGround._id)} className="btn-danger text-xs py-2">
                            🗑️ Delete
                          </button>
                        </div>
                      </div>

                      <div className="revenue-card mb-4">
                        <p className="text-xs text-gray-600 uppercase tracking-wider mb-3">Revenue Breakdown</p>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-500">Price per Hour</span>
                          <span className="text-gray-900 dark:text-white font-semibold">₹{selectedGround.pricePerHour}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-500">Slots Booked</span>
                          <span className="text-gray-900 dark:text-white font-semibold">{selectedGround.slots?.filter(s => s.isBooked).length || 0}</span>
                        </div>
                        <div className="w-full h-px bg-black/5 dark:bg-white/5 my-2" />
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Est. Revenue</span>
                          <span className="text-green-400 font-bold">
                            ₹{(selectedGround.slots?.filter(s => s.isBooked).length || 0) * selectedGround.pricePerHour}
                          </span>
                        </div>
                      </div>

                      {selectedGround.amenities?.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-600 uppercase tracking-wider mb-2">Amenities</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedGround.amenities.map((a, i) => (
                              <span key={i} className="text-xs bg-black/3 dark:bg-white/3 border border-black/7 dark:border-white/7 text-gray-500 px-3 py-1 rounded-full">✓ {a}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="glass-card animate-cardIn">
                      <p className="text-xs text-gray-600 uppercase tracking-wider mb-3">All Slots</p>
                      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--glass-10, rgba(255,255,255,0.1)) transparent' }}>
                        {selectedGround.slots?.length === 0 ? (
                          <p className="text-gray-600 text-sm text-center py-4">No slots added yet</p>
                        ) : selectedGround.slots?.map((slot, i) => (
                          <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs ${slot.isBooked ? 'bg-red-400/5 border border-red-400/10' : 'bg-green-400/5 border border-green-400/10'}`}>
                            <span className="text-gray-600 dark:text-gray-400">📅 {slot.date} · {slot.startTime} — {slot.endTime}</span>
                            <span className={slot.isBooked ? 'text-red-400' : 'text-green-400'}>
                              {slot.isBooked ? '🔴 Booked' : '🟢 Free'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="glass-card text-center py-16 animate-cardIn">
                    <span className="text-5xl block mb-4">👈</span>
                    <p className="text-gray-500">Select a ground from the left to view details</p>
                  </div>
                )}
              </div>
            )}

            {/* BOOKINGS TAB */}
            {activeTab === 'bookings' && (
              <div className="glass-card animate-cardIn">
                <h3 className="font-bebas text-xl text-gray-900 dark:text-white mb-4">
                  {selectedGround ? `BOOKINGS — ${selectedGround.name}` : 'SELECT A GROUND'}
                </h3>
                {!selectedGround ? (
                  <div className="text-center py-10">
                    <span className="text-4xl block mb-3">👈</span>
                    <p className="text-gray-500 text-sm">Click a ground on the left to view its bookings</p>
                  </div>
                ) : groundBookings.length === 0 ? (
                  <div className="text-center py-10">
                    <span className="text-4xl block mb-3">📅</span>
                    <p className="text-gray-500 text-sm">No bookings yet for this ground</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {groundBookings.map((booking, i) => {
                      const badge = getStatusBadge(booking.status);
                      return (
                        <div key={booking._id} className="booking-card animate-cardIn" style={{ animationDelay: `${i * 0.05}s` }}>
                          <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                            <div>
                              <p className="text-gray-900 dark:text-white font-semibold text-sm">{booking.player?.name}</p>
                              <p className="text-gray-600 text-xs">📞 {booking.player?.phone}</p>
                            </div>
                            <span className={`status-badge ${badge.color}`}>{badge.label}</span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-xs mb-2">
                            📅 {booking.date} · 🕐 {booking.startTime} — {booking.endTime}
                          </p>
                          <div className="flex gap-4 text-xs pt-2 border-t border-black/5 dark:border-white/5">
                            <div>
                              <span className="text-gray-600">Total </span>
                              <span className="text-gray-900 dark:text-white font-semibold">₹{booking.totalPrice}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Advance </span>
                              <span className="text-green-400 font-semibold">₹{booking.advancePrice}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Remaining </span>
                              <span className="text-orange-400 font-semibold">₹{booking.remainingPrice}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ADD SLOTS TAB */}
            {activeTab === 'slots' && (
              <div className="glass-card animate-cardIn">
                <h3 className="font-bebas text-xl text-gray-900 dark:text-white mb-1">ADD SLOT</h3>
                <p className="text-gray-600 text-sm mb-6">
                  {selectedGround ? `Adding to: ${selectedGround.name}` : 'Select a ground first from the left'}
                </p>
                {!selectedGround ? (
                  <div className="text-center py-10">
                    <span className="text-4xl block mb-3">👈</span>
                    <p className="text-gray-500 text-sm">Click a ground to select it, then add slots</p>
                  </div>
                ) : (
                  <form onSubmit={handleAddSlot} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="label">Date</label>
                        <input type="date" value={slotForm.date}
                          onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })}
                          required className="input-field" />
                      </div>
                      <div>
                        <label className="label">Start Time</label>
                        <input type="time" value={slotForm.startTime}
                          onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                          required className="input-field" />
                      </div>
                      <div>
                        <label className="label">End Time</label>
                        <input type="time" value={slotForm.endTime}
                          onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                          required className="input-field" />
                      </div>
                    </div>
                    <button type="submit" className="btn-primary flex items-center justify-center gap-2">
                      ➕ Add Slot to {selectedGround.name}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* CREATE GROUND TAB */}
            {activeTab === 'create' && (
              <div className="glass-card animate-cardIn">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bebas text-xl text-gray-900 dark:text-white">{isEditing ? 'EDIT GROUND DETAILS' : 'CREATE NEW GROUND'}</h3>
                  {isEditing && (
                    <button onClick={() => { setIsEditing(false); setEditingGroundId(null); setGroundForm({ name: '', sport: 'cricket', address: '', pricePerHour: '', amenities: '', coordinates: [], isSocial: false }); setActiveTab('grounds'); }} className="text-gray-500 hover:text-red-500 text-xs transition-colors">
                      Cancel Edit ✕
                    </button>
                  )}
                </div>
                <form onSubmit={handleCreateGround} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Ground Name</label>
                      <input type="text" value={groundForm.name}
                        onChange={(e) => setGroundForm({ ...groundForm, name: e.target.value })}
                        placeholder="Punjab Cricket Ground" required className="input-field" />
                    </div>
                    <div>
                      <label className="label">Sport</label>
                      <select value={groundForm.sport}
                        onChange={(e) => setGroundForm({ ...groundForm, sport: e.target.value })}
                        className="input-field">
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
                      <label className="label">Price per Hour (₹)</label>
                      <input type="number" value={groundForm.pricePerHour}
                        onChange={(e) => setGroundForm({ ...groundForm, pricePerHour: e.target.value })}
                        placeholder="500" required={!groundForm.isSocial} disabled={groundForm.isSocial} className="input-field" />
                      <div className="mt-2 flex items-center gap-2">
                        <input type="checkbox" id="isSocial" checked={groundForm.isSocial} 
                          onChange={(e) => setGroundForm({ ...groundForm, isSocial: e.target.checked, pricePerHour: e.target.checked ? 0 : groundForm.pricePerHour })} 
                          className="w-4 h-4 rounded border-gray-300 bg-black/10 dark:bg-white/10 accent-yellow-400" />
                        <label htmlFor="isSocial" className="text-sm text-yellow-500 font-semibold cursor-pointer">Mark as Social Ground (Free)</label>
                      </div>
                    </div>
                    <div>
                      <label className="label">Address</label>
                      <input type="text" value={groundForm.address}
                        onChange={(e) => setGroundForm({ ...groundForm, address: e.target.value })}
                        placeholder="Sector 22, Chandigarh" required className="input-field" />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Amenities</label>
                    <div className="bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 flex flex-wrap gap-2 focus-within:border-green-400 focus-within:ring-1 focus-within:ring-green-400 transition-colors">
                      {groundForm.amenities.map((amenity, idx) => (
                        <span key={idx} className="bg-green-400/10 text-green-500 border border-green-400/20 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2">
                          {amenity}
                          <button type="button" onClick={() => handleRemoveAmenity(amenity)} className="hover:text-red-400 transition-colors">✕</button>
                        </span>
                      ))}
                      <input 
                        type="text" 
                        value={amenityInput}
                        onChange={(e) => setAmenityInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddAmenity(amenityInput);
                          }
                        }}
                        placeholder={groundForm.amenities.length === 0 ? "Type an amenity & hit Enter" : "Add more..."}
                        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-xs text-gray-500 py-1">Suggestions:</span>
                      {PRESET_AMENITIES.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddAmenity(preset)}
                          disabled={groundForm.amenities.includes(preset)}
                          className="text-xs bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 items-center">
                    <button type="button" onClick={handleDetectLocation} className="btn-secondary flex items-center gap-2">
                      📍 {groundForm.coordinates.length > 0 ? 'Location Set ✅' : 'Choose Base Location on Map'}
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                      {loading ? (
                        <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> {isEditing ? 'Updating...' : 'Creating...'}</>
                      ) : (isEditing ? '💾 Save Changes' : '🏟️ Create Ground')}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroundOwnerDashboard;