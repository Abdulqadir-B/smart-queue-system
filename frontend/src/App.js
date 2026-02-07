import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { CssBaseline, Box, useTheme as useMuiTheme } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerView from './pages/CustomerView';
import StaffView from './pages/StaffView';
import AdminView from './pages/AdminView';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

function AppContent() {
  const location = useLocation();
  const theme = useMuiTheme();
  
  // Routes that should not show header and footer
  const noLayoutRoutes = ['/unauthorized'];
  const showLayout = !noLayoutRoutes.includes(location.pathname);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      bgcolor: theme.palette.background.default,
      color: theme.palette.text.primary
    }}>
      {showLayout && <Header />}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/customer" element={<CustomerView />} />
          <Route 
            path="/staff" 
            element={
              <ProtectedRoute requiredRole={["staff", "admin"]}>
                <StaffView />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminView />
              </ProtectedRoute>
            } 
          />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
      {showLayout && <Footer />}
    </Box>
  );
}

function App() {
  return (
    <AuthProvider>
      <CssBaseline />
      <AppContent />
    </AuthProvider>
  );
}

export default App;