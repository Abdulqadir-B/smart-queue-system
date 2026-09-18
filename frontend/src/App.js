import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet, useLocation } from 'react-router-dom';
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
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

function Layout() {
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
        <Outlet />
      </Box>
      {showLayout && <Footer />}
    </Box>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "customer", element: <CustomerView /> },
      { path: "privacy", element: <Privacy /> },
      { path: "terms", element: <Terms /> },
      { 
        path: "staff", 
        element: (
          <ProtectedRoute requiredRole={["staff", "admin"]}>
            <StaffView />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "admin", 
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminView />
          </ProtectedRoute>
        ) 
      },
      { path: "unauthorized", element: <Unauthorized /> },
      { path: "*", element: <NotFound /> }
    ]
  }
], {
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  }
});

function App() {
  return (
    <AuthProvider>
      <CssBaseline />
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </AuthProvider>
  );
}

export default App;
