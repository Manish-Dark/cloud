import React, { useState } from 'react';
import {
  AppBar, Box, CssBaseline, Divider, Drawer, IconButton,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Typography, Tooltip, Avatar, Chip
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ViewListIcon from '@mui/icons-material/ViewList';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import LogoutIcon from '@mui/icons-material/Logout';
import LayersIcon from '@mui/icons-material/Layers';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import CloudIcon from '@mui/icons-material/Cloud';
import StorageIcon from '@mui/icons-material/Storage';
import FolderIcon from '@mui/icons-material/Folder';
import SecurityIcon from '@mui/icons-material/Security';
import WifiIcon from '@mui/icons-material/Wifi';
import MenuIcon from '@mui/icons-material/Menu';
import Clock from './Clock';
import { useThemeContext } from '../ThemeContext';
import './Layout.css';

const drawerWidth = 250;

interface Props {
  children: React.ReactNode;
}

const floatingOrbs = [
  { size: 300, left: '70%', top: '-80px',  color: 'rgba(99,102,241,0.08)',  delay: '0s',   dur: '18s' },
  { size: 200, left: '85%', top: '40%',    color: 'rgba(236,72,153,0.06)',  delay: '3s',   dur: '22s' },
  { size: 250, left: '60%', top: '70%',    color: 'rgba(20,184,166,0.07)',  delay: '6s',   dur: '20s' },
  { size: 180, left: '5%',  top: '20%',    color: 'rgba(245,158,11,0.05)',  delay: '1.5s', dur: '25s' },
  { size: 220, left: '10%', top: '65%',    color: 'rgba(139,92,246,0.07)', delay: '4s',   dur: '16s' },
];

const floatingIcons = [
  { Icon: CloudIcon,    size: 28, right: '5%',   top: '22%', delay: '0s',   dur: '7s'  },
  { Icon: StorageIcon,  size: 22, right: '15%',  top: '55%', delay: '2s',   dur: '9s'  },
  { Icon: FolderIcon,   size: 20, right: '3%',   top: '75%', delay: '4s',   dur: '6s'  },
  { Icon: SecurityIcon, size: 18, right: '20%',  top: '85%', delay: '1s',   dur: '8s'  },
  { Icon: WifiIcon,     size: 24, right: '12%',  top: '35%', delay: '3s',   dur: '10s' },
];

const Layout: React.FC<Props> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { mode, toggleTheme } = useThemeContext();
  const location = useLocation();
  const navigate = useNavigate();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  const navItems = [
    { label: 'Storages', icon: <ViewListIcon />, to: '/storages', match: '/storages' },
    { label: 'Storage Workers', icon: <SmartToyIcon />, to: '/storage_workers', match: '/storage_workers' },
  ];

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Sidebar Brand */}
      <Box sx={{
        px: 2.5, py: 2,
        background: 'linear-gradient(135deg, #1e1b4b 0%, #12104a 50%, #0f172a 100%)',
        minHeight: 64,
        display: 'flex', alignItems: 'center', gap: 1.5,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* brand bg glow */}
        <Box sx={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', background: 'rgba(129,140,248,0.15)', top: -40, right: -20, filter: 'blur(20px)' }} />
        <Avatar sx={{ width: 36, height: 36, background: 'linear-gradient(135deg, #818cf8, #a78bfa)', boxShadow: '0 0 16px rgba(129,140,248,0.5)' }}>
          <LayersIcon sx={{ fontSize: 20 }} />
        </Avatar>
        <Box>
          <Typography sx={{ fontWeight: 800, color: 'white', fontSize: '0.95rem', lineHeight: 1 }}>
            Cloud Server
          </Typography>
          <Typography sx={{ color: 'rgba(129,140,248,0.8)', fontSize: '0.65rem', letterSpacing: 1 }}>
            MANISH-DARK
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      {/* Nav section */}
      <Box sx={{ px: 1.5, pt: 2, flexGrow: 1 }}>
        <Typography variant="caption" sx={{ px: 1, color: 'text.disabled', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', fontSize: '0.6rem' }}>
          Navigation
        </Typography>
        <List sx={{ mt: 0.5 }}>
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.match);
            return (
              <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  to={item.to}
                  selected={active}
                  sx={{
                    borderRadius: 2.5,
                    py: 1.3, px: 1.5,
                    background: active
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.12))'
                      : 'transparent',
                    borderLeft: active ? '3px solid #818cf8' : '3px solid transparent',
                    '&:hover': { background: 'rgba(99,102,241,0.1)' },
                    '&.Mui-selected': { bgcolor: 'transparent' },
                    transition: 'all 0.25s ease',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: active ? '#818cf8' : 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontWeight: active ? 700 : 500, fontSize: '0.88rem', color: active ? '#818cf8' : 'inherit' }}>
                        {item.label}
                      </Typography>
                    }
                  />
                  {active && (
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#818cf8', boxShadow: '0 0 8px #818cf8' }} />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Sidebar footer */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Chip
          icon={<SecurityIcon style={{ fontSize: 14 }} />}
          label="Secure Connection"
          size="small"
          sx={{
            width: '100%',
            borderRadius: 2,
            fontSize: '0.7rem',
            bgcolor: 'rgba(16,185,129,0.1)',
            color: '#10b981',
            border: '1px solid rgba(16,185,129,0.2)',
            '& .MuiChip-icon': { color: '#10b981' },
          }}
        />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* ── AppBar ── */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: mode === 'dark'
            ? 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,27,75,0.95) 100%)'
            : 'linear-gradient(135deg, rgba(30,27,75,0.97) 0%, rgba(15,23,42,0.97) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(129,140,248,0.15)',
          boxShadow: '0 4px 32px rgba(99,102,241,0.12)',
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <IconButton color="inherit" sx={{ display: { sm: 'none' }, mr: 1 }} onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Avatar sx={{ width: 34, height: 34, background: 'linear-gradient(135deg, #818cf8, #a78bfa)', mr: 1, boxShadow: '0 0 12px rgba(129,140,248,0.4)', display: { xs: 'none', sm: 'flex' } }}>
            <LayersIcon sx={{ fontSize: 18 }} />
          </Avatar>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 800, letterSpacing: 0.5, background: 'linear-gradient(90deg, #fff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Cloud Server
          </Typography>

          {/* Status chip */}
          <Chip
            icon={<WifiIcon style={{ fontSize: 12, color: '#10b981' }} />}
            label="Online"
            size="small"
            sx={{
              display: { xs: 'none', md: 'flex' },
              bgcolor: 'rgba(16,185,129,0.1)',
              color: '#10b981',
              border: '1px solid rgba(16,185,129,0.25)',
              fontSize: '0.7rem',
              height: 24,
              mr: 1,
              '& .MuiChip-icon': { color: '#10b981' },
            }}
          />

          <Clock />

          <Tooltip title={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}>
            <IconButton onClick={toggleTheme} sx={{ ml: 1, color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#a5b4fc', bgcolor: 'rgba(129,140,248,0.1)' }, borderRadius: 2 }}>
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Logout">
            <IconButton onClick={handleLogout} sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#f87171', bgcolor: 'rgba(248,113,113,0.1)' }, borderRadius: 2 }}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* ── Drawer ── */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid rgba(129,140,248,0.1)' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* ── Main Content ── */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          bgcolor: 'background.default',
        }}
      >
        {/* Floating orb backgrounds */}
        {floatingOrbs.map((orb, i) => (
          <Box
            key={i}
            className="layout-orb"
            sx={{
              position: 'absolute',
              width: orb.size,
              height: orb.size,
              left: orb.left,
              top: orb.top,
              borderRadius: '50%',
              background: orb.color,
              filter: 'blur(60px)',
              animationDelay: orb.delay,
              animationDuration: orb.dur,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        ))}

        {/* Floating icons in background */}
        {floatingIcons.map(({ Icon, size, right, top, delay, dur }, i) => (
          <Box
            key={i}
            className="layout-float-icon"
            sx={{
              position: 'absolute',
              right,
              top,
              animationDelay: delay,
              animationDuration: dur,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          >
            <Icon sx={{ fontSize: size, opacity: 0.04, color: 'primary.main' }} />
          </Box>
        ))}

        <Toolbar />

        {/* Page content */}
        <Box sx={{ flexGrow: 1, p: 3, position: 'relative', zIndex: 1 }}>
          {children}
        </Box>

        {/* ── Footer ── */}
        <Box
          component="footer"
          sx={{
            position: 'relative',
            zIndex: 1,
            mt: 'auto',
            px: 3,
            py: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
            background: mode === 'dark'
              ? 'linear-gradient(135deg, rgba(15,23,42,0.8), rgba(30,27,75,0.5))'
              : 'linear-gradient(135deg, rgba(248,250,252,0.9), rgba(241,245,249,0.9))',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 22, height: 22, background: 'linear-gradient(135deg, #818cf8, #a78bfa)' }}>
              <LayersIcon sx={{ fontSize: 12 }} />
            </Avatar>
            <Typography variant="caption" sx={{ fontWeight: 700, background: 'linear-gradient(90deg, #818cf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Manish-Dark
            </Typography>
          </Box>
          <Typography variant="caption" color="text.disabled" sx={{ letterSpacing: 0.3 }}>
            © {new Date().getFullYear()} Manish-Dark Cloud Storage
          </Typography>
          <Chip
            label="v1.0.0"
            size="small"
            sx={{ height: 18, fontSize: '0.6rem', bgcolor: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
