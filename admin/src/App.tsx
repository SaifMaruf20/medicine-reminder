import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminMedicinesPage } from './pages/AdminMedicinesPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminNotificationsPage } from './pages/AdminNotificationsPage';

const RootRedirect = () => {
  const token = localStorage.getItem('admin_token');
  return <Navigate to={token && token !== 'undefined' ? '/dashboard' : '/login'} replace />;
};

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<AdminLoginPage />} />
        <Route path="/dashboard" element={<AdminDashboardPage />} />
        <Route path="/medicines" element={<AdminMedicinesPage />} />
        <Route path="/users" element={<AdminUsersPage />} />
        <Route path="/notifications" element={<AdminNotificationsPage />} />

        {/* Support /admin prefix if accessed via subpath */}
        <Route path="/admin" element={<RootRedirect />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/medicines" element={<AdminMedicinesPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/notifications" element={<AdminNotificationsPage />} />

        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;
