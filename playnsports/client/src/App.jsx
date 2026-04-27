import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import OTPLogin from './pages/OTPLogin';
import MapSearch from './pages/MapSearch';
import GroundDetail from './pages/GroundDetail';
import PlayerDashboard from './pages/PlayerDashboard';
import GroundOwnerDashboard from './pages/GroundOwnerDashboard';
import ProfilePage from './pages/ProfilePage';
import GroupPage from './pages/GroupPage';
import ChatPage from './pages/ChatPage';
import ProtectedRoute from './routes/ProtectedRoute';
import GoogleSuccess from './pages/GoogleSuccess';
import CoachDashboard from './pages/CoachDashboard';
import CoachesPage from './pages/CoachesPage';
import CoachProfile from './pages/CoachProfile';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/otp-login" element={<OTPLogin />} />
      <Route path="/auth/google/success" element={<GoogleSuccess />} />
      <Route path="/coaches" element={<ProtectedRoute><CoachesPage /></ProtectedRoute>} />
      <Route path="/coaches/:id" element={<CoachProfile />} />
      <Route path="/map" element={<ProtectedRoute><MapSearch /></ProtectedRoute>} />
      <Route path="/grounds/:id" element={<ProtectedRoute><GroundDetail /></ProtectedRoute>} />
      <Route path="/player/dashboard" element={<ProtectedRoute role="player"><PlayerDashboard /></ProtectedRoute>} />
      <Route path="/owner/dashboard" element={<ProtectedRoute role="ground_owner"><GroundOwnerDashboard /></ProtectedRoute>} />
      <Route path="/coach/dashboard" element={<ProtectedRoute role="coach"><CoachDashboard /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminPanel /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/groups" element={<ProtectedRoute><GroupPage /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/chat/:conversationId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;