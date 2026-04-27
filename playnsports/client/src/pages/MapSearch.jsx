import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const getPlayerIcon = (gender) => {
  const isGirl = gender && gender.toLowerCase() === 'female';
  const emoji = isGirl ? '👩🏻' : '👦🏻';
  const bgColor = isGirl ? '#ec4899' : '#ef4444'; // Pink for girl, Red for boy
  
  return new L.DivIcon({
    html: `<div style="
      position: relative;
      width: 36px;
      height: 36px;
      background: ${bgColor};
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 2px 2px 8px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="transform: rotate(45deg); font-size: 18px;">${emoji}</div>
    </div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

const groundIcon = new L.DivIcon({
  html: `<div style="
    position: relative;
    width: 36px;
    height: 36px;
    background: #3b82f6;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 2px solid white;
    box-shadow: 2px 2px 8px rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    <div style="transform: rotate(45deg); font-size: 18px;">🏟️</div>
  </div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
});

const socialGroundIcon = new L.DivIcon({
  html: `<div style="
    position: relative;
    width: 36px;
    height: 36px;
    background: #eab308;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 2px solid white;
    box-shadow: 2px 2px 8px rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    <div style="transform: rotate(45deg); font-size: 18px;">✨</div>
  </div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
});

const userIcon = new L.DivIcon({
  html: `<div style="position:relative;width:24px;height:24px">
    <div style="position:absolute;inset:0;background:#4ade80;border-radius:50%;animation:pulse-dot 2s ease-in-out infinite;opacity:0.3"></div>
    <div style="position:absolute;inset:4px;background:#4ade80;border-radius:50%;border:3px solid #060606;box-shadow:0 0 12px rgba(74,222,128,0.6)"></div>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  className: '',
});

// India bounding box
const INDIA_BOUNDS = L.latLngBounds(
  L.latLng(6.5, 68.0),   // SW corner
  L.latLng(37.5, 97.5)   // NE corner
);

// Distance calculator (Haversine)
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`;
};

// Map controller component
const MapController = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    // if (position) {
    //   map.flyTo(position, 15, { duration: 1.5 });
    // }
    map.setMaxBounds(INDIA_BOUNDS);
    map.setMinZoom(5);
    map.setMaxZoom(18);
    map.options.maxBoundsViscosity = 1.0;
  }, [map]);
  return null;
};

// Recenter button component
const RecenterButton = ({ position }) => {
  const map = useMap();
  return (
    <button
      onClick={() => map.flyTo(position, 14, { duration: 1 })}
      className="recenter-btn text-green-400"
      title="Recenter to your location"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v3" />
        <path d="M12 19v3" />
        <path d="M2 12h3" />
        <path d="M19 12h3" />
      </svg>
    </button>
  );
};

const getAreaName = async (lat, lng) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&email=spotnplay.app@gmail.com`);
    const data = await res.json();
    const addr = data.address;
    return addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city || addr.county || 'Unknown Area';
  } catch {
    return 'Unknown Area';
  }
};

const FitBoundsToMarkers = ({ players, grounds, socialgrounds, position, shouldFit }) => {
  const map = useMap();
  useEffect(() => {
    if (!shouldFit) return;
    const points = [];
    if (position) points.push(position);
    players.forEach(p => points.push([p.location.coordinates[1], p.location.coordinates[0]]));
    grounds.forEach(g => points.push([g.location.coordinates[1], g.location.coordinates[0]]));
    socialgrounds.forEach(g => points.push([g.location.coordinates[1], g.location.coordinates[0]]));
    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [50, 50], maxZoom: 15 });
    }
  }, [players, grounds, socialgrounds, shouldFit]);
  return null;
};

