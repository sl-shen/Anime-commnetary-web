import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/LoginPage';
import Register from './pages/RegisterPage';
import Home from './pages/HomePage';
import Library from './pages/LibraryPage';
import MediaDetail from './pages/MediaDetailPage';
import Settings from './pages/SettingPage';
import GroupLibrary from './components/GroupLibrary';
import GroupDetail from './components/GroupDetail';
import GroupMediaDetail from './pages/GroupMediaDetailPage'; 
import Discussion from './components/Discussion';

const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? element : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-16">
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/home" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/home" />} />
          <Route path="/home" element={<PrivateRoute element={<Home />} />} />
          <Route path="/library" element={<PrivateRoute element={<Library />} />} />
          <Route path="/media/:id" element={<PrivateRoute element={<MediaDetail />} />} />
          <Route path="/groups" element={<GroupLibrary />} />
          <Route path="/groups/:id" element={<GroupDetail />} />
          <Route path="/groups/:groupId/media/:mediaId" element={<GroupMediaDetail />} />
          <Route path="/settings" element={<PrivateRoute element={<Settings />} />} />
          <Route path="/" element={<Navigate replace to={isAuthenticated ? "/home" : "/login"} />} />
          <Route path="/groups/:groupId/media/:mediaId/discussions" element={<Discussion />} />
        </Routes>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;