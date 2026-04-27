import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
      .font-bebas { font-family: 'Bebas Neue', cursive; }
      .font-dm { font-family: 'DM Sans', sans-serif; }
      @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes menuSlide { from { opacity: 0; transform: translateY(-20px) scaleY(0.95); } to { opacity: 1; transform: translateY(0) scaleY(1); } }
      .nav-animate { animation: slideDown 0.4s ease forwards; }
      .menu-animate { animation: menuSlide 0.25s ease forwards; transform-origin: top; }
      .nav-link-active::after { content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 2px; background: #4ade80; border-radius: 2px; }
      .avatar-glow:hover { box-shadow: 0 0 0 3px rgba(74,222,128,0.4); }
      .hamburger span { display: block; width: 22px; height: 2px; background: var(--text-main); border-radius: 2px; transition: all 0.3s ease; }
      .hamburger.open span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
      .hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
      .hamburger.open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, children }) => (
    <Link to={to} className={`relative text-sm font-medium transition-colors duration-200 ${isActive(to) ? 'text-green-400 nav-link-active' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
      {children}
    </Link>
  );

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 font-dm nav-animate transition-all duration-300 ${scrolled ? 'bg-white/90 dark:bg-black/90 backdrop-blur-xl border-b border-black/10 dark:border-white/10 shadow-2xl shadow-black/50' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center group-hover:bg-green-300 transition-colors duration-200">
              <span className="text-black text-sm font-black">S</span>
            </div>
            <span className="text-xl tracking-widest text-gray-900 dark:text-white group-hover:text-green-400 transition-colors duration-200">spotNplay</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {user && (
              <>
                {user.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
                {user.role === 'player' && <NavLink to="/player/dashboard">Dashboard</NavLink>}
                {user.role === 'coach' && <NavLink to="/coach/dashboard">Dashboard</NavLink>}
                {user.role === 'ground_owner' && <NavLink to="/owner/dashboard">Dashboard</NavLink>}
                
                <NavLink to="/map">Map</NavLink>
                <NavLink to="/groups">Groups</NavLink>
                <NavLink to="/coaches">Coaches</NavLink>
                <NavLink to="/chat">Chat</NavLink>

                
              </>
            )}
            {/* {!user && <NavLink to="/coaches">Coaches</NavLink>} */}
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-xl focus:outline-none" title="Toggle Theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            {user ? (
              <>
                <Link to="/profile" className="flex items-center gap-3 group">
                  <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 hover:border-green-500/30 rounded-2xl px-3 py-2 transition-all duration-200">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="avatar" className="w-7 h-7 rounded-full object-cover border border-green-400/50 avatar-glow transition-all duration-200" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center text-xs text-green-400 font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:text-white transition-colors">{user.name}</span>
                  </div>
                </Link>
                <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-400 border border-black/10 dark:border-white/10 hover:border-red-500/30 px-4 py-2 rounded-xl transition-all duration-200">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors duration-200">Login</Link>
                <Link to="/register" className="text-sm bg-green-400 hover:bg-green-300 text-black font-semibold px-5 py-2 rounded-xl transition-all duration-200">Get Started</Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className={`md:hidden hamburger ${menuOpen ? 'open' : ''} flex flex-col gap-[5px] p-2`}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed top-[65px] left-0 right-0 z-40 md:hidden menu-animate">
          <div className="mx-4 bg-[#111] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex flex-col p-4 gap-1">
              <button onClick={toggleTheme} className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:text-white transition-all text-left mb-2 border border-black/5 dark:border-white/5 font-semibold focus:outline-none">
                <span>{theme === 'dark' ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}</span>
              </button>
              {user ? (
                <>
                  <Link to="/map" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:text-white transition-all">
                    <span>🗺️</span> Map
                  </Link>
                  <Link to="/groups" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:text-white transition-all">
                    <span>👥</span> Groups
                  </Link>
                  <Link to="/coaches" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:text-white transition-all">
                    <span>🏋️</span> Coaches
                  </Link>
                  <Link to="/chat" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:text-white transition-all">
                    <span>💬</span> Chat
                  </Link>
                  {user.role === 'player' && (
                    <Link to="/player/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:text-white transition-all">
                      <span>⚡</span> Dashboard
                    </Link>
                  )}
                  {user.role === 'coach' && (
                    <Link to="/coach/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:text-white transition-all">
                      <span>🏋️</span> Dashboard
                    </Link>
                  )}
                  {user.role === 'ground_owner' && (
                    <Link to="/owner/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:text-white transition-all">
                      <span>🏟️</span> Dashboard
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:bg-white/5 text-green-400 hover:text-green-300 transition-all">
                      <span>🛡️</span> Admin Panel
                    </Link>
                  )}
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:text-white transition-all">
                    <span>👤</span> Profile
                  </Link>
                  <div className="h-px bg-black/5 dark:bg-white/5 my-2" />
                  <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-gray-600 dark:text-gray-400 hover:text-red-400 transition-all text-left">
                    <span>🚪</span> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/coaches" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:text-white transition-all">
                    <span>🏋️</span> Coaches
                  </Link>
                  <Link to="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:text-white transition-all">
                    <span>🔑</span> Login
                  </Link>
                  <Link to="/otp-login" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:text-white transition-all">
                    <span>📧</span> Login with OTP
                  </Link>
                  <Link to="/register" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-400/10 text-green-400 hover:bg-green-400/20 transition-all">
                    <span>🚀</span> Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="h-[65px]" />
    </>
  );
};

export default Navbar;