const MapSearch = () => {
  const { user } = useAuth();
  const [position, setPosition] = useState(null);
  const [players, setPlayers] = useState([]);
  const [grounds, setGrounds] = useState([]);
  const [socialgrounds, setSocialGrounds] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [playerAreas, setPlayerAreas] = useState({});
  const [sport, setSport] = useState('');
  const [skillLevel, setSkillLevel] = useState('');
  const [radius, setRadius] = useState(1000);
  const [activeTab, setActiveTab] = useState('players');
  const [loading, setLoading] = useState(false);
  const [inviteStatus, setInviteStatus] = useState({});
  const [searched, setSearched] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [shouldFitBounds, setShouldFitBounds] = useState(false);
  const [searchedPosition, setSearchedPosition] = useState(null);
  const hasUserChangedFilters = useRef(false);
  const navigate = useNavigate();

  const[isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
  const observer = new MutationObserver(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
      .font-bebas { font-family: 'Bebas Neue', cursive !important; }

      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes shimmer {
        from { background-position: -200% center; }
        to { background-position: 200% center; }
      }
      @keyframes pulse-dot {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
      @keyframes slideRight {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes cardIn {
        from { opacity: 0; transform: translateY(16px) scale(0.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      .animate-fadeUp-1 { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.05s forwards; opacity: 0; }
      .animate-fadeUp-2 { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.15s forwards; opacity: 0; }
      .animate-fadeUp-3 { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.25s forwards; opacity: 0; }
      .animate-fadeIn { animation: fadeIn 0.5s ease forwards; }
      .animate-cardIn { animation: cardIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }

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

      .map-container .leaflet-container {
        background: var(--bg-surface) !important;
        border-radius: 20px;
      }

      .dark .map-container .leaflet-container { background: #1a1a1a !important; }
      .map-container .leaflet-container { background: #f0f0f0 !important; }

      .leaflet-tile {
        /* dark tiles are native, no filter needed */
      }

      .recenter-btn {
        position: absolute;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        width: 40px;
        height: 40px;
        background: rgba(0,0,0,0.7);
        border: 1px solid rgba(74,222,128,0.3);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        cursor: pointer;
        transition: all 0.2s ease;
        backdrop-filter: blur(8px);
      }
      .recenter-btn:hover {
        background: rgba(74,222,128,0.15);
        border-color: rgba(74,222,128,0.5);
        transform: scale(1.08);
      }

      .map-legend {
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 1000;
  background: rgba(255,255,255,0.9);  /* light mode */
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 12px;
  padding: 10px 14px;
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dark .map-legend {
  background: rgba(0,0,0,0.75);
  border: 1px solid rgba(255,255,255,0.08);
}

.map-legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #374151;  /* dark text for light mode */
}

.dark .map-legend-item {
  color: #9ca3af;  /* muted for dark mode */
}

      .dist-badge {
        font-size: 10px;
        background: rgba(74,222,128,0.08);
        border: 1px solid rgba(74,222,128,0.15);
        color: #4ade80;
        padding: 2px 7px;
        border-radius: 6px;
        font-weight: 600;
        white-space: nowrap;
      }

      .filter-panel {
        background: var(--glass-02, rgba(255,255,255,0.02));
        border: 1px solid var(--glass-06, rgba(255,255,255,0.06));
        border-radius: 20px;
        padding: 20px;
        backdrop-blur: 20px;
      }

      .select-field {
        background: var(--glass-04, rgba(255,255,255,0.04));
        border: 1px solid var(--glass-08, rgba(255,255,255,0.08));
        border-radius: 12px;
        padding: 11px 14px;
        color: var(--text-main);
        font-size: 14px;
        outline: none;
        transition: all 0.3s ease;
        cursor: pointer;
        appearance: none;
        font-family: 'DM Sans', sans-serif;
      }
      .select-field:focus, .select-field:hover {
        border-color: rgba(74,222,128,0.4);
        background: var(--glass-06, rgba(255,255,255,0.06));
      }
      .select-field option { background: var(--bg-surface); }

      .search-btn {
        background: linear-gradient(135deg, #4ade80, #22c55e);
        color: black;
        font-weight: 700;
        border-radius: 12px;
        padding: 11px 24px;
        font-size: 14px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        white-space: nowrap;
        font-family: 'DM Sans', sans-serif;
      }
      .search-btn::before {
        content: '';
        position: absolute;
        top: 0; left: -100%;
        width: 100%; height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        transition: left 0.4s ease;
      }
      .search-btn:hover::before { left: 100%; }
      .search-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(74,222,128,0.35); }
      .search-btn:disabled { opacity: 0.5; transform: none; box-shadow: none; }

      .tab-btn {
        flex: 1;
        padding: 10px;
        border-radius: 10px;
        font-size: 13px;
        font-weight: 600;
        transition: all 0.3s ease;
        font-family: 'DM Sans', sans-serif;
      }
      .tab-active {
        background: rgba(74,222,128,0.15);
        color: #4ade80;
        border: 1px solid rgba(74,222,128,0.25);
      }
      .tab-inactive {
        background: transparent;
        color: var(--text-muted);
        border: 1px solid transparent;
      }
      .tab-inactive:hover {
        color: var(--text-muted);
        border-color: var(--glass-08, rgba(255,255,255,0.08));
      }

      .player-card {
        background: var(--glass-02, rgba(255,255,255,0.02));
        border: 1px solid var(--glass-06, rgba(255,255,255,0.06));
        border-radius: 16px;
        padding: 14px;
        transition: all 0.3s ease;
        cursor: pointer;
      }
      .player-card:hover {
        background: var(--glass-04, rgba(255,255,255,0.04));
        border-color: rgba(74,222,128,0.2);
        transform: translateX(3px);
      }

      .ground-card {
        background: var(--glass-02, rgba(255,255,255,0.02));
        border: 1px solid var(--glass-06, rgba(255,255,255,0.06));
        border-radius: 16px;
        padding: 14px;
        transition: all 0.3s ease;
        cursor: pointer;
      }
      .ground-card:hover {
        background: var(--glass-04, rgba(255,255,255,0.04));
        border-color: rgba(74,222,128,0.2);
        transform: translateX(3px);
      }

      .invite-btn {
        background: rgba(74,222,128,0.08);
        border: 1px solid rgba(74,222,128,0.2);
        color: #4ade80;
        font-size: 11px;
        font-weight: 600;
        border-radius: 8px;
        padding: 5px 10px;
        transition: all 0.2s ease;
        font-family: 'DM Sans', sans-serif;
      }
      .invite-btn:hover {
        background: rgba(74,222,128,0.15);
        border-color: rgba(74,222,128,0.4);
      }
      .invite-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .skill-badge {
        font-size: 10px;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: 100px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .skill-beginner { background: rgba(234,179,8,0.1); color: #eab308; border: 1px solid rgba(234,179,8,0.2); }
      .skill-intermediate { background: rgba(59,130,246,0.1); color: #3b82f6; border: 1px solid rgba(59,130,246,0.2); }
      .skill-advanced { background: rgba(74,222,128,0.1); color: #4ade80; border: 1px solid rgba(74,222,128,0.2); }

      .range-slider {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 6px;
        background: var(--glass-08, rgba(255,255,255,0.08));
        border-radius: 3px;
        outline: none;
        transition: background 0.3s ease;
        cursor: pointer;
      }
      .range-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        background: linear-gradient(135deg, #4ade80, #22c55e);
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(74,222,128,0.4);
        transition: transform 0.2s ease;
      }
      .range-slider::-webkit-slider-thumb:hover {
        transform: scale(1.15);
      }
      .range-slider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        background: linear-gradient(135deg, #4ade80, #22c55e);
        border-radius: 50%;
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 8px rgba(74,222,128,0.4);
      }

      .stat-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: var(--glass-05);
        border: 1px solid var(--glass-06, rgba(255,255,255,0.06));
        border-radius: 100px;
        padding: 4px 10px;
        font-size: 12px;
        color: var(--text-muted);
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 200px;
        gap: 12px;
        color: var(--text-muted);
      }

      .leaflet-popup-content-wrapper {
        background: var(--bg-surface) !important;
        border: 1px solid var(--glass-10, rgba(255,255,255,0.1)) !important;
        border-radius: 14px !important;
        box-shadow: 0 20px 60px rgba(0,0,0,0.8) !important;
        color: var(--text-main) !important;
      }
      .leaflet-popup-tip { background: var(--bg-surface) !important; }
      .leaflet-popup-close-button { color: rgba(255,255,255,0.4) !important; }
      .leaflet-popup-close-button:hover { color: var(--text-main) !important; }

      @keyframes dashAnim {
        0% { stroke-dashoffset: 100; }
        100% { stroke-dashoffset: 0; }
      }
      @keyframes pulsePath {
        0%, 100% { filter: drop-shadow(0 0 8px rgba(74,222,128,0.5)); opacity: 0.8; }
        50% { filter: drop-shadow(0 0 16px rgba(74,222,128,1)); opacity: 1; }
      }
      .animated-path {
        stroke-dasharray: 12 16;
        stroke-linecap: round;
        stroke-linejoin: round;
        animation: dashAnim 1s linear infinite, pulsePath 2s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setPosition([pos.coords.latitude, pos.coords.longitude]);
    });
    if (user?.role === 'player') fetchMyGroups();
  }, []);

  // Load ALL players & grounds when position is first available
  useEffect(() => {
    if (position && !initialLoaded) {
      setInitialLoaded(true);
      handleInitialLoad();
    }
  }, [position]);

  // Re-search with radius filter when user changes filters
  // useEffect(() => {
  //   if (position && initialLoaded && hasUserChangedFilters.current) {
  //     handleSearch();
  //   }
  // }, [sport, skillLevel, radius]);

  const fetchMyGroups = async () => {
    try {
      const { data } = await API.get('/groups/my');
      setMyGroups(data.filter((g) => g.isOpen && g.createdBy._id === user._id));
    } catch {
      setMyGroups([]);
    }
  };

  // Initial load: fetch ALL players & grounds (no radius filter)
  
const handleInitialLoad = async () => {
  // Don't setLoading(true) here — silent background fetch
  try {
    const [playersRes, groundsRes] = await Promise.all([
      API.get(`/players/all`),
      API.get(`/grounds/all`),
    ]);
    setPlayers(playersRes.data);
    const allGrounds = groundsRes.data;
    setGrounds(allGrounds.filter(g => !g.isSocial));
    setSocialGrounds(allGrounds.filter(g => g.isSocial));
    setSearched(true);
    // fetch areas...
    const areas = {};
    await Promise.all(
      playersRes.data.map(async (player) => {
        const lat = player.location.coordinates[1];
        const lng = player.location.coordinates[0];
        areas[player._id] = await getAreaName(lat, lng);
      })
    );
    setPlayerAreas(areas);
  } catch {
    setPlayers([]);
    setGrounds([]);
  } finally{
    setLoading(false);
  }
};

  // Filtered search: use nearby endpoints with radius
  const handleSearch = async () => {
    if (!position) return;
    setLoading(true);
    try {
      let params = `longitude=${position[1]}&latitude=${position[0]}&radius=${radius}`;
      if (sport) params += `&sport=${sport}`;
      if (skillLevel) params += `&skillLevel=${skillLevel}`;
      const [playersRes, groundsRes] = await Promise.all([
        API.get(`/players/nearby?${params}`),
        API.get(`/grounds/nearby?${params}`),
      ]);
      setPlayers(playersRes.data);
      const allGrounds = groundsRes.data;
      setGrounds(allGrounds.filter(g => !g.isSocial));
      setSocialGrounds(allGrounds.filter(g => g.isSocial));
      setSearched(true);
      setSearchedPosition({center: position, radius});
      setShouldFitBounds(prev=>prev+1);

      const areas = {};
      await Promise.all(
        playersRes.data.map(async (player) => {
          const lat = player.location.coordinates[1];
          const lng = player.location.coordinates[0];
          areas[player._id] = await getAreaName(lat, lng);
        })
      );
      setPlayerAreas(areas);
    } catch {
      setPlayers([]);
      setGrounds([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (playerId, groupId) => {
    try {
      await API.post(`/groups/${groupId}/invite`, { userId: playerId });
      setInviteStatus(prev => ({ ...prev, [`${playerId}-${groupId}`]: 'sent' }));
    } catch (err) {
      setInviteStatus(prev => ({ ...prev, [`${playerId}-${groupId}`]: 'failed' }));
      const msg = err.response?.data?.message || 'Failed to send invite';
      alert(msg);
    }
  };

  const getSkillClass = (level) => {
    if (level === 'beginner') return 'skill-beginner';
    if (level === 'intermediate') return 'skill-intermediate';
    return 'skill-advanced';
  };

  const handleNavigate = async (destLat, destLng) => {
    if (!position) return;
    setIsNavigating(true);
    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${position[1]},${position[0]};${destLng},${destLat}?overview=full&geometries=geojson`);
      const data = await res.json();
      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
        setRouteData({
          coords,
          distance: route.distance,
          duration: route.duration
        });
      } else {
        alert("Could not find a route.");
      }
    } catch (error) {
      console.error("Routing error:", error);
      alert("Error fetching route.");
    } finally {
      setIsNavigating(false);
    }
  };
  <FitBoundsToMarkers players={players} grounds={grounds} socialgrounds={socialgrounds} position={position} shouldFit={shouldFitBounds} />  

  return (
    <div className="min-h-screen bg-[#fcfcfc] dark:bg-[#060606] text-gray-900 dark:text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="fixed inset-0 grid-dots pointer-events-none opacity-30" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[1px] bg-gradient-to-r from-transparent via-green-400/20 to-transparent pointer-events-none" />

      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-fadeUp-1 mb-6">
          <p className="text-green-400 text-xs uppercase tracking-[0.3em] mb-1">Live Map</p>
          <h1 className="font-bebas text-4xl md:text-5xl tracking-wide shimmer-text">
            FIND PLAYERS & GROUNDS
          </h1>
        </div>

        <div className="animate-fadeUp-2 filter-panel mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-600 uppercase tracking-wider">Sport</label>
              <select value={sport} onChange={(e) => { hasUserChangedFilters.current = true; setSport(e.target.value); }} className="select-field">
                <option value="">All Sports</option>
                <option value="football">⚽ Football</option>
                <option value="cricket">🏏 Cricket</option>
                <option value="box cricket">🏏 Box Cricket</option>
                <option value="box football">⚽ Box Football</option>
                <option value="boxing">🥊 Boxing</option>
                <option value="basketball">🏀 Basketball</option>
                <option value="tennis">🎾 Tennis</option>
                <option value="badminton">🏸 Badminton</option>
                <option value="volleyball">🏐 Volleyball</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-600 uppercase tracking-wider">Skill Level</label>
              <select value={skillLevel} onChange={(e) => { hasUserChangedFilters.current = true; setSkillLevel(e.target.value); }} className="select-field">
                <option value="">All Levels</option>
                <option value="beginner">🟡 Beginner</option>
                <option value="intermediate">🔵 Intermediate</option>
                <option value="advanced">🟢 Advanced</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5" style={{ minWidth: '200px', flex: '1' }}>
              <label className="text-xs text-gray-600 uppercase tracking-wider flex justify-between">
                <span>Distance</span>
                <span style={{ color: '#4ade80', fontWeight: 600 }}>{radius >= 1000 ? `${radius / 1000} km` : `${radius} m`}</span>
              </label>
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                value={radius}
                onChange={(e) => { hasUserChangedFilters.current = true; setRadius(Number(e.target.value)); }}
                className="range-slider"
                style={{
                  background: `linear-gradient(to right, #4ade80 0%, #4ade80 ${((radius - 1000) / 49000) * 100}%, var(--glass-08, rgba(255,255,255,0.08)) ${((radius - 1000) / 49000) * 100}%, var(--glass-08, rgba(255,255,255,0.08)) 100%)`
                }}
              />
              <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>1 km</span>
                <span>25 km</span>
                <span>50 km</span>
              </div>
            </div>

            <button onClick={() => { hasUserChangedFilters.current = true; handleSearch(); }} disabled={loading || !position} className="search-btn">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Searching...
                </span>
              ) : '🔍 Search Now'}
            </button>
          </div>

          {searched && (
            <div className="animate-fadeIn flex items-center gap-4 mt-4 pt-3" style={{ borderTop: '1px solid var(--glass-04, rgba(255,255,255,0.04))' }}>
              <div className="stat-chip">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                {players.length} Players
              </div>
              <div className="stat-chip">
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                {grounds.length} Grounds
              </div>
              <div className="stat-chip">
                <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                {socialgrounds.length} Social
              </div>
              {(sport || skillLevel) && (
                <button
                  onClick={() => { setSport(''); setSkillLevel(''); }}
                  style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--glass-04, rgba(255,255,255,0.04))', border: '1px solid var(--glass-06, rgba(255,255,255,0.06))', borderRadius: '8px', padding: '4px 12px', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  ✕ Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        <div className="animate-fadeUp-3 grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 map-container rounded-3xl overflow-hidden border border-black/6 dark:border-white/6" style={{ height: '560px', position: 'relative' }}>
            {position ? (
              <MapContainer
                center={[20.5937, 78.9629]} // Center of India
                zoom={5}
                style={{ height: '100%', width: '100%' }}
                maxBounds={INDIA_BOUNDS}
                maxBoundsViscosity={1.0}
                minZoom={5}
                maxZoom={18}
              >
                <MapController position={position} />
                <RecenterButton position={position} />

                {routeData && (
                  <div
                    style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', border: '1px solid var(--glass-10, rgba(255,255,255,0.1))', color: 'white', padding: '12px 20px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.6)', whiteSpace: 'nowrap' }}
                  >
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-[10px] uppercase tracking-wider font-bold mb-0.5">Distance</span>
                      <span className="text-green-400 font-bebas text-xl tracking-wide leading-none">{routeData.distance >= 1000 ? (routeData.distance / 1000).toFixed(1) + ' km' : Math.round(routeData.distance) + ' m'}</span>
                    </div>
                    <div className="w-[1px] h-8 bg-white/10" />
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-[10px] uppercase tracking-wider font-bold mb-0.5">Est. Time</span>
                      <span className="text-blue-400 font-bebas text-xl tracking-wide leading-none">{routeData.duration >= 3600 ? Math.floor(routeData.duration / 3600) + 'h ' + Math.round((routeData.duration % 3600) / 60) + 'm' : Math.round(routeData.duration / 60) + ' min'}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setRouteData(null); }}
                      style={{ marginLeft: '4px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', width: '32px', height: '32px', cursor: 'pointer' }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                      title="Stop Navigation"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                )}

                <TileLayer
                  key={isDark ? 'dark' : 'light'}
                  url={
                    isDark
                      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  }
                  attribution=''
                />

                {routeData && (
                  <Polyline
                    positions={routeData.coords}
                    pathOptions={{ color: '#4ade80', weight: 6, lineCap: 'round', lineJoin: 'round', className: 'animated-path' }}
                  />
                )}

                <Marker position={position} icon={userIcon}>
                  <Popup>
                    <div style={{ color: 'var(--text-main)', fontSize: '13px' }}>
                      <strong>📍 You are here</strong>
                      <p style={{ color: '#4ade80', margin: '4px 0 0' }}>{user?.name}</p>
                    </div>
                  </Popup>
                </Marker>

                <Circle
                  center={position}
                  radius={radius}
                  pathOptions={{ color: '#4ade80', fillColor: '#4ade80', fillOpacity: 0.04, weight: 1, dashArray: '6' }}
                />

                {players.map((player) => {
                  const lat = player.location.coordinates[1];
                  const lng = player.location.coordinates[0];
                  const area = playerAreas[player._id] || '';
                  const dist = getDistance(position[0], position[1], lat, lng);
                  return (
                    <React.Fragment key={player._id}>
                      <Circle
                        center={[lat, lng]}
                        radius={120}
                        pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.12, weight: 1.5 }}
                      />
                      <Marker position={[lat, lng]} icon={getPlayerIcon(player.user?.gender)}>
                        <Popup>
                          <div style={{ color: 'var(--text-main)', fontSize: '13px', minWidth: '160px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                              {player.user?.avatar ? (
                                <img src={player.user.avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #4ade80' }} />
                              ) : (
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(74,222,128,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#4ade80', fontWeight: 'bold' }}>
                                  {player.user?.name?.charAt(0)}
                                </div>
                              )}
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{player.user?.name}</div>
                                {area && <div style={{ fontSize: '11px', color: '#6b7280' }}>📍 {area}</div>}
                              </div>
                              <span className="dist-badge" style={{ marginLeft: 'auto' }}>{dist}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                              <span style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80', fontSize: '11px', padding: '2px 8px', borderRadius: '100px' }}>
                                {player.sport}
                              </span>
                              <span style={{ background: 'var(--glass-05, rgba(255,255,255,0.05))', border: '1px solid var(--glass-10, rgba(255,255,255,0.1))', color: '#9ca3af', fontSize: '11px', padding: '2px 8px', borderRadius: '100px' }}>
                                {player.skillLevel}
                              </span>
                            </div>
                            {player.bio && <p style={{ color: '#6b7280', fontSize: '11px', margin: '4px 0' }}>{player.bio}</p>}
                            <p style={{ color: '#9ca3af', fontSize: '12px' }}>📞 {player.user?.phone}</p>
                            
                            {user?.role === 'player' && player.user?._id !== user._id && myGroups.length > 0 && (
                              <div style={{ marginTop: '8px' }}>
                                {myGroups.map((group) => {
                                  // Check if already a member
                                  const isMember = group.members.some(m =>
                                    (m._id && m._id === player.user._id) || m === player.user._id
                                  );

                                  // Check if already invited (server-side)
                                  const isAlreadyInvited = group.invitations?.some(
                                    inv => inv.user === player.user._id || (inv.user?._id === player.user._id)
                                  );

                                  // Check local state
                                  const localStatus = inviteStatus[`${player.user._id}-${group._id}`];
                                  const disableInvite = isMember || isAlreadyInvited || localStatus === 'sent';

                                  let btnText = `Invite to ${group.name}`;
                                  if (isMember) btnText = '🤝 Already in Group';
                                  else if (isAlreadyInvited || localStatus === 'sent') btnText = '✅ Invited';
                                  else if (localStatus === 'failed') btnText = '❌ Retry Invite';

                                  return (
                                    <button
                                      key={group._id}
                                      onClick={() => handleInvite(player.user._id, group._id)}
                                      disabled={disableInvite}
                                      style={{
                                        width: '100%', marginTop: '4px',
                                        background: disableInvite ? 'var(--glass-05, rgba(255,255,255,0.05))' : 'rgba(74,222,128,0.15)',
                                        border: '1px solid rgba(74,222,128,0.3)',
                                        color: disableInvite ? '#6b7280' : '#4ade80',
                                        fontSize: '12px', fontWeight: 600,
                                        padding: '6px 10px', borderRadius: '8px',
                                        cursor: disableInvite ? 'not-allowed' : 'pointer',
                                      }}
                                    >
                                      {btnText}
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {user?._id !== player.user?._id && (
                              <button
                                onClick={async () => {
                                  try {
                                    const { data } = await API.post('/chat/direct', { userId: player.user._id });
                                    navigate(`/chat/${data._id}`);
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }}
                                className="invite-btn w-full mt-1"
                                style={{ color: '#4ade80' }}
                              >
                                💬 Message
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleNavigate(lat, lng)}
                              className="invite-btn w-full mt-1"
                              style={{ color: '#3b82f6', background: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.2)' }}
                            >
                              {isNavigating ? '⏳ Calculating...' : '🗺️ Navigate'}
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    </React.Fragment>
                  );
                })}

                {socialgrounds.map((ground) => {
                  const gLat = ground.location.coordinates[1];
                  const gLng = ground.location.coordinates[0];
                  const dist = getDistance(position[0], position[1], gLat, gLng);
                  return (
                    <Marker
                      key={ground._id}
                      position={[gLat, gLng]}
                      icon={socialGroundIcon}
                    >
                      <Popup>
                        <div style={{ color: 'var(--text-main)', fontSize: '13px', minWidth: '160px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <div style={{ fontWeight: 700, fontSize: '15px' }}>{ground.name}</div>
                            <span className="dist-badge" style={{ color: '#eab308', borderColor: 'rgba(234,179,8,0.2)', background: 'rgba(234,179,8,0.1)' }}>{dist}</span>
                          </div>
                          <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '6px' }}>📍 {ground.address}</div>
                          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                            <span style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)', color: '#eab308', fontSize: '11px', padding: '2px 8px', borderRadius: '100px' }}>
                              ✨ Social Ground
                            </span>
                            <span style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa', fontSize: '11px', padding: '2px 8px', borderRadius: '100px' }}>
                              {ground.sport}
                            </span>
                          </div>
                          <div style={{ color: '#eab308', fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>Free to Book</div>
                          <button
                            onClick={() => navigate(`/grounds/${ground._id}`)}
                            style={{
                              width: '100%', background: 'linear-gradient(135deg, #facc15, #eab308)',
                              color: 'black', fontWeight: 700, fontSize: '12px',
                              padding: '8px', borderRadius: '8px', cursor: 'pointer',
                            }}
                          >
                            View & Book Free →
                          </button>
                          
                          <button
                            onClick={() => handleNavigate(gLat, gLng)}
                            style={{
                              width: '100%', marginTop: '6px', background: 'var(--glass-05, rgba(255,255,255,0.05))',
                              border: '1px solid rgba(234,179,8,0.3)', color: '#facc15', fontWeight: 700, fontSize: '12px',
                              padding: '8px', borderRadius: '8px', cursor: 'pointer',
                            }}
                          >
                            {isNavigating ? '⏳ Calculating...' : '🗺️ Navigate'}
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

                {grounds.map((ground) => {
                  const gLat = ground.location.coordinates[1];
                  const gLng = ground.location.coordinates[0];
                  const dist = getDistance(position[0], position[1], gLat, gLng);
                  return (
                    <Marker
                      key={ground._id}
                      position={[gLat, gLng]}
                      icon={groundIcon}
                    >
                      <Popup>
                        <div style={{ color: 'var(--text-main)', fontSize: '13px', minWidth: '160px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <div style={{ fontWeight: 700, fontSize: '15px' }}>{ground.name}</div>
                            <span className="dist-badge">{dist}</span>
                          </div>
                          <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '6px' }}>📍 {ground.address}</div>
                          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                            <span style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa', fontSize: '11px', padding: '2px 8px', borderRadius: '100px' }}>
                              {ground.sport}
                            </span>
                          </div>
                          <div style={{ color: '#4ade80', fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>₹{ground.pricePerHour}/hr</div>
                          <button
                            onClick={() => navigate(`/grounds/${ground._id}`)}
                            style={{
                              width: '100%', background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                              color: 'black', fontWeight: 700, fontSize: '12px',
                              padding: '8px', borderRadius: '8px', cursor: 'pointer',
                            }}
                          >
                            View & Book →
                          </button>

                          <button
                            onClick={() => handleNavigate(gLat, gLng)}
                            style={{
                              width: '100%', marginTop: '6px', background: 'var(--glass-05, rgba(255,255,255,0.05))',
                              border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', fontWeight: 700, fontSize: '12px',
                              padding: '8px', borderRadius: '8px', cursor: 'pointer',
                            }}
                          >
                            {isNavigating ? '⏳ Calculating...' : '🗺️ Navigate'}
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

                {/* Map legend */}
                <div className="map-legend">
                  <div className="map-legend-item">
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px rgba(74,222,128,0.5)', flexShrink: 0 }} />
                    You
                  </div>
                  <div className="map-legend-item">
                    <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#ef4444', flexShrink: 0 }} />
                    Players ({players.length})
                  </div>
                  <div className="map-legend-item">
                    <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#3b82f6', flexShrink: 0 }} />
                    Grounds ({grounds.length})
                  </div>
                  <div className="map-legend-item">
                    <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#eab308', flexShrink: 0 }} />
                    Social Grounds ({socialgrounds.length})
                  </div>
                  <div className="map-legend-item">
                    <span style={{ 
                      width: '10px', height: '10px', borderRadius: '50%', 
                      border: `1px dashed #4ade80`, flexShrink: 0 
                    }} />
                    {radius >= 1000 ? `${radius / 1000} km` : `${radius} m`} range
                  </div>
                </div>
              </MapContainer>
            ) : (
              <div className="h-full bg-black/2 dark:bg-white/2 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                <p className="text-gray-600 text-sm">Getting your location...</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3" style={{ height: '560px' }}>
            <div className="flex gap-2">
              <button onClick={() => setActiveTab('players')} className={`tab-btn ${activeTab === 'players' ? 'tab-active' : 'tab-inactive'}`}>
                🟢 Players {searched && `(${players.length})`}
              </button>
              <button onClick={() => setActiveTab('grounds')} className={`tab-btn ${activeTab === 'grounds' ? 'tab-active' : 'tab-inactive'}`}>
                🔵 Grounds {searched && `(${grounds.length})`}
              </button>

              <button onClick={() => setActiveTab('social-grounds')} className={`tab-btn ${activeTab === 'social-grounds' ? 'tab-active' : 'tab-inactive'}`}>
                🟡 Social {searched && `(${socialgrounds.length})`}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--glass-10, rgba(255,255,255,0.1)) transparent' }}>
              {activeTab === 'players' && (
                <>
                  {!searched ? (
                    <div className="empty-state">
                      <span className="text-4xl">🗺️</span>
                      <p className="text-sm">Search to find nearby players</p>
                    </div>
                  ) : players.length === 0 ? (
                    <div className="empty-state">
                      <span className="text-4xl">😕</span>
                      <p className="text-sm">No players found in this area</p>
                      <p className="text-xs opacity-60">Try increasing the radius</p>
                    </div>
                  ) : (
                    players.map((player, i) => (
                      <div key={player._id} className="player-card animate-cardIn" style={{ animationDelay: `${i * 0.05}s` }}>
                        <div className="flex items-center gap-3 mb-2">
                          {player.user?.avatar ? (
                            <img src={player.user.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-green-400/30 flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-green-400/10 border border-green-400/20 flex items-center justify-center text-green-400 font-bold flex-shrink-0">
                              {player.user?.name?.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{player.user?.name}</p>
                            {playerAreas[player._id] && (
                              <p className="text-gray-600 text-xs truncate">📍 {playerAreas[player._id]}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="dist-badge">{position ? getDistance(position[0], position[1], player.location.coordinates[1], player.location.coordinates[0]) : ''}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-2">
                          <span className="text-xs bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/8 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full capitalize">⚽ {player.sport}</span>
                          <span className={`skill-badge ${getSkillClass(player.skillLevel)}`}>{player.skillLevel}</span>
                        </div>

                        {player.bio && <p className="text-gray-600 text-xs mb-2 line-clamp-1">{player.bio}</p>}
                        <p className="text-gray-600 text-xs mb-2">📞 {player.user?.phone}</p>

                        {user?.role === 'player' && player.user?._id !== user._id && myGroups.length > 0 && (
  <div className="flex flex-col gap-1">
    {myGroups.map((group) => {
      // Check if already a member
      const isMember = group.members.some(m =>
        (m._id && m._id === player.user._id) || m === player.user._id
      );

      // Check if already invited (server-side)
      const isAlreadyInvited = group.invitations?.some(
        inv => inv.user === player.user._id || (inv.user?._id === player.user._id)
      );

      // Check local state
      const localStatus = inviteStatus[`${player.user._id}-${group._id}`];
      const disableInvite = isMember || isAlreadyInvited || localStatus === 'sent';

      let btnText = `+ Invite to ${group.name}`;
      if (isMember) btnText = '🤝 Already in Group';
      else if (isAlreadyInvited || localStatus === 'sent') btnText = '✅ Invited';
      else if (localStatus === 'failed') btnText = '❌ Retry Invite';

      return (
        <button
          key={group._id}
          onClick={() => handleInvite(player.user._id, group._id)}
          disabled={disableInvite}
          className="invite-btn"
          style={{
            background: disableInvite ? 'var(--glass-05, rgba(255,255,255,0.05))' : 'rgba(74,222,128,0.08)',
            color: disableInvite ? '#6b7280' : '#4ade80',
            cursor: disableInvite ? 'not-allowed' : 'pointer',
            borderColor: disableInvite ? 'var(--glass-08, rgba(255,255,255,0.08))' : 'rgba(74,222,128,0.2)',
          }}
        >
          {btnText}
        </button>
      );
    })}
  </div>
)}

{/* Message Button — always show for other players */}
{player.user?._id !== user?._id && (
  <button
    onClick={async () => {
      try {
        const { data } = await API.post('/chat/direct', { userId: player.user._id });
        navigate(`/chat/${data._id}`);
      } catch (err) {
        console.error(err);
      }
    }}
    className="invite-btn w-full mt-1"
    style={{ color: '#4ade80', marginTop: '6px' }}
  >
    💬 Message
  </button>
)}
                      </div>
                    ))
                  )}
                </>
              )}

              {activeTab === 'social-grounds' && (
                <>
                  {!searched ? (
                    <div className="empty-state">
                      <span className="text-4xl">✨</span>
                      <p className="text-sm">Search to find nearby social grounds</p>
                    </div>
                  ) : socialgrounds.length === 0 ? (
                    <div className="empty-state">
                      <span className="text-4xl">😕</span>
                      <p className="text-sm">No social grounds found in this area</p>
                    </div>
                  ) : (
                    socialgrounds.map((ground, i) => (
                      <div
                        key={ground._id}
                        onClick={() => navigate(`/grounds/${ground._id}`)}
                        className="ground-card animate-cardIn"
                        style={{ animationDelay: `${i * 0.05}s`, borderColor: 'rgba(234,179,8,0.3)' }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                            {ground.name}
                            <span className="text-[10px] bg-yellow-400 text-black px-1.5 py-0.5 rounded font-bold tracking-widest leading-none">SOCIAL</span>
                          </p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="dist-badge" style={{ color: '#eab308', borderColor: 'rgba(234,179,8,0.2)', background: 'rgba(234,179,8,0.1)' }}>{position ? getDistance(position[0], position[1], ground.location.coordinates[1], ground.location.coordinates[0]) : ''}</span>
                            <span className="text-yellow-400 font-bold text-sm">Free</span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-xs mb-2">📍 {ground.address}</p>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          <span className="text-xs bg-blue-400/8 border border-blue-400/15 text-blue-400 px-2 py-0.5 rounded-full capitalize">🏟️ {ground.sport}</span>
                          <span className="text-xs bg-black/4 dark:bg-white/4 border border-black/8 dark:border-white/8 text-gray-500 px-2 py-0.5 rounded-full">{ground.slots?.filter(s => !s.isBooked).length || 0} slots free</span>
                        </div>
                        <p className="text-yellow-400/80 text-xs font-semibold">Tap to view & book free →</p>
                      </div>
                    ))
                  )}
                </>
              )}

              {activeTab === 'grounds' && (
                <>
                  {!searched ? (
                    <div className="empty-state">
                      <span className="text-4xl">🏟️</span>
                      <p className="text-sm">Search to find nearby grounds</p>
                    </div>
                  ) : grounds.length === 0 ? (
                    <div className="empty-state">
                      <span className="text-4xl">😕</span>
                      <p className="text-sm">No grounds found in this area</p>
                    </div>
                  ) : (
                    grounds.map((ground, i) => (
                      <div
                        key={ground._id}
                        onClick={() => navigate(`/grounds/${ground._id}`)}
                        className="ground-card animate-cardIn"
                        style={{ animationDelay: `${i * 0.05}s` }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{ground.name}</p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="dist-badge">{position ? getDistance(position[0], position[1], ground.location.coordinates[1], ground.location.coordinates[0]) : ''}</span>
                            <span className="text-green-400 font-bold text-sm">₹{ground.pricePerHour}/hr</span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-xs mb-2">📍 {ground.address}</p>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          <span className="text-xs bg-blue-400/8 border border-blue-400/15 text-blue-400 px-2 py-0.5 rounded-full capitalize">🏟️ {ground.sport}</span>
                          <span className="text-xs bg-black/4 dark:bg-white/4 border border-black/8 dark:border-white/8 text-gray-500 px-2 py-0.5 rounded-full">{ground.slots?.filter(s => !s.isBooked).length || 0} slots free</span>
                        </div>
                        <p className="text-green-400/60 text-xs">Tap to view & book →</p>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapSearch;