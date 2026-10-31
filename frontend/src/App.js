import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, useLocation } from 'react-router-dom';
import { CssBaseline, Box, useTheme as useMuiTheme } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import SeoMeta from './components/common/SeoMeta';
import { Analytics } from '@vercel/analytics/react';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const CustomerView = lazy(() => import('./pages/CustomerView'));
const StaffView = lazy(() => import('./pages/StaffView'));
const AdminView = lazy(() => import('./pages/AdminView'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));

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
      <SeoMeta />
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
      <Analytics />
      <Suspense fallback={<Box sx={{ minHeight: '100vh' }} />}>
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
      </Suspense>
    </AuthProvider>
  );
}

export default App;
