/**
 * Header Component
 * 
 * XSS Protection Notes:
 * - React automatically escapes all JSX expressions like {user.username}
 * - No dangerouslySetInnerHTML used in this component
 * - User data (username, email) is safely rendered via JSX
 * - All user inputs are sanitized before being sent to API (see sanitize.js)
 * - displaySanitizer.js available for additional protection if needed
 */

import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Menu, 
  MenuItem,
  useMediaQuery,
  useTheme as useMuiTheme,
  Chip,
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import GroupIcon from '@mui/icons-material/Group';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { mode, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [mobileAnchorEl, setMobileAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const handleMobileMenuOpen = (event) => {
    setMobileAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileAnchorEl(null);
  };

  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMobileMenuClose();
    handleProfileMenuClose();
    // Leave protected routes before clearing auth, or ProtectedRoute sends users to /unauthorized (shown as "404")
    navigate('/', { replace: true });
    await logout();
  };

  const handleDeleteAccountClick = () => {
    setDeleteDialogOpen(true);
    handleProfileMenuClose();
    handleMobileMenuClose();
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteAccountConfirm = async () => {
    try {
      const result = await deleteAccount();
      if (result.success) {
        setDeleteDialogOpen(false);
        navigate('/login');
      } else {
        alert(result.message || 'Failed to delete account');
      }
    } catch (error) {
      alert('Failed to delete account. Please try again.');
    }
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Get role color
  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return 'error';
      case 'staff': return 'warning';
      case 'customer': return 'info';
      default: return 'default';
    }
  };

  // Filter nav items based on user role
  const getNavItems = () => {
    const baseItems = [
      { title: 'Home', path: '/', public: true },
      { title: 'Customer', path: '/customer', public: true },
    ];

    if (isAuthenticated) {
      if (user?.role === 'staff' || user?.role === 'admin') {
        baseItems.push({ title: 'Staff', path: '/staff', public: false });
      }
      if (user?.role === 'admin') {
        baseItems.push({ title: 'Admin', path: '/admin', public: false });
      }
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <AppBar 
      position="static" 
      elevation={1}
      sx={{ 
        backgroundColor: mode === 'light' ? 'white' : undefined,
        color: mode === 'light' ? 'primary.main' : undefined,
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 4 } }}>
        <Box
          component={Link}
          to="/"
          sx={{ 
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            textDecoration: 'none',
            color: 'inherit',
            cursor: 'pointer',
          }}
        >
          <GroupIcon 
            sx={{ 
              fontSize: { xs: 28, sm: 34 },
              color: 'primary.main',
            }} 
          />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 800,
              letterSpacing: '1px',
              color: 'primary.main',
              fontSize: { xs: '1.15rem', sm: '1.3rem' },
            }}
          >
            SQM
          </Typography>
        </Box>
        
        {/* Right Side Navigation and Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
          {/* Theme Toggle */}
          {!isMobile && (
            <IconButton 
              color="inherit" 
              onClick={toggleTheme}
              aria-label="toggle theme"
            >
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          )}

          {/* Desktop Navigation */}
          {!isMobile && (
            <>
              {navItems.map((item) => (
                <Button 
                  key={item.title} 
                  color="primary" 
                  component={Link} 
                  to={item.path}
                  sx={{ 
                    borderRadius: '4px',
                    minWidth: '100px',
                    px: 2,
                    '&:hover': {
                      backgroundColor: mode === 'light' ? 'rgba(25, 118, 210, 0.08)' : 'rgba(61, 139, 248, 0.08)'
                    }
                  }}
                >
                  {item.title}
                </Button>
              ))}
              
              {/* Login Button for Non-authenticated Users */}
              {!isAuthenticated && (
                <Button
                  color="primary"
                  variant="contained"
                  component={Link}
                  to="/login"
                  startIcon={<LoginIcon />}
                  sx={{ ml: 1 }}
                >
                  Login
                </Button>
              )}
            </>
          )}

          {/* User Profile Section - Desktop with spacing */}
          {isAuthenticated && user && !isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 3 }}>
              {(user.role === 'admin' || user.role === 'staff') ? (
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                    {user.username || user.email}
                  </Typography>
                  <Chip 
                    label={user.role.toUpperCase()} 
                    size="small" 
                    color={getRoleColor(user.role)}
                    sx={{ 
                      height: '18px',
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      mt: 0.5
                    }}
                  />
                </Box>
              ) : (
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user.username || user.email}
                </Typography>
              )}
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{
                  padding: 0.5,
                  border: '2px solid',
                  borderColor: 'primary.main',
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 36, 
                    height: 36,
                    bgcolor: 'primary.main',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}
                >
                  {getInitials(user.username || user.email)}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  sx: { mt: 1.5, minWidth: 200 }
                }}
              >
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {user.username || 'User'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
                <MenuItem 
                  onClick={handleDeleteAccountClick} 
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'text.primary',
                      '& .MuiListItemIcon-root': {
                        color: 'text.primary'
                      }
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: 'text.secondary' }}>
                    <DeleteIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Delete Account</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Box>

        {/* Mobile Menu */}
        {isMobile && (
          <>
            {/* Theme Toggle for Mobile */}
            <IconButton 
              color="inherit" 
              onClick={toggleTheme}
              aria-label="toggle theme"
              sx={{ mr: 1 }}
            >
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            
            <IconButton
              color="inherit"
              aria-label="open menu"
              edge="start"
              onClick={handleMobileMenuOpen}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={mobileAnchorEl}
              open={Boolean(mobileAnchorEl)}
              onClose={handleMobileMenuClose}
              keepMounted
              PaperProps={{
                sx: { minWidth: 200 }
              }}
            >
              {/* User Info in Mobile Menu */}
              {isAuthenticated && user && (
                <>
                  <Box sx={{ px: 2, py: 1.5, bgcolor: 'action.hover' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: (user.role === 'admin' || user.role === 'staff') ? 1 : 0 }}>
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32,
                          bgcolor: 'primary.main',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {getInitials(user.username || user.email)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                          {user.username || 'User'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                    {(user.role === 'admin' || user.role === 'staff') && (
                      <Chip 
                        label={user.role.toUpperCase()} 
                        size="small" 
                        color={getRoleColor(user.role)}
                        sx={{ 
                          height: '20px',
                          fontSize: '0.65rem',
                          fontWeight: 'bold'
                        }}
                      />
                    )}
                  </Box>
                  <Divider />
                </>
              )}
              
              {navItems.map((item) => (
                <MenuItem 
                  key={item.title} 
                  onClick={handleMobileMenuClose}
                  component={Link}
                  to={item.path}
                >
                  {item.title}
                </MenuItem>
              ))}
              {isAuthenticated ? (
                <>
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                    <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
                    Logout
                  </MenuItem>
                  <MenuItem 
                    onClick={handleDeleteAccountClick} 
                    sx={{ 
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'text.primary',
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <DeleteIcon sx={{ mr: 1, color: 'inherit' }} fontSize="small" />
                    Delete Account
                  </MenuItem>
                </>
              ) : (
                <MenuItem onClick={handleMobileMenuClose} component={Link} to="/login">
                  <LoginIcon sx={{ mr: 1 }} fontSize="small" />
                  Login
                </MenuItem>
              )}
            </Menu>
          </>
        )}
      </Toolbar>
      
      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title" sx={{ color: 'error.main' }}>
          Delete Account?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete your account? This action is permanent and cannot be undone. 
            All your data will be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleDeleteDialogClose} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteAccountConfirm} 
            variant="contained" 
            color="error"
            autoFocus
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default Header;
